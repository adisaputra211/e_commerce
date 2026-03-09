require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

async function setup() {
  const client = await pool.connect();
  try {
    console.log('Creating users table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'user',
        avatar VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Seeding users...');
    
    const users = [
      {
        email: 'admin@gmail.com',
        password: 'admin123',
        name: 'Admin User',
        role: 'admin',
        avatar: 'A'
      },
      {
        email: 'user@gmail.com',
        password: 'user123',
        name: 'John Doe',
        role: 'user',
        avatar: 'J'
      }
    ];

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await client.query(`
        INSERT INTO users (email, password, name, role, avatar)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (email) DO UPDATE 
        SET password = EXCLUDED.password,
            name = EXCLUDED.name,
            role = EXCLUDED.role,
            avatar = EXCLUDED.avatar;
      `, [user.email, hashedPassword, user.name, user.role, user.avatar]);
      console.log(`Seeded user: ${user.email}`);
    }

    console.log('Database setup complete!');
  } catch (err) {
    console.error('Error setting up database:', err);
  } finally {
    client.release();
    process.exit();
  }
}

setup();
