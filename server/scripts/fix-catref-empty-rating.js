// One-off data fix: normalize rating = '' to NULL in catref tables.
//
// Root cause: the CatRef add/edit API used to save an unrated entry's rating
// as an empty string instead of SQL NULL. The review-output generator matches
// catref rows with `cat.rating === null`, so those rows never matched and
// produced a blank Catref column even though the row existed.
// The API bug is fixed in controllers/catrefController.ts; this script repairs
// rows that were already saved with the bad value before that fix.
//
// Usage:
//   node scripts/fix-catref-empty-rating.js            # dry run, lists affected rows
//   node scripts/fix-catref-empty-rating.js --apply    # applies the fix
//
// Uses the DB_URL from this project's .env — point that at whichever
// environment (local/staging/production) you need to fix before running.

require("dotenv").config();
const { Client } = require("pg");

const TABLES = ["catrefs", "valv_catrefs", "default_catrefs", "default_valv_catrefs"];

async function main() {
  const apply = process.argv.includes("--apply");
  const client = new Client({ connectionString: process.env.DB_URL });
  await client.connect();

  try {
    for (const table of TABLES) {
      const hasProject = !table.startsWith("default");
      const { rows } = await client.query(
        `SELECT id, component_id, item_short_desc, catalog${hasProject ? ", project_id" : ""} FROM ${table} WHERE rating = ''`
      );

      if (rows.length === 0) {
        console.log(`[${table}] no affected rows`);
        continue;
      }

      console.log(`[${table}] ${rows.length} row(s) with rating = ''`);
      console.table(rows);

      if (apply) {
        const result = await client.query(`UPDATE ${table} SET rating = NULL WHERE rating = ''`);
        console.log(`[${table}] updated ${result.rowCount} row(s) -> rating = NULL`);
      }
    }

    if (!apply) {
      console.log("\nDry run only — no changes made. Re-run with --apply to fix these rows.");
    }
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
