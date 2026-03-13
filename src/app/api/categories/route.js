import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT * FROM categories ORDER BY name'
    );
    client.release();
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, slug, icon, description } = body;
    
    const client = await pool.connect();
    const result = await client.query(
      `INSERT INTO categories (name, slug, icon, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, slug, icon, description]
    );
    client.release();
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, name, slug, icon, description } = body;
    
    const client = await pool.connect();
    const result = await client.query(
      `UPDATE categories
       SET name = $1, slug = $2, icon = $3, description = $4
       WHERE id = $5
       RETURNING *`,
      [name, slug, icon, description, id]
    );
    client.release();
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    const client = await pool.connect();
    await client.query('DELETE FROM categories WHERE id = $1', [id]);
    client.release();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
