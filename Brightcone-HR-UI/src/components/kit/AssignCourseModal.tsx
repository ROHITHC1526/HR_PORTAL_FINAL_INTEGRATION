import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { Course, Employee, AssignCourseResponse } from '../../services/types';
import { getDepartments, getEmployees, assignCourse } from '../../services/api';
import styles from './AssignCourseModal.module.css';

interface AssignCourseModalProps {
  isOpen: boolean;
  course: Course | null;
  onClose: () => void;
  onSuccess: (res: AssignCourseResponse) => void;
}

export const AssignCourseModal: React.FC<AssignCourseModalProps> = ({
  isOpen,
  course,
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'audience' | 'specific'>('audience');
  const [selectedAudience, setSelectedAudience] = useState('Everyone');
  const [selectedEmpCodes, setSelectedEmpCodes] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [departments, setDepartments] = useState<string[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (course?.due_date) {
        setDueDate(course.due_date);
      } else {
        const d = new Date();
        d.setDate(d.getDate() + 30);
        setDueDate(d.toISOString().slice(0, 10));
      }

      setMode('audience');
      setSelectedAudience(course?.audience || 'Everyone');
      setSelectedEmpCodes([]);
      setSearchQuery('');
      setError(null);

      // Load departments & active employees
      getDepartments()
        .then((depts) => {
          if (Array.isArray(depts)) {
            setDepartments(depts.map((d) => d.name));
          }
        })
        .catch(() => {});

      getEmployees()
        .then((emps) => {
          if (Array.isArray(emps)) {
            setEmployees(emps.filter((e) => e.status !== 'Inactive'));
          }
        })
        .catch(() => {});
    }
  }, [isOpen, course]);

  if (!isOpen || !course) return null;

  const audienceOptions = Array.from(
    new Set(['Everyone', 'Managers', ...departments])
  );

  const filteredEmployees = employees.filter((e) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      e.name.toLowerCase().includes(q) ||
      e.id.toLowerCase().includes(q) ||
      (e.dept && e.dept.toLowerCase().includes(q))
    );
  });

  const toggleEmployee = (code: string) => {
    setSelectedEmpCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const selectAllFiltered = () => {
    const codes = filteredEmployees.map((e) => e.id);
    setSelectedEmpCodes((prev) => Array.from(new Set([...prev, ...codes])));
  };

  const deselectAllFiltered = () => {
    const codes = new Set(filteredEmployees.map((e) => e.id));
    setSelectedEmpCodes((prev) => prev.filter((c) => !codes.has(c)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (mode === 'specific' && selectedEmpCodes.length === 0) {
      setError('Please select at least one employee');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const payload =
        mode === 'audience'
          ? { audience: selectedAudience, due_date: dueDate || undefined }
          : { employee_ids: selectedEmpCodes, due_date: dueDate || undefined };

      const res = await assignCourse(course.id, payload);
      onSuccess(res);
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Failed to assign course. Please try again.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="assign-modal-title">
        <div className={styles.head}>
          <div className={styles.titleArea}>
            <h2 id="assign-modal-title" className={styles.title}>
              Assign Course
            </h2>
            <p className={styles.sub}>
              Assign "{course.title}" ({course.course_type}) to learners.
            </p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.body}>
            {error && (
              <div style={{ color: 'var(--bad, #EF4444)', fontSize: 13.5, fontWeight: 500 }}>
                {error}
              </div>
            )}

            {/* Target Mode Toggle */}
            <div className={styles.field}>
              <span className={styles.label}>Assignment Target</span>
              <div className={styles.tabGroup}>
                <button
                  type="button"
                  className={`${styles.tabBtn} ${mode === 'audience' ? styles.tabBtnActive : ''}`}
                  onClick={() => setMode('audience')}
                >
                  By Audience / Group
                </button>
                <button
                  type="button"
                  className={`${styles.tabBtn} ${mode === 'specific' ? styles.tabBtnActive : ''}`}
                  onClick={() => setMode('specific')}
                >
                  Select Specific Employees
                </button>
              </div>
            </div>

            {/* Mode: Audience */}
            {mode === 'audience' ? (
              <div className={styles.field}>
                <label htmlFor="audience-select" className={styles.label}>
                  Target Audience
                </label>
                <select
                  id="audience-select"
                  className={styles.select}
                  value={selectedAudience}
                  onChange={(e) => setSelectedAudience(e.target.value)}
                >
                  {audienceOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              /* Mode: Specific Employees */
              <div className={styles.field}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={styles.label}>
                    Selected Employees ({selectedEmpCodes.length})
                  </span>
                  <div style={{ display: 'flex', gap: 8, fontSize: 12 }}>
                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', color: 'var(--brand, #0B6FDB)', cursor: 'pointer', padding: 0 }}
                      onClick={selectAllFiltered}
                    >
                      Select all
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 0 }}
                      onClick={deselectAllFiltered}
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className={styles.empSearchBox}>
                  <Search size={14} />
                  <input
                    type="text"
                    className={styles.empSearchInput}
                    placeholder="Search by name, ID or department..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className={styles.empList}>
                  {filteredEmployees.length === 0 ? (
                    <div style={{ padding: 12, textAlign: 'center', fontSize: 13, color: 'var(--muted)' }}>
                      No matching employees found.
                    </div>
                  ) : (
                    filteredEmployees.map((emp) => {
                      const isSelected = selectedEmpCodes.includes(emp.id);
                      return (
                        <div
                          key={emp.id}
                          className={styles.empItem}
                          onClick={() => toggleEmployee(emp.id)}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            style={{ cursor: 'pointer' }}
                          />
                          <div className={styles.empAvatar}>{getInitials(emp.name)}</div>
                          <span className={styles.empName}>{emp.name}</span>
                          <span className={styles.empCode}>{emp.id}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Due Date */}
            <div className={styles.field}>
              <label htmlFor="course-due-date" className={styles.label}>
                Completion Deadline
              </label>
              <input
                id="course-due-date"
                type="date"
                className={styles.input}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.foot}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? 'Assigning...' : 'Assign Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
