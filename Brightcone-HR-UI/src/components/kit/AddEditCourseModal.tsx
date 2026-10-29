import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import { Course, CreateCoursePayload, CourseCategory } from '../../services/types';
import { getDepartments, getCategories } from '../../services/api';
import styles from './AddEditCourseModal.module.css';

interface AddEditCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: CreateCoursePayload, courseId?: string) => Promise<void>;
  courseToEdit?: Course | null;
}

export const AddEditCourseModal: React.FC<AddEditCourseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  courseToEdit,
}) => {
  const [title, setTitle] = useState('');
  const [courseType, setCourseType] = useState<'Mandatory' | 'Elective'>('Mandatory');
  const [duration, setDuration] = useState('1 h');
  const [audience, setAudience] = useState('Everyone');
  const [dueDate, setDueDate] = useState('');
  const [contentType, setContentType] = useState<'document' | 'video' | 'link' | ''>('');
  const [contentUrl, setContentUrl] = useState('');
  const [departments, setDepartments] = useState<string[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [categoryId, setCategoryId] = useState<string>('');
  const [errors, setErrors] = useState<{ title?: string; resource?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getDepartments()
        .then((depts) => {
          if (depts && Array.isArray(depts)) {
            setDepartments(depts.map((d) => d.name));
          }
        })
        .catch(() => {});

      getCategories()
        .then((cats) => {
          if (cats && Array.isArray(cats)) {
            setCategories(cats);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  const audienceList = Array.from(
    new Set(['Everyone', 'Managers', ...departments])
  );


  const titleInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (courseToEdit) {
      setTitle(courseToEdit.title);
      setCourseType(courseToEdit.course_type);
      setDuration(courseToEdit.duration || '1 h');
      setAudience(courseToEdit.audience || 'Everyone');
      setDueDate(courseToEdit.due_date || '');
      setCategoryId(courseToEdit.category_id || '');
      setContentType(courseToEdit.content_type || '');
      setContentUrl(courseToEdit.content_url || '');
    } else {
      setTitle('');
      setCourseType('Mandatory');
      setDuration('1 h');
      setAudience('Everyone');
      setDueDate('2026-12-15');
      setCategoryId('');
      setContentType('');
      setContentUrl('');
    }
    setErrors({});
  }, [courseToEdit, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setErrors({ title: 'Course title is required' });
      titleInputRef.current?.focus();
      return;
    }
    if (trimmedTitle.length < 3) {
      setErrors({ title: 'Course title must be at least 3 characters' });
      titleInputRef.current?.focus();
      return;
    }

    const trimmedUrl = contentUrl.trim();
    const hasType = Boolean(contentType);
    const hasUrl = Boolean(trimmedUrl);

    if (hasType !== hasUrl) {
      setErrors({ resource: 'Both resource type and resource URL must be provided together, or both cleared.' });
      return;
    }

    if (hasUrl) {
      if (!trimmedUrl.toLowerCase().startsWith('https://')) {
        setErrors({ resource: 'Resource URL must be an absolute HTTPS address (https://...)' });
        return;
      }
      if (trimmedUrl.length > 2048) {
        setErrors({ resource: 'Resource URL cannot exceed 2048 characters.' });
        return;
      }
    }

    try {
      setIsSubmitting(true);
      await onSave(
        {
          title: trimmedTitle,
          course_type: courseType,
          duration: duration.trim() || '1 h',
          audience,
          due_date: dueDate || null,
          category_id: categoryId || null,
          content_type: hasType ? (contentType as 'document' | 'video' | 'link') : null,
          content_url: hasUrl ? trimmedUrl : null,
        },
        courseToEdit?.id
      );
      onClose();
    } catch (err: unknown) {
      let serverMessage = 'Failed to save course. Please check inputs and try again.';
      if (axios.isAxiosError(err)) {
        serverMessage = (err.response?.data as { message?: string })?.message || err.message || serverMessage;
      } else if (err instanceof Error) {
        serverMessage = err.message;
      }
      setErrors({ resource: serverMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={styles.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        className={styles.dialog}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <div className={styles.header}>
          <div>
            <h2 id="dialog-title" className={styles.title}>
              {courseToEdit ? 'Edit course' : 'Add course'}
            </h2>
            <p className={styles.subtitle}>
              Assigned people see it under Learning.
            </p>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.fieldGroup}>
            <label htmlFor="course-title" className={styles.label}>
              Course title <span className={styles.required}>*</span>
            </label>
            <input
              id="course-title"
              ref={titleInputRef}
              type="text"
              className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
              placeholder="e.g. Information Security & Data Privacy"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors({});
              }}
              disabled={isSubmitting}
              required
            />
            {errors.title && <p className={styles.errorText}>{errors.title}</p>}
          </div>

          <div className={styles.row2}>
            <div className={styles.fieldGroup}>
              <label htmlFor="course-type" className={styles.label}>
                Type
              </label>
              <select
                id="course-type"
                className={styles.select}
                value={courseType}
                onChange={(e) => setCourseType(e.target.value as 'Mandatory' | 'Elective')}
                disabled={isSubmitting}
              >
                <option value="Mandatory">Mandatory</option>
                <option value="Elective">Elective</option>
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="course-duration" className={styles.label}>
                Duration
              </label>
              <input
                id="course-duration"
                type="text"
                className={styles.input}
                placeholder="e.g. 1 h, 45 min"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className={styles.row2}>
            <div className={styles.fieldGroup}>
              <label htmlFor="course-audience" className={styles.label}>
                Assign to
              </label>
              <select
                id="course-audience"
                className={styles.select}
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                disabled={isSubmitting}
              >
                {audienceList.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="course-due-date" className={styles.label}>
                Due date
              </label>
              <input
                id="course-due-date"
                type="date"
                className={styles.input}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className={styles.fieldGroup} style={{ marginTop: 12 }}>
            <label htmlFor="course-category" className={styles.label}>
              Category Domain
            </label>
            <select
              id="course-category"
              className={styles.select}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={isSubmitting}
            >
              <option value="">— Uncategorized —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.resourceSection}>
            <div className={styles.resourceHeader}>
              <label className={styles.label}>Learning Resource (Optional)</label>
              <span className={styles.helperText}>Attach an authorized document, video, or link</span>
            </div>

            <div className={styles.row2}>
              <div className={styles.fieldGroup}>
                <label htmlFor="course-content-type" className={styles.labelSub}>
                  Resource type
                </label>
                <select
                  id="course-content-type"
                  className={`${styles.select} ${errors.resource ? styles.inputError : ''}`}
                  value={contentType}
                  onChange={(e) => {
                    setContentType(e.target.value as 'document' | 'video' | 'link' | '');
                    if (errors.resource) setErrors((prev) => ({ ...prev, resource: undefined }));
                  }}
                  disabled={isSubmitting}
                >
                  <option value="">None / Remove resource</option>
                  <option value="document">Document (PDF, Guide)</option>
                  <option value="video">Video (Stream, Recording)</option>
                  <option value="link">Link (Web Resource, LMS)</option>
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="course-content-url" className={styles.labelSub}>
                  Resource URL (HTTPS)
                </label>
                <input
                  id="course-content-url"
                  type="url"
                  className={`${styles.input} ${errors.resource ? styles.inputError : ''}`}
                  placeholder="https://company.example.com/materials/..."
                  value={contentUrl}
                  onChange={(e) => {
                    setContentUrl(e.target.value);
                    if (errors.resource) setErrors((prev) => ({ ...prev, resource: undefined }));
                  }}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {errors.resource && <p className={styles.errorText}>{errors.resource}</p>}
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditCourseModal;
