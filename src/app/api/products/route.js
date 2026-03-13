import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET all products
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const active = searchParams.get('active');

    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (category) {
      query += ` AND category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    if (search) {
      query += ` AND (name ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    // Only filter by active if explicitly requested
    if (active === 'true') {
      query += ` AND is_active = true`;
    } else if (active === 'false') {
      query += ` AND is_active = false`;
    }

    query += ' ORDER BY created_at DESC';

    const { rows } = await pool.query(query, params);

    console.log('Fetched products:', rows.length);

    const products = rows.map(row => {
      // Parse PostgreSQL TEXT[] array to JavaScript array
      let imagesArray = [];
      if (row.images && typeof row.images === 'string') {
        // PostgreSQL array format: "{/path1,/path2}"
        imagesArray = row.images
          .replace(/[{}]/g, '')
          .split(',')
          .filter(img => img.trim().length > 0);
      } else if (Array.isArray(row.images)) {
        imagesArray = row.images;
      }

      return {
        id: row.id,
        name: row.name,
        description: row.description || '',
        category: row.category,
        price: parseFloat(row.price),
        originalPrice: row.original_price ? parseFloat(row.original_price) : null,
        stock: row.stock || 0,
        discount: row.discount ? parseFloat(row.discount) : null,
        rating: parseFloat(row.rating) || 0,
        reviews: row.reviews || 0,
        image: row.image || (imagesArray.length > 0 ? imagesArray[0] : '/placeholder.jpg'),
        images: imagesArray,
        specifications: row.specifications || {},
        colors: row.colors || [],
        storageOptions: row.storage_options || [],
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching products', error: error.message },
      { status: 500 }
    );
  }
}

// POST create new product
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      category,
      price,
      originalPrice,
      stock,
      discount,
      image,
      images,
      specifications,
      colors,
      storageOptions,
      isActive,
    } = body;

    console.log('Creating product with data:', { name, category, price, isActive });

    if (!name || !category || !price) {
      return NextResponse.json(
        { message: 'Name, category, and price are required' },
        { status: 400 }
      );
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    console.log('Executing INSERT query for product:', name, { image, images });

    // Auto-set main image to first image if not provided
    const mainImage = image || (images && images.length > 0 ? images[0] : null);

    try {
      const { rows } = await pool.query(
        `INSERT INTO products (
          name, slug, description, category, price, original_price, stock, discount,
          image, images, specifications, colors, storage_options, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *`,
        [
          name,
          slug,
          description || null,
          category,
          price,
          originalPrice || null,
          stock || 0,
          discount || null,
          mainImage || null,
          images || '{}',  // PostgreSQL array literal
          JSON.stringify(specifications || {}),
          JSON.stringify(colors || []),
          JSON.stringify(storageOptions || []),
          isActive !== false,
        ]
      );

      const product = rows[0];
      console.log('Successfully created product:', product.id, product.name);

      return NextResponse.json({
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        price: parseFloat(product.price),
        originalPrice: product.original_price ? parseFloat(product.original_price) : null,
        stock: product.stock,
        discount: product.discount ? parseFloat(product.discount) : null,
        image: product.image,
        images: product.images || [],
        specifications: product.specifications || {},
        colors: product.colors || [],
        storageOptions: product.storage_options || [],
        isActive: product.is_active,
        createdAt: product.created_at,
        updatedAt: product.updated_at,
      }, { status: 201 });
    } catch (dbError) {
      console.error('Database error during product creation:', dbError);
      return NextResponse.json(
        { message: 'Database error occurred while creating product', error: dbError.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unexpected error in POST /api/products:', error);
    if (error.stack) console.error('Stack trace:', error.stack);
    
    // Check if it's likely a body size issue
    const isLargePayload = request.headers.get('content-length') && parseInt(request.headers.get('content-length')) > 4000000;
    
    return NextResponse.json(
      { 
        message: 'An unexpected error occurred while creating product', 
        error: error.message,
        hint: isLargePayload ? 'The image size might be too large. Try a smaller image or compress it.' : undefined
      },
      { status: 500 }
    );
  }
}

// Config for API body size (Note: App Router support varies, but adding for compatibility)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
