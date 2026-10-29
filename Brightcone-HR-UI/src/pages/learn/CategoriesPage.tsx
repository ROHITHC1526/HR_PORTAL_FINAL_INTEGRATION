import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, Tag, BookOpen, AlertCircle, X } from 'lucide-react';
import { CourseCategory } from '../../services/types';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../services/api';
import { Toast } from '../../components/kit/Toast';
import styles from './CategoriesPage.module.css';

const PRESET_COLORS = [
  '#0B6FDB', // People Plus Blue
  '#0BA6CC', // Cyan
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#F43F5E', // Rose
  '#64748B', // Slate
];

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<CourseCategory | null>(null);

  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formColor, setFormColor] = useState('#0B6FDB');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch {
      setToast({ message: 'Failed to load categories.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const totalCourses = useMemo(() => {
    return categories.reduce((acc, cat) => acc + (cat.course_count || 0), 0);
  }, [categories]);

  const filteredCategories = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return categories;
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
    );
  }, [categories, searchQuery]);

  const handleOpenAdd = () => {
    setCategoryToEdit(null);
    setFormName('');
    setFormDesc('');
    setFormColor('#0B6FDB');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: CourseCategory) => {
    setCategoryToEdit(cat);
    setFormName(cat.name);
    setFormDesc(cat.description || '');
    setFormColor(cat.color || '#0B6FDB');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || formName.trim().length < 2) {
      setToast({ message: 'Category name must be at least 2 characters long.', type: 'error' });
      return;
    }

    try {
      setIsSubmitting(true);
      if (categoryToEdit) {
        await updateCategory(categoryToEdit.id, {
          name: formName.trim(),
          description: formDesc.trim() || null,
          color: formColor,
        });
        setToast({ message: 'Category updated successfully.', type: 'success' });
      } else {
        await createCategory({
          name: formName.trim(),
          description: formDesc.trim() || null,
          color: formColor,
        });
        setToast({ message: 'Category created successfully.', type: 'success' });
      }
      setIsModalOpen(false);
      loadCategories();
    } catch (err: unknown) {
      const errResponse = (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data;
      const msg = errResponse?.error || errResponse?.message || 'Failed to save category.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (cat: CourseCategory) => {
    if (cat.course_count > 0) {
      setToast({
        message: `Cannot delete '${cat.name}' because it has ${cat.course_count} associated course(s). Reassign courses first.`,
        type: 'error',
      });
      return;
    }

    if (!window.confirm(`Are you sure you want to delete the category '${cat.name}'?`)) {
      return;
    }

    try {
      await deleteCategory(cat.id);
      setToast({ message: `Category '${cat.name}' deleted successfully.`, type: 'success' });
      loadCategories();
    } catch (err: unknown) {
      const errResponse = (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data;
      const msg = errResponse?.error || errResponse?.message || 'Failed to delete category.';
      setToast({ message: msg, type: 'error' });
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Categories</h1>
          <p className={styles.desc}>
            Organize learning programmes and courses into structured taxonomies and domains.
          </p>
        </div>
        <button className={styles.addBtn} onClick={handleOpenAdd}>
          <Plus size={16} />
          Add category
        </button>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Categories</span>
          <span className={styles.statValue}>{categories.length}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Categorized Courses</span>
          <span className={styles.statValue}>{totalCourses}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Average per Category</span>
          <span className={styles.statValue}>
            {categories.length > 0 ? (totalCourses / categories.length).toFixed(1) : 0}
          </span>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Category</th>
                <th>Description</th>
                <th>Courses</th>
                <th>Last Modified</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>
                    Loading categories...
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className={styles.emptyState}>
                      <Tag size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                      <div className={styles.emptyTitle}>No categories found</div>
                      <p>Create a category or adjust your search filter.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat.id}>
                    <td>
                      <div className={styles.categoryCell}>
                        <span
                          className={styles.colorSwatch}
                          style={{ backgroundColor: cat.color || '#0B6FDB' }}
                        />
                        <span className={styles.categoryName}>{cat.name}</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.categoryDesc} title={cat.description || ''}>
                        {cat.description || '—'}
                      </div>
                    </td>
                    <td>
                      <span className={styles.badge}>
                        <BookOpen size={12} style={{ marginRight: 4 }} />
                        {cat.course_count} {cat.course_count === 1 ? 'course' : 'courses'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--muted)', fontSize: 13 }}>
                      {cat.updated_at ? new Date(cat.updated_at).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <div className={styles.actionCell}>
                        <button
                          className={styles.actionBtn}
                          title="Edit category"
                          onClick={() => handleOpenEdit(cat)}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.deleteBtn}`}
                          title={
                            cat.course_count > 0
                              ? `Cannot delete (${cat.course_count} courses assigned)`
                              : 'Delete category'
                          }
                          disabled={cat.course_count > 0}
                          onClick={() => handleDelete(cat)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => !isSubmitting && setIsModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h2 className={styles.modalTitle}>
                {categoryToEdit ? 'Edit Category' : 'Create Category'}
              </h2>
              <button
                className={styles.closeBtn}
                disabled={isSubmitting}
                onClick={() => setIsModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className={styles.modalBody}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Category Name *</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="e.g. Compliance & Governance"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Description</label>
                  <textarea
                    className={styles.textarea}
                    placeholder="Brief description of the domain or subjects covered..."
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Badge Color</label>
                  <div className={styles.colorPickerRow}>
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={`${styles.colorOption} ${formColor === c ? styles.colorOptionSelected : ''}`}
                        style={{ backgroundColor: c }}
                        onClick={() => setFormColor(c)}
                        title={c}
                      />
                    ))}
                  </div>
                </div>

                {categoryToEdit && categoryToEdit.course_count > 0 && (
                  <div className={styles.protectionAlert}>
                    <AlertCircle size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                    This category is currently associated with {categoryToEdit.course_count} course(s).
                    Renaming it will update all course badges automatically.
                  </div>
                )}
              </div>
              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  disabled={isSubmitting}
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : categoryToEdit ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default CategoriesPage;
