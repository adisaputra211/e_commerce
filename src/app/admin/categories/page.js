"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import styles from "./categories.module.css";

const CATEGORY_ICONS = [
  { id: "smartphone", label: "Smartphone" },
  { id: "tablet_mac", label: "Tablet" },
  { id: "laptop_mac", label: "Laptop" },
  { id: "desktop_windows", label: "Desktop" },
  { id: "watch", label: "Watch" },
  { id: "headphones", label: "Headphones" },
  { id: "camera_alt", label: "Camera" },
  { id: "gamepad", label: "Gaming" },
  { id: "tv", label: "TV" },
  { id: "speaker", label: "Speaker" },
];

export default function CategoriesPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  const [categoryList, setCategoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.push("/login");
    }
  }, [isAuthenticated, isAdmin, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchCategories();
    }
  }, [isAuthenticated, isAdmin]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategoryList(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setShowModal(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setShowModal(true);
  };

  const handleDeleteCategory = async (id) => {
    if (confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      try {
        const res = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
          setCategoryList(prev => prev.filter(c => c.id !== id));
        }
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const handleSaveCategory = async (categoryData) => {
    try {
      if (editingCategory) {
        // Update existing category
        const res = await fetch('/api/categories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...categoryData, id: editingCategory.id }),
        });
        if (res.ok) {
          fetchCategories();
        }
      } else {
        // Add new category
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoryData),
        });
        if (res.ok) {
          fetchCategories();
        }
      }
      setShowModal(false);
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  if (isLoading || loading || !isAuthenticated || !isAdmin) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading categories...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageInner}>
        {/* Header */}
        <div className={styles.pageHeader}>
          <div className={styles.headerLeft}>
            <h1 className={styles.pageTitle}>Categories Management</h1>
            <p className={styles.pageSubtitle}>Organize your products into categories</p>
          </div>
          <button className={styles.primaryBtn} onClick={handleAddCategory}>
            <span className="material-symbols-outlined">add</span>
            Add Category
          </button>
        </div>

        {/* Categories Grid */}
        <div className={styles.categoriesGrid}>
          {categoryList.map((category) => (
            <div key={category.id} className={styles.categoryCard}>
              <div className={styles.categoryIcon}>
                <span className="material-symbols-outlined">{category.icon}</span>
              </div>
              <div className={styles.categoryInfo}>
                <h3 className={styles.categoryName}>{category.name}</h3>
                <p className={styles.categorySlug}>/{category.slug}</p>
                <p className={styles.categoryDescription}>{category.description}</p>
              </div>
              <div className={styles.categoryActions}>
                <button
                  className={styles.editBtn}
                  onClick={() => handleEditCategory(category)}
                  title="Edit"
                >
                  <span className="material-symbols-outlined">edit</span>
                </button>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDeleteCategory(category.id)}
                  title="Delete"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {categoryList.length === 0 && (
          <div className={styles.emptyState}>
            <span className="material-symbols-outlined">category</span>
            <h3>No Categories Yet</h3>
            <p>Start by adding your first category</p>
            <button className={styles.primaryBtn} onClick={handleAddCategory}>
              <span className="material-symbols-outlined">add</span>
              Add Category
            </button>
          </div>
        )}
      </div>

      {/* Category Modal */}
      {showModal && (
        <CategoryModal
          category={editingCategory}
          onClose={() => setShowModal(false)}
          onSave={handleSaveCategory}
          icons={CATEGORY_ICONS}
        />
      )}
    </div>
  );
}

function CategoryModal({ category, onClose, onSave, icons }) {
  const [formData, setFormData] = useState({
    name: category?.name || "",
    slug: category?.slug || "",
    icon: category?.icon || "smartphone",
    description: category?.description || "",
  });

  // Auto-generate slug from name
  useEffect(() => {
    if (!category && formData.name) {
      const slug = formData.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.name, category]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {category ? "Edit Category" : "Add New Category"}
          </h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Category Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={styles.input}
              required
              placeholder="e.g., Smartphones"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Slug *</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className={styles.input}
              required
              pattern="[a-z0-9-]+"
              placeholder="smartphones"
            />
            <span className={styles.hint}>URL-friendly name (lowercase, hyphens only)</span>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Icon *</label>
            <div className={styles.iconGrid}>
              {icons.map((icon) => (
                <button
                  key={icon.id}
                  type="button"
                  className={`${styles.iconOption} ${formData.icon === icon.id ? styles.selected : ""}`}
                  onClick={() => setFormData({ ...formData, icon: icon.id })}
                >
                  <span className="material-symbols-outlined">{icon.id}</span>
                  <span className={styles.iconLabel}>{icon.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={styles.textarea}
              rows="3"
              placeholder="Brief description of this category..."
            />
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.saveBtn}>
              <span className="material-symbols-outlined">save</span>
              {category ? "Update" : "Create"} Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
