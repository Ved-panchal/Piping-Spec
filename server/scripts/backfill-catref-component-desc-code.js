// Migration + backfill for the catref/component-desc drift bug.
//
// Root cause: catref rows were joined to their component description only by
// matching free-text (item_short_desc === componentDesc.itemDescription).
// Renaming a description (project-level override, same `code`, new text --
// see componentDescController.ts's merge-by-code) silently orphans any catref
// row that still has the old text, producing a blank Catref column with no
// error anywhere. The fix (generateReviewOutputController.ts) now matches by
// the stable `component_desc_code` when present, falling back to the legacy
// text match otherwise.
//
// This script:
//   1. Adds a nullable `component_desc_code` column to catrefs, valv_catrefs,
//      default_catrefs, default_valv_catrefs (additive, safe, reversible).
//   2. Backfills that column for existing rows by matching their CURRENT
//      item_short_desc text against the CURRENT component description list
//      (project-specific override first, then the global default).
//
// Rows whose description text has already drifted (e.g. the TEE Equal/Red,
// BW case, or a catref added for a description that was since renamed) won't
// find a match here -- that's expected. Those still need a human decision
// (which catalog code the renamed description should use) and are exactly
// the rows `node scripts/list-orphaned-catrefs.js` will report afterwards.
//
// Usage:
//   node scripts/backfill-catref-component-desc-code.js            # dry run
//   node scripts/backfill-catref-component-desc-code.js --apply    # applies

require("dotenv").config();
const { Client } = require("pg");

const PROJECT_SCOPED = [
  { catref: "catrefs", desc: "component_descs" },
  { catref: "valv_catrefs", desc: "component_descs" },
];
const DEFAULT_SCOPED = [
  { catref: "default_catrefs", desc: "default_components" },
  { catref: "default_valv_catrefs", desc: "default_components" },
];

async function ensureColumn(client, table, apply) {
  const { rows } = await client.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name = $1 AND column_name = 'component_desc_code'`,
    [table]
  );
  if (rows.length > 0) {
    console.log(`[${table}] column already present`);
    return;
  }
  console.log(`[${table}] column missing${apply ? " -- adding" : " -- would add (dry run)"}`);
  if (apply) {
    await client.query(`ALTER TABLE ${table} ADD COLUMN component_desc_code VARCHAR(255)`);
  }
}

async function backfillProjectScoped(client, catrefTable, descTable, apply) {
  // Prefer a project-specific description override, then fall back to the
  // global default -- same precedence componentDescController.ts uses.
  // (Preview counts don't filter on component_desc_code -- the column may
  // not exist yet on a dry run, and pre-migration every row is unlinked.)
  const projectMatch = await client.query(
    `SELECT c.id FROM ${catrefTable} c
     JOIN ${descTable} cd
       ON cd.component_id = c.component_id
      AND cd.project_id = c.project_id
      AND cd.item_description = c.item_short_desc`
  );
  const defaultMatch = await client.query(
    `SELECT c.id FROM ${catrefTable} c
     JOIN default_components dc
       ON dc.component_id = c.component_id
      AND dc.item_description = c.item_short_desc`
  );
  console.log(`[${catrefTable}] ${projectMatch.rows.length} row(s) match a project-level description, ${defaultMatch.rows.length} row(s) match a default description`);

  if (apply) {
    const r1 = await client.query(
      `UPDATE ${catrefTable} c SET component_desc_code = cd.code
       FROM ${descTable} cd
       WHERE c.component_desc_code IS NULL
         AND cd.component_id = c.component_id
         AND cd.project_id = c.project_id
         AND cd.item_description = c.item_short_desc`
    );
    console.log(`[${catrefTable}] linked ${r1.rowCount} row(s) to a project-level description`);

    const r2 = await client.query(
      `UPDATE ${catrefTable} c SET component_desc_code = dc.code
       FROM default_components dc
       WHERE c.component_desc_code IS NULL
         AND dc.component_id = c.component_id
         AND dc.item_description = c.item_short_desc`
    );
    console.log(`[${catrefTable}] linked ${r2.rowCount} row(s) to a default description`);
  }
}

async function backfillDefaultScoped(client, catrefTable, descTable, apply) {
  const match = await client.query(
    `SELECT c.id FROM ${catrefTable} c
     JOIN ${descTable} dc
       ON dc.component_id = c.component_id
      AND dc.item_description = c.item_short_desc`
  );
  console.log(`[${catrefTable}] ${match.rows.length} row(s) match a default description`);

  if (apply) {
    const r = await client.query(
      `UPDATE ${catrefTable} c SET component_desc_code = dc.code
       FROM ${descTable} dc
       WHERE c.component_desc_code IS NULL
         AND dc.component_id = c.component_id
         AND dc.item_description = c.item_short_desc`
    );
    console.log(`[${catrefTable}] linked ${r.rowCount} row(s)`);
  }
}

async function main() {
  const apply = process.argv.includes("--apply");
  const client = new Client({ connectionString: process.env.DB_URL });
  await client.connect();

  try {
    for (const t of [...PROJECT_SCOPED.map((p) => p.catref), ...DEFAULT_SCOPED.map((p) => p.catref)]) {
      await ensureColumn(client, t, apply);
    }

    for (const { catref, desc } of PROJECT_SCOPED) {
      await backfillProjectScoped(client, catref, desc, apply);
    }
    for (const { catref, desc } of DEFAULT_SCOPED) {
      await backfillDefaultScoped(client, catref, desc, apply);
    }

    if (!apply) {
      console.log("\nDry run only -- no changes made. Re-run with --apply to add the column and backfill matches.");
    }
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
