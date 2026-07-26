const { Pool } = require('pg');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const OUTPUT_DIR = path.join(__dirname, '..', 'exports');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'db_export.xlsx');

const pool = new Pool({ connectionString: process.env.DB_URL });

function toSheetName(tableName, usedNames) {
    let name = tableName.replace(/[\\/*?:[\]]/g, '_').slice(0, 31);
    let unique = name;
    let suffix = 1;
    while (usedNames.has(unique)) {
        const suffixStr = `_${suffix++}`;
        unique = name.slice(0, 31 - suffixStr.length) + suffixStr;
    }
    usedNames.add(unique);
    return unique;
}

function toCellValue(value) {
    if (value === null || value === undefined) return null;
    if (Buffer.isBuffer(value)) return value.toString('hex');
    if (value instanceof Date) return value;
    if (typeof value === 'object') return JSON.stringify(value);
    return value;
}

async function getTableNames(client) {
    const result = await client.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        ORDER BY table_name;
    `);
    return result.rows.map((row) => row.table_name);
}

async function exportTablesToExcel() {
    const client = await pool.connect();
    try {
        console.log('Connected to database.');

        const tableNames = await getTableNames(client);
        console.log(`Found ${tableNames.length} table(s): ${tableNames.join(', ')}`);

        const workbook = new ExcelJS.Workbook();
        const usedSheetNames = new Set();

        for (const tableName of tableNames) {
            const { rows, fields } = await client.query(`SELECT * FROM "${tableName}"`);
            const columnNames = fields.map((field) => field.name);

            const sheet = workbook.addWorksheet(toSheetName(tableName, usedSheetNames));
            sheet.columns = columnNames.map((name) => ({ header: name, key: name, width: 20 }));
            sheet.getRow(1).font = { bold: true };

            for (const row of rows) {
                const rowData = {};
                for (const column of columnNames) {
                    rowData[column] = toCellValue(row[column]);
                }
                sheet.addRow(rowData);
            }

            console.log(`✓ Exported "${tableName}" (${rows.length} row(s))`);
        }

        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        await workbook.xlsx.writeFile(OUTPUT_FILE);
        console.log(`\nExcel file saved to: ${OUTPUT_FILE}`);
    } finally {
        client.release();
        await pool.end();
    }
}

exportTablesToExcel().catch((error) => {
    console.error('Failed to export tables to Excel:', error);
    process.exit(1);
});
