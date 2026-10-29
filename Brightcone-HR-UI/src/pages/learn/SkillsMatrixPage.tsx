import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Award, CheckCircle2, X } from 'lucide-react';
import {
  SkillsMatrixResponse,
  SkillLevel,
} from '../../services/types';
import {
  getSkillsMatrix,
  createSkill,
  rateSkill,
} from '../../services/api';
import { Toast } from '../../components/kit/Toast';
import styles from './SkillsMatrixPage.module.css';

export const SkillsMatrixPage: React.FC = () => {
  const [data, setData] = useState<SkillsMatrixResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Add Skill Modal
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
  const [skillName, setSkillName] = useState('');
  const [skillCategory, setSkillCategory] = useState('Core Competency');
  const [skillDesc, setSkillDesc] = useState('');

  // Rate Skill Modal
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [selectedEmpCode, setSelectedEmpCode] = useState('');
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [ratingLevel, setRatingLevel] = useState<SkillLevel>('Intermediate');
  const [isVerified, setIsVerified] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadMatrix = async () => {
    try {
      setIsLoading(true);
      const res = await getSkillsMatrix();
      setData(res);
    } catch {
      setToast({ message: 'Failed to load skills matrix.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMatrix();
  }, []);

  const departments = useMemo(() => {
    if (!data) return [];
    const depts = new Set<string>();
    data.employees.forEach((e) => {
      if (e.department) depts.add(e.department);
    });
    return Array.from(depts).sort();
  }, [data]);

  const filteredSkills = useMemo(() => {
    if (!data) return [];
    if (selectedCategory === 'All') return data.skills;
    return data.skills.filter((s) => s.category === selectedCategory);
  }, [data, selectedCategory]);

  const filteredEmployees = useMemo(() => {
    if (!data) return [];
    return data.employees.filter((e) => {
      const matchDept = selectedDept === 'All' || e.department === selectedDept;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        e.full_name.toLowerCase().includes(q) ||
        e.employee_code.toLowerCase().includes(q) ||
        e.role.toLowerCase().includes(q);
      return matchDept && matchSearch;
    });
  }, [data, selectedDept, searchQuery]);

  const totalRatings = useMemo(() => {
    if (!data) return 0;
    return data.employees.reduce((acc, emp) => acc + Object.keys(emp.skills || {}).length, 0);
  }, [data]);

  const handleOpenRate = (empCode?: string, skillId?: string, currentLevel?: SkillLevel) => {
    setSelectedEmpCode(empCode || data?.employees[0]?.employee_code || '');
    setSelectedSkillId(skillId || data?.skills[0]?.id || '');
    setRatingLevel(currentLevel || 'Intermediate');
    setIsVerified(true);
    setIsRateModalOpen(true);
  };

  const handleSaveSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim()) {
      setToast({ message: 'Skill name cannot be empty.', type: 'error' });
      return;
    }

    try {
      setIsSubmitting(true);
      await createSkill({
        name: skillName.trim(),
        category: skillCategory.trim(),
        description: skillDesc.trim() || null,
      });
      setToast({ message: 'Skill created successfully.', type: 'success' });
      setIsAddSkillOpen(false);
      setSkillName('');
      setSkillDesc('');
      loadMatrix();
    } catch (err: unknown) {
      const errResponse = (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data;
      const msg = errResponse?.error || errResponse?.message || 'Failed to create skill.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpCode || !selectedSkillId) {
      setToast({ message: 'Please select both an employee and a skill.', type: 'error' });
      return;
    }

    try {
      setIsSubmitting(true);
      await rateSkill({
        employee_id: selectedEmpCode,
        skill_id: selectedSkillId,
        level: ratingLevel,
        verified: isVerified,
      });
      setToast({ message: 'Skill proficiency rating recorded.', type: 'success' });
      setIsRateModalOpen(false);
      loadMatrix();
    } catch (err: unknown) {
      const errResponse = (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data;
      const msg = errResponse?.error || errResponse?.message || 'Failed to record rating.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getBadgeClass = (level?: string) => {
    switch (level) {
      case 'Beginner':
        return styles.levelBeginner;
      case 'Intermediate':
        return styles.levelIntermediate;
      case 'Advanced':
        return styles.levelAdvanced;
      case 'Expert':
        return styles.levelExpert;
      default:
        return styles.levelNone;
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Skills Matrix</h1>
          <p className={styles.desc}>
            Monitor organizational competencies, verify role proficiencies, and identify capability gaps.
          </p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.secondaryBtn} onClick={() => setIsAddSkillOpen(true)}>
            <Plus size={15} />
            Add skill
          </button>
          <button className={styles.primaryBtn} onClick={() => handleOpenRate()}>
            <Award size={15} />
            Rate employee
          </button>
        </div>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Mapped Skills</span>
          <span className={styles.statValue}>{data?.skills.length || 0}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Active Employees</span>
          <span className={styles.statValue}>{data?.employees.length || 0}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Recorded Ratings</span>
          <span className={styles.statValue}>{totalRatings}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Skill Domains</span>
          <span className={styles.statValue}>{data?.categories.length || 0}</span>
        </div>
      </div>

      <div className={styles.legendBar}>
        <span className={styles.legendTitle}>Proficiency Scale:</span>
        <span className={`${styles.levelBadge} ${styles.levelBeginner}`}>Beginner</span>
        <span className={`${styles.levelBadge} ${styles.levelIntermediate}`}>Intermediate</span>
        <span className={`${styles.levelBadge} ${styles.levelAdvanced}`}>Advanced</span>
        <span className={`${styles.levelBadge} ${styles.levelExpert}`}>Expert</span>
        <span style={{ fontSize: 13, color: 'var(--muted)', marginLeft: 'auto' }}>
          Click any cell to update rating
        </span>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.filtersLeft}>
          <div className={styles.searchWrap}>
            <Search size={15} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search employee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className={styles.select}
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            <option value="All">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            className={styles.select}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="All">All Skill Domains</option>
            {data?.categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.matrixCard}>
        <div className={styles.matrixWrap}>
          <table className={styles.matrixTable}>
            <thead>
              <tr>
                <th className={styles.stickyCol}>Employee</th>
                {filteredSkills.map((s) => (
                  <th key={s.id} title={s.description || ''}>
                    <div>{s.name}</div>
                    <div style={{ fontSize: 11, fontWeight: 400, color: 'var(--muted)' }}>
                      {s.category}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={filteredSkills.length + 1} style={{ textAlign: 'center', padding: '40px' }}>
                    Loading skills matrix...
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={filteredSkills.length + 1} style={{ textAlign: 'center', padding: '40px' }}>
                    No employees matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.employee_code}>
                    <td className={styles.stickyCol}>
                      <div className={styles.empName}>{emp.full_name}</div>
                      <div className={styles.empMeta}>
                        {emp.role} • {emp.department}
                      </div>
                    </td>
                    {filteredSkills.map((s) => {
                      const rating = emp.skills?.[s.id];
                      return (
                        <td key={s.id}>
                          {rating ? (
                            <span
                              className={`${styles.levelBadge} ${getBadgeClass(rating.level)}`}
                              title={`Verified by ${rating.verified_by || 'HR'} on ${new Date(rating.updated_at).toLocaleDateString()}`}
                              onClick={() => handleOpenRate(emp.employee_code, s.id, rating.level as SkillLevel)}
                            >
                              {rating.verified && <CheckCircle2 size={11} />}
                              {rating.level}
                            </span>
                          ) : (
                            <span
                              className={styles.levelNone}
                              title="Click to rate"
                              onClick={() => handleOpenRate(emp.employee_code, s.id)}
                            >
                              + Add
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Skill Modal */}
      {isAddSkillOpen && (
        <div className={styles.modalOverlay} onClick={() => !isSubmitting && setIsAddSkillOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h2 className={styles.modalTitle}>Add Skill Competency</h2>
              <button
                className={styles.closeBtn}
                disabled={isSubmitting}
                onClick={() => setIsAddSkillOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveSkill}>
              <div className={styles.modalBody}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Skill Name *</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="e.g. Distributed Systems"
                    value={skillName}
                    onChange={(e) => setSkillName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Competency Domain *</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="e.g. Engineering, Compliance, Leadership"
                    value={skillCategory}
                    onChange={(e) => setSkillCategory(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Description</label>
                  <textarea
                    className={styles.textarea}
                    placeholder="Proficiency expectations and learning outcomes..."
                    value={skillDesc}
                    onChange={(e) => setSkillDesc(e.target.value)}
                  />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  disabled={isSubmitting}
                  onClick={() => setIsAddSkillOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rate Skill Modal */}
      {isRateModalOpen && (
        <div className={styles.modalOverlay} onClick={() => !isSubmitting && setIsRateModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h2 className={styles.modalTitle}>Rate Employee Proficiency</h2>
              <button
                className={styles.closeBtn}
                disabled={isSubmitting}
                onClick={() => setIsRateModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveRating}>
              <div className={styles.modalBody}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Employee *</label>
                  <select
                    className={styles.selectField}
                    value={selectedEmpCode}
                    onChange={(e) => setSelectedEmpCode(e.target.value)}
                    required
                  >
                    {data?.employees.map((emp) => (
                      <option key={emp.employee_code} value={emp.employee_code}>
                        {emp.full_name} ({emp.employee_code} - {emp.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Skill Competency *</label>
                  <select
                    className={styles.selectField}
                    value={selectedSkillId}
                    onChange={(e) => setSelectedSkillId(e.target.value)}
                    required
                  >
                    {data?.skills.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Proficiency Level *</label>
                  <select
                    className={styles.selectField}
                    value={ratingLevel}
                    onChange={(e) => setRatingLevel(e.target.value as SkillLevel)}
                    required
                  >
                    <option value="Beginner">Beginner (Foundational knowledge)</option>
                    <option value="Intermediate">Intermediate (Practical capability)</option>
                    <option value="Advanced">Advanced (Autonomous / complex projects)</option>
                    <option value="Expert">Expert (Subject matter authority / mentor)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <input
                    type="checkbox"
                    id="verifiedCheck"
                    checked={isVerified}
                    onChange={(e) => setIsVerified(e.target.checked)}
                  />
                  <label htmlFor="verifiedCheck" style={{ fontSize: 13.5, cursor: 'pointer' }}>
                    Mark as Manager/Admin Verified Rating
                  </label>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  disabled={isSubmitting}
                  onClick={() => setIsRateModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Rating'}
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

export default SkillsMatrixPage;
