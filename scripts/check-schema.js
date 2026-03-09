const pool = require('../src/lib/db').default;
async function check() {
  try {
    const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
    console.log('Columns in users table:', res.rows.map(r => r.column_name));
  } catch (err) {
    console.error('Check failed:', err);
  } finally {
    process.exit();
  }
}
check();
