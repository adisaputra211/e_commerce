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

    console.log('Creating categories table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        icon VARCHAR(100),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Adding icon column to categories table...');
    await client.query(`
      ALTER TABLE categories
      ADD COLUMN IF NOT EXISTS icon VARCHAR(100);
    `);

    console.log('Creating products table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE,
        description TEXT,
        category_id INTEGER REFERENCES categories(id),
        category VARCHAR(50) NOT NULL,
        price DECIMAL(15, 2) NOT NULL,
        original_price DECIMAL(15, 2),
        stock INTEGER DEFAULT 0,
        discount DECIMAL(5, 2),
        rating DECIMAL(3, 2) DEFAULT 0,
        reviews INTEGER DEFAULT 0,
        image TEXT,
        images TEXT[],
        specifications JSONB DEFAULT '{}',
        colors JSONB DEFAULT '[]',
        storage_options JSONB DEFAULT '[]',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Creating orders table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        order_number VARCHAR(50) UNIQUE NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        total_amount DECIMAL(15, 2) NOT NULL,
        shipping_cost DECIMAL(15, 2) DEFAULT 0,
        shipping_address JSONB,
        payment_method VARCHAR(50),
        payment_status VARCHAR(50) DEFAULT 'pending',
        tracking_number VARCHAR(100),
        courier_name VARCHAR(100),
        customer_name VARCHAR(255),
        customer_email VARCHAR(255),
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Creating order_items table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price DECIMAL(15, 2) NOT NULL,
        color VARCHAR(100),
        storage VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Creating cart table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS cart (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Creating cart_items table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id SERIAL PRIMARY KEY,
        cart_id INTEGER REFERENCES cart(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL DEFAULT 1,
        color VARCHAR(100),
        storage VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Seeding categories...');
    const categories = [
      { name: 'Smartphones', slug: 'hp', icon: 'smartphone', description: 'Latest smartphones and mobile devices' },
      { name: 'Tablets', slug: 'tablet', icon: 'tablet_mac', description: 'Tablets and iPad devices' },
      { name: 'Laptops', slug: 'laptop', icon: 'laptop_mac', description: 'Laptops and notebooks' }
    ];

    for (const category of categories) {
      await client.query(`
        INSERT INTO categories (name, slug, icon, description)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (slug) DO UPDATE
        SET name = EXCLUDED.name,
            icon = EXCLUDED.icon,
            description = EXCLUDED.description;
      `, [category.name, category.slug, category.icon, category.description]);
      console.log(`Seeded category: ${category.name}`);
    }

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
    console.log('');
    console.log('==========================================');
    console.log('Database Tables Created:');
    console.log('- users');
    console.log('- categories');
    console.log('- products');
    console.log('- orders');
    console.log('- order_items');
    console.log('- cart');
    console.log('- cart_items');
    console.log('==========================================');
  } catch (err) {
    console.error('Error setting up database:', err);
  } finally {
    client.release();
    process.exit();
  }
}

setup();
