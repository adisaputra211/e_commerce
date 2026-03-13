import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT o.*, u.name as customer_name, u.email as customer_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);
    client.release();
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, status, payment_status, tracking_number, courier_name } = body;
    
    const client = await pool.connect();
    
    const updates = [];
    const values = [];
    let paramCount = 0;
    
    if (status !== undefined) {
      paramCount++;
      updates.push(`status = $${paramCount}`);
      values.push(status);
    }
    
    if (payment_status !== undefined) {
      paramCount++;
      updates.push(`payment_status = $${paramCount}`);
      values.push(payment_status);
    }
    
    if (tracking_number !== undefined) {
      paramCount++;
      updates.push(`tracking_number = $${paramCount}`);
      values.push(tracking_number);
    }
    
    if (courier_name !== undefined) {
      paramCount++;
      updates.push(`courier_name = $${paramCount}`);
      values.push(courier_name);
    }
    
    if (updates.length === 0) {
      client.release();
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }
    
    paramCount++;
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    updates.push(`id = $${paramCount}`);
    values.push(id);
    
    const result = await client.query(`
      UPDATE orders
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, values);
    
    client.release();
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
