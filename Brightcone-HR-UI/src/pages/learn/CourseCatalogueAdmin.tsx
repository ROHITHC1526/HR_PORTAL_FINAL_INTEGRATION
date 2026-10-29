import React, { useState, useEffect, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { Plus, Edit2, BarChart3, GraduationCap, UserPlus, Eye, BookOpen, Clock, Users, Calendar, CheckCircle2 } from 'lucide-react';
import { getCourses, createCourse, updateCourse, sendReminders } from '../../services/api';
import { Course, CreateCoursePayload, AssignCourseResponse } from '../../services/types';
import AddEditCourseModal from '../../components/kit/AddEditCourseModal';
import { AssignCourseModal } from '../../components/kit/AssignCourseModal';
import { DocDetailDrawer, DetailField } from '../../components/common/DocDetailDrawer';
import Toast, { ToastMessage } from '../../components/kit/Toast';
import styles from './CourseCatalogueAdmin.module.css';

export const CourseCatalogueAdmin: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);
  const [courseToView, setCourseToView] = useState<Course | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [courseToAssign, setCourseToAssign] = useState<Course | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    setToasts((prev) => {
      if (prev.some((t) => t.text === text)) {
        return prev;
      }
      const id = `${Date.now()}-${Math.random()}`;
      return [...prev.slice(-2), { id, type, text }];
    });
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const loadCourses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getCourses();
      if (Array.isArray(data)) {
        setCourses(data);
      } else {
        setCourses([]);
      }
    } catch {
      setError('Unable to load course catalogue. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

    const handleMarkCourseComplete = (course: Course) => {
    const total = course.total_assigned || 10;
    const updated = {
      ...course,
      completed_count: total,
      completion_percentage: 100,
    };
    setCourses((prev) => prev.map((c) => (c.id === course.id ? updated : c)));
    addToast('success', `Course "${course.title}" marked as 100% completed.`);
    try {
      const saved = localStorage.getItem('brightcone_course_completion_overrides');
      const overrides = saved ? JSON.parse(saved) : {};
      overrides[course.id] = { completed_count: total, completion_percentage: 100 };
      localStorage.setItem('brightcone_course_completion_overrides', JSON.stringify(overrides));
    } catch {}
  };

  const handleOpenAdd = () => {
    setCourseToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (course: Course) => {
    setCourseToEdit(course);
    setIsModalOpen(true);
  };

  const handleSaveCourse = async (payload: CreateCoursePayload, courseId?: string) => {
    try {
      if (courseId) {
        await updateCourse(courseId, payload);
        addToast('success', `Course "${payload.title}" updated successfully`);
      } else {
        await createCourse(payload);
        addToast('success', `Course "${payload.title}" added to catalogue`);
      }
      await loadCourses();
    } catch (err: unknown) {
      addToast('error', 'Failed to save course. Please check inputs.');
      throw err;
    }
  };

  const handleRemindCourse = async (course: Course) => {
    const pendingCount = (course.total_assigned || 0) - (course.completed_count || 0);
    if (pendingCount <= 0) {
      addToast('info', `All learners have completed "${course.title}". No reminders needed.`);
      return;
    }

    try {
      const res = await sendReminders({ course_id: course.id });
      addToast(
        res.delivered > 0 ? 'success' : 'info',
        res.message || `Reminder sent to ${res.delivered} people for "${course.title}"`
      );
      await loadCourses();
    } catch {
      addToast('error', `Failed to send reminders for "${course.title}".`);
    }
  };

  const safeCourses = Array.isArray(courses) ? courses : [];

  return (
    <div data-testid="coursecatalogueadmin" className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Tab Navigation: Performance & Learning Admin */}
      <div className={styles.tabBar} role="tablist" aria-label="Admin Sections">
        <NavLink
          to="/performance"
          className={styles.tabBtn}
          role="tab"
          aria-selected="false"
        >
          <BarChart3 size={16} />
          <span>Performance</span>
        </NavLink>
        <NavLink
          to="/learn/courses"
          className={`${styles.tabBtn} ${styles.tabActive}`}
          role="tab"
          aria-selected="true"
        >
          <GraduationCap size={16} />
          <span>Learning Admin</span>
        </NavLink>
      </div>

      <header className={styles.head}>
        <div className={styles.titleArea}>
          <div className={styles.eyebrow}>Catalogue Management</div>
          <h1 className={styles.title}>Learning Courses</h1>
          <p className={styles.desc}>
            Build the catalogue, assign courses and track employee training compliance.
          </p>
        </div>
        <button
          type="button"
          className={styles.addBtn}
          onClick={handleOpenAdd}
        >
          <Plus size={16} />
          <span>Add course</span>
        </button>
      </header>

      <section className={styles.card} aria-labelledby="cat-table-title">
        <div className={styles.cardHeader}>
          <h2 id="cat-table-title" className={styles.cardTitle}>
            Course catalogue
          </h2>
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>
            {safeCourses.length} courses
          </span>
        </div>

        {isLoading ? (
          <div className={styles.emptyState}>Loading course catalogue...</div>
        ) : error ? (
          <div className={styles.emptyState} style={{ color: '#D93D4A' }}>
            <p>{error}</p>
            <button
              type="button"
              className={styles.addBtn}
              style={{ marginTop: 12, display: 'inline-flex' }}
              onClick={loadCourses}
            >
              Retry
            </button>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table} aria-label="Course catalogue table">
              <thead>
                <tr>
                  <th scope="col">Course</th>
                  <th scope="col">Type</th>
                  <th scope="col">Assigned to</th>
                  <th scope="col">Due</th>
                  <th scope="col">Completion</th>
                  <th scope="col" style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {safeCourses.length > 0 ? (
                  safeCourses.map((course) => {
                    const totalAssigned = course.total_assigned || 0;
                    const completedCount = course.completed_count || 0;
                    const completionPct = course.completion_percentage ?? (totalAssigned > 0 ? Math.round((completedCount / totalAssigned) * 100) : 0);
                    const pending = totalAssigned - completedCount;

                    return (
                      <tr key={course.id}>
                        <td className={styles.courseCell}>
                          <p className={styles.courseTitle}>{course.title}</p>
                          <p className={styles.courseDur}>{course.duration || '1 h'}</p>
                        </td>
                        <td>
                          <span
                            className={`${styles.pill} ${
                              course.course_type === 'Mandatory'
                                ? styles.pWarn
                                : styles.pInfo
                            }`}
                          >
                            {course.course_type}
                          </span>
                        </td>
                        <td style={{ fontWeight: 500 }}>{course.audience || 'Everyone'}</td>
                        <td style={{ color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                          {course.due_date ? course.due_date : '—'}
                        </td>
                        <td>
                          <div style={{ minWidth: 120 }}>
                            <div
                              className={styles.bar}
                              role="progressbar"
                              aria-valuenow={completionPct}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            >
                              <span style={{ width: `${completionPct}%` }} />
                            </div>
                            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                              {completedCount} of {totalAssigned}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className={styles.actionsCell} style={{ justifyContent: 'flex-end', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <button
                              type="button"
                              className={styles.actionAssignBtn}
                              onClick={() => {
                                setCourseToAssign(course);
                                setIsAssignModalOpen(true);
                              }}
                              aria-label={`Assign ${course.title} to learners`}
                              title="Assign course"
                            >
                              <UserPlus size={13} />
                              Assign
                            </button>

                            <button
                              type="button"
                              className={styles.actionAssignBtn}
                              onClick={() => handleMarkCourseComplete(course)}
                              aria-label={`Mark course ${course.title} as completed`}
                              title="Mark course completion"
                              style={{ color: '#059669', borderColor: '#A7F3D0' }}
                            >
                              <CheckCircle2 size={13} />
                              Mark Complete
                            </button>

                            {/* Eye action to the left of pencil */}
                            <button
                              type="button"
                              onClick={() => setCourseToView(course)}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-600 hover:border-blue-300 dark:hover:border-blue-600 transition"
                              title="View details"
                            >
                              <Eye size={15} />
                            </button>

                            {/* Edit action */}
                            <button
                              type="button"
                              className={styles.actionIconBtn}
                              onClick={() => handleOpenEdit(course)}
                              aria-label={`Edit ${course.title}`}
                              title="Edit course"
                            >
                              <Edit2 size={15} />
                            </button>

                            <button
                              type="button"
                              className={styles.actionRemindBtn}
                              onClick={() => handleRemindCourse(course)}
                              aria-label={`Remind ${pending} learners behind on ${course.title}`}
                            >
                              Remind
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className={styles.emptyState}>
                      No courses found in catalogue. Click "Add course" to build one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Add / Edit Course Dialog */}
      <AddEditCourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCourse}
        courseToEdit={courseToEdit}
      />

      {/* Assign Course Dialog */}
      <AssignCourseModal
        isOpen={isAssignModalOpen}
        course={courseToAssign}
        onClose={() => {
          setIsAssignModalOpen(false);
          setCourseToAssign(null);
        }}
        onSuccess={(res: AssignCourseResponse) => {
          addToast(res.assigned > 0 ? 'success' : 'info', res.message);
          loadCourses();
        }}
      />

      {/* Course Detail Drawer */}
      {courseToView && (
        <DocDetailDrawer
          isOpen={!!courseToView}
          onClose={() => setCourseToView(null)}
          title={courseToView.title}
          subtitle={`Course ID: ${courseToView.id}`}
          statusBadge={courseToView.course_type} statusVariant={courseToView.course_type === 'Mandatory' ? 'danger' : 'info'}
          fields={[
            { label: 'Course Title', value: courseToView.title },
            { label: 'Category / Type', value: courseToView.course_type },
            { label: 'Target Audience', value: courseToView.audience || 'All Employees' },
            { label: 'Estimated Duration', value: courseToView.duration || '1 hour' },
            { label: 'Due Date', value: courseToView.due_date || 'No hard deadline' },
            {
              label: 'Enrollment Status',
              value: `${courseToView.completed_count || 0} completed out of ${courseToView.total_assigned || 0} enrolled`,
            },
            {
              label: 'Compliance Rate',
              value: `${courseToView.completion_percentage ?? 0}% completed`,
            },
          ]}
          onEdit={() => {
            const c = courseToView;
            setCourseToView(null);
            handleOpenEdit(c);
          }}
        />
      )}

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};

export default CourseCatalogueAdmin;
