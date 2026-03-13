"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { categories } from "@/data/categories";
import styles from "./products.module.css";

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  const [productList, setProductList] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Fetch products from database
  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch(`/api/products?t=${Date.now()}`);
        if (response.ok) {
          const products = await response.json();
          setProductList(products);
          setFilteredProducts(products);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.push("/login");
    }
  }, [isAuthenticated, isAdmin, isLoading, router]);

  useEffect(() => {
    let filtered = [...productList];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    // Stock filter
    if (stockFilter === "low") {
      filtered = filtered.filter(p => p.stock && p.stock < 10);
    }

    setFilteredProducts(filtered);
  }, [searchTerm, categoryFilter, stockFilter, productList]);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDeleteProduct = async (id) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await fetch(`/api/products/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setProductList(prev => prev.filter(p => p.id !== id));
        } else {
          alert('Failed to delete product');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('An error occurred while deleting product');
      }
    }
  };

  const handleSaveProduct = async (productData) => {
    try {
      if (editingProduct) {
        // Update existing product
        const response = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        });
        
        if (response.ok) {
          const updatedProduct = await response.json();
          setProductList(prev => prev.map(p =>
            p.id === editingProduct.id ? updatedProduct : p
          ));
        } else {
          const errorData = await response.json().catch(() => ({}));
          alert(`Failed to update product: ${errorData.message || response.statusText}${errorData.hint ? '\n\nHint: ' + errorData.hint : ''}`);
          return;
        }
      } else {
        // Add new product
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        });
        
        if (response.ok) {
          const newProduct = await response.json();
          setProductList(prev => [...prev, newProduct]);
        } else {
          const errorData = await response.json().catch(() => ({}));
          alert(`Failed to create product: ${errorData.message || response.statusText}${errorData.hint ? '\n\nHint: ' + errorData.hint : ''}`);
          return;
        }
      }
      setShowModal(false);
    } catch (error) {
      console.error('Error saving product:', error);
      alert('An error occurred while saving product');
    }
  };

  if (isLoading || !isAuthenticated || !isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.pageInner}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageInner}>
        {/* Header */}
        <div className={styles.pageHeader}>
          <div className={styles.headerLeft}>
            <h1 className={styles.pageTitle}>Products Management</h1>
            <p className={styles.pageSubtitle}>Manage your product catalog, variants, and inventory</p>
          </div>
          <button className={styles.primaryBtn} onClick={handleAddProduct}>
            <span className="material-symbols-outlined">add</span>
            Add Product
          </button>
        </div>

        {/* Filters */}
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <div className={styles.searchBox}>
              <span className="material-symbols-outlined">search</span>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            
            <select 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            <select 
              value={stockFilter} 
              onChange={(e) => setStockFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Stock</option>
              <option value="low">Low Stock</option>
              <option value="instock">In Stock</option>
            </select>
          </div>

          <div className={styles.resultsInfo}>
            Showing {filteredProducts.length} of {productList.length} products
          </div>
        </div>

        {/* Products Table */}
        <div className={styles.card}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  // Use product.image, or first image from images array, or placeholder
                  const displayImage = product.image || (product.images && product.images.length > 0 ? product.images[0] : '/placeholder.jpg');
                  
                  return (
                    <tr key={product.id}>
                      <td>
                        <div className={styles.productCell}>
                          <img src={displayImage} alt={product.name} className={styles.productImage} />
                          <div className={styles.productInfo}>
                            <p className={styles.productName}>{product.name}</p>
                            <p className={styles.productSku}>SKU: PRD-{product.id.toString().padStart(4, '0')}</p>
                          </div>
                        </div>
                      </td>
                    <td>
                      <span className={styles.categoryBadge}>
                        {categories.find(c => c.id === product.category)?.name || product.category}
                      </span>
                    </td>
                    <td>
                      <div className={styles.priceCell}>
                        <span className={styles.currentPrice}>Rp {product.price.toLocaleString('id-ID')}</span>
                        {product.originalPrice && (
                          <span className={styles.originalPrice}>Rp {product.originalPrice.toLocaleString('id-ID')}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.stockStatus} ${product.stock < 10 ? styles.lowStock : ''}`}>
                        {product.stock || 50} units
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${product.is_active !== false ? styles.active : styles.inactive}`}>
                        {product.is_active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button 
                          className={styles.editBtn}
                          onClick={() => handleEditProduct(product)}
                          title="Edit"
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button 
                          className={styles.deleteBtn}
                          onClick={() => handleDeleteProduct(product.id)}
                          title="Delete"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Product Modal */}
      {showModal && (
        <ProductModal
          product={editingProduct}
          onClose={() => setShowModal(false)}
          onSave={handleSaveProduct}
          categories={categories}
        />
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="loading">Loading products...</div>}>
      <ProductsContent />
    </Suspense>
  );
}

function ProductModal({ product, onClose, onSave, categories }) {
  // Format price with thousand separators
  function formatPrice(value) {
    if (!value) return "";
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  // Parse price (remove dots)
  function parsePrice(value) {
    return value.replace(/\./g, "");
  }

  const [formData, setFormData] = useState({
    name: product?.name || "",
    category: product?.category || "",
    description: product?.description || "",
    image: product?.image || "",
    images: product?.images || [],
    specifications: {
      display: product?.specifications?.display || "",
      processor: product?.specifications?.processor || "",
      ram: product?.specifications?.ram || "",
      storage: product?.specifications?.storage || "",
      camera: product?.specifications?.camera || "",
      frontCamera: product?.specifications?.frontCamera || "",
      battery: product?.specifications?.battery || "",
      os: product?.specifications?.os || "",
      network: product?.specifications?.network || "",
      graphics: product?.specifications?.graphics || "",
      weight: product?.specifications?.weight || "",
    },
    colors: product?.colors || [{ name: "", value: "#000000" }],
    storageOptions: product?.storageOptions || ["256GB"],
    base_price: product?.price || 0,
    original_price: product?.originalPrice || 0,
    stock: product?.stock || 0,
    is_active: product?.is_active !== false,
  });

  const [activeSpecTab, setActiveSpecTab] = useState("general");
  const [priceDisplay, setPriceDisplay] = useState(formatPrice(product?.price));
  const [originalPriceDisplay, setOriginalPriceDisplay] = useState(formatPrice(product?.originalPrice));
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);

    try {
      const formDataUpload = new FormData();
      files.forEach(file => formDataUpload.append('images', file));

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      if (!response.ok) throw new Error('Upload failed');

      const result = await response.json();
      
      // Add uploaded images to existing images
      const newImages = [...formData.images, ...result.files];
      setFormData({
        ...formData,
        images: newImages,
        image: formData.image || newImages[0],
      });
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (index) => {
    const removedImage = formData.images[index];
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      images: newImages,
      image: formData.image === removedImage ? (newImages[0] || "") : formData.image,
    });
  };

  const setMainImage = (index) => {
    const selectedImage = formData.images[index];
    const otherImages = formData.images.filter((_, i) => i !== index);
    const newImages = [selectedImage, ...otherImages];
    setFormData({
      ...formData,
      images: newImages,
      image: selectedImage,
    });
  };

  const handlePriceChange = (e) => {
    let value = e.target.value;
    // Remove non-numeric characters
    value = value.replace(/[^0-9]/g, "");
    
    // Remove leading zeros
    value = value.replace(/^0+/, "") || "0";
    
    // Format with thousand separators (dots)
    const formattedValue = value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    
    setPriceDisplay(formattedValue);
    
    // Parse and store as number without dots
    const numericValue = parseInt(value) || 0;
    setFormData({ ...formData, base_price: numericValue });
  };

  const handleOriginalPriceChange = (e) => {
    let value = e.target.value;
    // Remove non-numeric characters
    value = value.replace(/[^0-9]/g, "");
    value = value.replace(/^0+/, "") || "0";
    
    // Format with thousand separators (dots)
    const formattedValue = value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    
    setOriginalPriceDisplay(formattedValue);
    
    const numericValue = parseInt(value) || 0;
    setFormData({ ...formData, original_price: numericValue });
  };

  const handleColorChange = (index, field, value) => {
    const newColors = [...formData.colors];
    newColors[index] = { ...newColors[index], [field]: value };
    setFormData({ ...formData, colors: newColors });
  };

  const addColor = () => {
    setFormData({
      ...formData,
      colors: [...formData.colors, { name: "", value: "#000000" }],
    });
  };

  const removeColor = (index) => {
    if (formData.colors.length > 1) {
      setFormData({
        ...formData,
        colors: formData.colors.filter((_, i) => i !== index),
      });
    }
  };

  const handleStorageChange = (index, value) => {
    const newStorage = [...formData.storageOptions];
    newStorage[index] = value;
    setFormData({ ...formData, storageOptions: newStorage });
  };

  const addStorage = () => {
    setFormData({
      ...formData,
      storageOptions: [...formData.storageOptions, ""],
    });
  };

  const removeStorage = (index) => {
    if (formData.storageOptions.length > 1) {
      setFormData({
        ...formData,
        storageOptions: formData.storageOptions.filter((_, i) => i !== index),
      });
    }
  };

  const handleSpecChange = (key, value) => {
    setFormData({
      ...formData,
      specifications: { ...formData.specifications, [key]: value },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      price: Number(formData.base_price),
      originalPrice: formData.original_price ? Number(formData.original_price) : null,
      stock: formData.stock ? Number(formData.stock) : 0,
      isActive: formData.is_active,
    });
  };

  const specTabs = [
    { id: "general", label: "General", icon: "devices" },
    { id: "display", label: "Display", icon: "tv" },
    { id: "performance", label: "Performance", icon: "memory" },
    { id: "camera", label: "Camera", icon: "photo_camera" },
    { id: "battery", label: "Battery", icon: "battery_full" },
  ];

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {product ? "Edit Product" : "Add New Product"}
          </h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.modalBody}>
            {/* Basic Information Section */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Basic Information</h3>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={styles.input}
                  required
                  placeholder="e.g., iPhone 15 Pro Max 256GB - Natural Titanium"
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={styles.select}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Base Price (Rp) *</label>
                  <input
                    type="text"
                    value={priceDisplay}
                    onChange={handlePriceChange}
                    className={styles.input}
                    required
                    placeholder="e.g., 18.599.000"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Original Price (Rp)</label>
                  <input
                    type="text"
                    value={originalPriceDisplay}
                    onChange={handleOriginalPriceChange}
                    className={styles.input}
                    placeholder="e.g., 21.699.000"
                  />
                  <span className={styles.hint}>Leave empty if no discount</span>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Stock Quantity</label>
                  <input
                    type="number"
                    value={formData.stock || ""}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className={styles.input}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Product Images *</label>
                <div className={styles.fileUploadContainer}>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className={styles.fileInput}
                    id="product-images"
                    disabled={isUploading}
                  />
                  <label htmlFor="product-images" className={styles.fileLabel}>
                    <span className="material-symbols-outlined">cloud_upload</span>
                    {isUploading ? 'Uploading...' : 'Choose Images'}
                  </label>
                  <p className={styles.hint}>Upload high-quality images. First image will be the main product image (shown in dashboard).</p>
                </div>

                {formData.images && formData.images.length > 0 && (
                  <div className={styles.imagesPreview}>
                    {formData.images.map((url, index) => (
                      <div key={index} className={styles.imagePreviewItem}>
                        <span className={styles.imageIndex}>{index + 1}</span>
                        <img src={url} alt={`Preview ${index + 1}`} className={styles.previewImage} />
                        {index === 0 ? (
                          <span className={styles.mainImageBadge}>Main</span>
                        ) : (
                          <button
                            type="button"
                            className={styles.setMainBtn}
                            onClick={() => setMainImage(index)}
                            title="Set as main image"
                          >
                            Set Main
                          </button>
                        )}
                        <button
                          type="button"
                          className={styles.removeImageBtn}
                          onClick={() => removeImage(index)}
                          title="Remove image"
                        >
                          <span className="material-symbols-outlined">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={styles.textarea}
                  rows="4"
                  placeholder="Product description..."
                />
              </div>
            </div>

            {/* Specifications Section */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Specifications</h3>
              
              <div className={styles.specTabs}>
                {specTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={`${styles.specTab} ${activeSpecTab === tab.id ? styles.specTabActive : ""}`}
                    onClick={() => setActiveSpecTab(tab.id)}
                  >
                    <span className="material-symbols-outlined">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeSpecTab === "general" && (
                <div className={styles.specGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Operating System</label>
                    <input
                      type="text"
                      value={formData.specifications.os}
                      onChange={(e) => handleSpecChange("os", e.target.value)}
                      className={styles.input}
                      placeholder="e.g., Android 13, One UI 5.1"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Processor</label>
                    <input
                      type="text"
                      value={formData.specifications.processor}
                      onChange={(e) => handleSpecChange("processor", e.target.value)}
                      className={styles.input}
                      placeholder="e.g., Snapdragon 8 Gen 2"
                    />
                  </div>
                </div>
              )}

              {activeSpecTab === "display" && (
                <div className={styles.specGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Display</label>
                    <input
                      type="text"
                      value={formData.specifications.display}
                      onChange={(e) => handleSpecChange("display", e.target.value)}
                      className={styles.input}
                      placeholder='e.g., 6.8" Dynamic AMOLED 2X, 120Hz'
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Weight</label>
                    <input
                      type="text"
                      value={formData.specifications.weight}
                      onChange={(e) => handleSpecChange("weight", e.target.value)}
                      className={styles.input}
                      placeholder="e.g., 234g"
                    />
                  </div>
                </div>
              )}

              {activeSpecTab === "performance" && (
                <div className={styles.specGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>RAM</label>
                    <input
                      type="text"
                      value={formData.specifications.ram}
                      onChange={(e) => handleSpecChange("ram", e.target.value)}
                      className={styles.input}
                      placeholder="e.g., 12GB"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Storage</label>
                    <input
                      type="text"
                      value={formData.specifications.storage}
                      onChange={(e) => handleSpecChange("storage", e.target.value)}
                      className={styles.input}
                      placeholder="e.g., 256GB / 512GB / 1TB"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Graphics</label>
                    <input
                      type="text"
                      value={formData.specifications.graphics}
                      onChange={(e) => handleSpecChange("graphics", e.target.value)}
                      className={styles.input}
                      placeholder="e.g., Adreno 740"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Network</label>
                    <input
                      type="text"
                      value={formData.specifications.network}
                      onChange={(e) => handleSpecChange("network", e.target.value)}
                      className={styles.input}
                      placeholder="e.g., 5G Enabled"
                    />
                  </div>
                </div>
              )}

              {activeSpecTab === "camera" && (
                <div className={styles.specGrid}>
                  {(formData.category === "hp" || formData.category === "tablet") ? (
                    <>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Rear Camera (Back Camera)</label>
                        <input
                          type="text"
                          value={formData.specifications.camera}
                          onChange={(e) => handleSpecChange("camera", e.target.value)}
                          className={styles.input}
                          placeholder="e.g., 200MP + 12MP + 10MP + 10MP"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Front Camera (Selfie)</label>
                        <input
                          type="text"
                          value={formData.specifications.frontCamera}
                          onChange={(e) => handleSpecChange("frontCamera", e.target.value)}
                          className={styles.input}
                          placeholder="e.g., 12MP"
                        />
                      </div>
                    </>
                  ) : (
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Camera</label>
                      <input
                        type="text"
                        value={formData.specifications.camera}
                        onChange={(e) => handleSpecChange("camera", e.target.value)}
                        className={styles.input}
                        placeholder="e.g., 1080p FaceTime HD"
                      />
                    </div>
                  )}
                </div>
              )}

              {activeSpecTab === "battery" && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Battery</label>
                  <input
                    type="text"
                    value={formData.specifications.battery}
                    onChange={(e) => handleSpecChange("battery", e.target.value)}
                    className={styles.input}
                    placeholder="e.g., 5000mAh, 45W Fast Charging"
                  />
                </div>
              )}
            </div>

            {/* Colors Section */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                Color Options
                <button type="button" className={styles.addBtn} onClick={addColor}>
                  <span className="material-symbols-outlined">add</span>
                  Add Color
                </button>
              </h3>
              
              <div className={styles.colorsGrid}>
                {formData.colors.map((color, index) => (
                  <div key={index} className={styles.colorItem}>
                    <div className={styles.colorInput}>
                      <label className={styles.colorLabel}>Color Name</label>
                      <input
                        type="text"
                        value={color.name}
                        onChange={(e) => handleColorChange(index, "name", e.target.value)}
                        className={styles.input}
                        placeholder="e.g., Phantom Black"
                      />
                    </div>
                    <div className={styles.colorPicker}>
                      <label className={styles.colorLabel}>Color Value</label>
                      <div className={styles.colorPickerWrapper}>
                        <input
                          type="color"
                          value={color.value}
                          onChange={(e) => handleColorChange(index, "value", e.target.value)}
                          className={styles.colorInputField}
                        />
                        <input
                          type="text"
                          value={color.value}
                          onChange={(e) => handleColorChange(index, "value", e.target.value)}
                          className={styles.colorHexInput}
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                    {formData.colors.length > 1 && (
                      <button
                        type="button"
                        className={styles.removeColorBtn}
                        onClick={() => removeColor(index)}
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Storage Options Section */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                Storage Options
                <button type="button" className={styles.addBtn} onClick={addStorage}>
                  <span className="material-symbols-outlined">add</span>
                  Add Storage
                </button>
              </h3>
              
              <div className={styles.storageGrid}>
                {formData.storageOptions.map((storage, index) => (
                  <div key={index} className={styles.storageItem}>
                    <input
                      type="text"
                      value={storage}
                      onChange={(e) => handleStorageChange(index, e.target.value)}
                      className={styles.input}
                      placeholder="e.g., 256GB"
                    />
                    {formData.storageOptions.length > 1 && (
                      <button
                        type="button"
                        className={styles.removeStorageBtn}
                        onClick={() => removeStorage(index)}
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              <span>Active (show in store)</span>
            </label>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.saveBtn}>
              <span className="material-symbols-outlined">save</span>
              {product ? "Update" : "Create"} Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
