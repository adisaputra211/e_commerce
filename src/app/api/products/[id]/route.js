import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET single product
export async function GET(request, { params }) {
  try {
    const awaitedParams = await params;
    const id = awaitedParams.id;
    
    console.log('Fetching product with ID:', id);

    const { rows } = await pool.query(
      'SELECT * FROM products WHERE id = $1',
      [id]
    );

    console.log('Query result:', rows);

    if (rows.length === 0) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    const product = rows[0];

    // Parse PostgreSQL TEXT[] array to JavaScript array
    let imagesArray = [];
    if (product.images && typeof product.images === 'string') {
      // PostgreSQL array format: "{/path1,/path2}"
      imagesArray = product.images
        .replace(/[{}]/g, '')
        .split(',')
        .filter(img => img.trim().length > 0);
    } else if (Array.isArray(product.images)) {
      imagesArray = product.images;
    }

    return NextResponse.json({
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      price: parseFloat(product.price),
      originalPrice: product.original_price ? parseFloat(product.original_price) : null,
      stock: product.stock,
      discount: product.discount ? parseFloat(product.discount) : null,
      rating: parseFloat(product.rating) || 0,
      reviews: product.reviews || 0,
      image: product.image || (imagesArray.length > 0 ? imagesArray[0] : null),
      images: imagesArray,
      specifications: product.specifications || {},
      colors: product.colors || [],
      storageOptions: product.storage_options || [],
      isActive: product.is_active,
      createdAt: product.created_at,
      updatedAt: product.updated_at,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching product', error: error.message },
      { status: 500 }
    );
  }
}

// PUT update product
export async function PUT(request, { params }) {
  try {
    const awaitedParams = await params;
    const id = awaitedParams.id;
    
    console.log('Updating product ID:', id);
    
    // Parse body safely
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json(
        { message: 'Invalid request body', error: parseError.message },
        { status: 400 }
      );
    }
    
    console.log('Request body:', JSON.stringify(body, null, 2));
    
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
    } = body || {};

    // Validate required fields
    if (!name || !category || !price) {
      return NextResponse.json(
        { message: 'Name, category, and price are required' },
        { status: 400 }
      );
    }

    // Check if product exists
    const existing = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    const existingProduct = existing.rows[0];
    
    // Auto-set main image to first image if not provided
    // Auto-set main image to first image if not provided. 
    // If image is explicitly provided as empty string, or images array is empty, we should clear it.
    let mainImage = image;
    if (mainImage === undefined) {
      mainImage = (images && images.length > 0) ? images[0] : (images !== undefined ? null : existingProduct.image);
    }

    console.log('Executing UPDATE query for ID:', id, { image, images, mainImage });

    try {
      const { rows } = await pool.query(
        `UPDATE products SET
          name = $1,
          description = $2,
          category = $3,
          price = $4,
          original_price = $5,
          stock = $6,
          discount = $7,
          image = $8,
          images = $9,
          specifications = $10,
          colors = $11,
          storage_options = $12,
          is_active = $13,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $14
        RETURNING *`,
        [
          name,
          description || null,
          category,
          price,
          originalPrice || null,
          stock || 0,
          discount || null,
          mainImage || null,
          images || existingProduct.images || '{}',
          JSON.stringify(specifications || existingProduct.specifications || {}),
          JSON.stringify(colors || existingProduct.colors || []),
          JSON.stringify(storageOptions || existingProduct.storage_options || []),
          isActive !== false,
          id,
        ]
      );

      const product = rows[0];
      console.log('Successfully updated product:', product.id, product.name);

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
      });
    } catch (dbError) {
      console.error('Database error during product update:', dbError);
      return NextResponse.json(
        { message: 'Database error occurred while updating product', error: dbError.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unexpected error in PUT /api/products/[id]:', error);
    if (error.stack) console.error('Stack trace:', error.stack);
    
    // Check if it's likely a body size issue
    const isLargePayload = request.headers.get('content-length') && parseInt(request.headers.get('content-length')) > 4000000;
    
    return NextResponse.json(
      { 
        message: 'An unexpected error occurred while updating product', 
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

// DELETE product
export async function DELETE(request, { params }) {
  try {
    const awaitedParams = await params;
    const id = awaitedParams.id;

    console.log('Deleting product with ID:', id);

    const { rowCount } = await pool.query(
      'DELETE FROM products WHERE id = $1',
      [id]
    );

    if (rowCount === 0) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    console.log('Successfully deleted product:', id);

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { message: 'An error occurred while deleting product', error: error.message },
      { status: 500 }
    );
  }
}
