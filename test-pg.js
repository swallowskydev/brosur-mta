const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:bismillah@localhost:5432/brosur_mta',
  ssl: false
});

async function run() {
  try {
    const dbQuery = `
      WITH matched_sources AS (
        SELECT DISTINCT source
        FROM brochures
        WHERE text ILIKE $1
        LIMIT 2
      )
      SELECT b.source, MAX(b.title) as title, MAX(b.date) as date,
             STRING_AGG(b.text, ' ' ORDER BY SUBSTRING(b.id FROM '-([0-9]+)$')::INTEGER) as text
      FROM brochures b
      JOIN matched_sources ms ON b.source = ms.source
      GROUP BY b.source;
    `;
    const { rows } = await pool.query(dbQuery, ['%zina%']);
    console.log("Success! Extracted rows:", rows.length);
    if(rows.length > 0) {
      console.log("Sample text length:", rows[0].text.length);
      console.log("Sample start:", rows[0].text.substring(0, 100));
    }
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
