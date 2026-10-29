import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Compass,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { RecommendationsResponse } from '../../services/types';
import { getSkillRecommendations } from '../../services/api';
import { Toast } from '../../components/kit/Toast';
import styles from './SkillRecommendationsPage.module.css';

export const SkillRecommendationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<RecommendationsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'All' | 'mandatory_compliance' | 'department_skill' | 'proficiency_growth'>('All');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadRecommendations = async () => {
    try {
      setIsLoading(true);
      const res = await getSkillRecommendations();
      setData(res);
    } catch {
      setToast({ message: 'Failed to load skill recommendations.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  const filteredRecommendations = useMemo(() => {
    if (!data) return [];
    if (activeFilter === 'All') return data.recommendations;
    return data.recommendations.filter((r) => r.rule_type === activeFilter);
  }, [data, activeFilter]);

  const counts = useMemo(() => {
    if (!data) return { All: 0, mandatory: 0, dept: 0, growth: 0 };
    return {
      All: data.recommendations.length,
      mandatory: data.recommendations.filter((r) => r.rule_type === 'mandatory_compliance').length,
      dept: data.recommendations.filter((r) => r.rule_type === 'department_skill').length,
      growth: data.recommendations.filter((r) => r.rule_type === 'proficiency_growth').length,
    };
  }, [data]);

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Skill Recommendations</h1>
          <p className={styles.desc}>
            Explainable, rule-driven course suggestions mapped to your role competencies, compliance requirements, and career growth.
          </p>
        </div>
      </div>

      {data && (
        <div className={styles.profileBanner}>
          <div className={styles.profileInfo}>
            <div className={styles.avatarRing}>
              {data.employee_name ? data.employee_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 className={styles.userName}>{data.employee_name}</h2>
              <div className={styles.userMeta}>
                Department: <strong>{data.employee_department}</strong>
              </div>
            </div>
          </div>
          <div className={styles.masteredStats}>
            <div className={styles.masteredItem}>
              <span className={styles.masteredLabel}>Active Recommendations</span>
              <span className={styles.masteredVal}>{data.recommendations.length}</span>
            </div>
            <div className={styles.masteredItem}>
              <span className={styles.masteredLabel}>Advanced Skills</span>
              <span className={styles.masteredVal}>{data.total_skills_mastered}</span>
            </div>
          </div>
        </div>
      )}

      <div className={styles.filterChips}>
        <button
          className={`${styles.chip} ${activeFilter === 'All' ? styles.chipActive : ''}`}
          onClick={() => setActiveFilter('All')}
        >
          All Recommendations ({counts.All})
        </button>
        <button
          className={`${styles.chip} ${activeFilter === 'mandatory_compliance' ? styles.chipActive : ''}`}
          onClick={() => setActiveFilter('mandatory_compliance')}
        >
          Mandatory Requirements ({counts.mandatory})
        </button>
        <button
          className={`${styles.chip} ${activeFilter === 'department_skill' ? styles.chipActive : ''}`}
          onClick={() => setActiveFilter('department_skill')}
        >
          Department Core Competencies ({counts.dept})
        </button>
        <button
          className={`${styles.chip} ${activeFilter === 'proficiency_growth' ? styles.chipActive : ''}`}
          onClick={() => setActiveFilter('proficiency_growth')}
        >
          Proficiency Growth ({counts.growth})
        </button>
      </div>

      <div className={styles.grid}>
        {isLoading ? (
          <div className={styles.emptyState}>Loading recommendations...</div>
        ) : filteredRecommendations.length === 0 ? (
          <div className={styles.emptyState}>
            <CheckCircle size={36} style={{ margin: '0 auto 12px', color: '#10B981' }} />
            <h3 style={{ margin: '0 0 6px', color: 'var(--text)' }}>All Caught Up!</h3>
            <p>You have fulfilled all recommended courses for this category.</p>
          </div>
        ) : (
          filteredRecommendations.map((rec) => (
            <div key={rec.id} className={styles.card}>
              <div>
                <div className={styles.cardTop}>
                  <h3 className={styles.cardTitle}>{rec.title}</h3>
                  {rec.rule_type === 'mandatory_compliance' && (
                    <span className={`${styles.ruleBadge} ${styles.ruleMandatory}`}>
                      <ShieldCheck size={12} />
                      Mandatory
                    </span>
                  )}
                  {rec.rule_type === 'department_skill' && (
                    <span className={`${styles.ruleBadge} ${styles.ruleDeptSkill}`}>
                      <Compass size={12} />
                      Department Curriculum
                    </span>
                  )}
                  {rec.rule_type === 'proficiency_growth' && (
                    <span className={`${styles.ruleBadge} ${styles.ruleGrowth}`}>
                      <TrendingUp size={12} />
                      Proficiency Growth
                    </span>
                  )}
                </div>

                <div className={styles.cardMeta}>
                  {rec.category && <span>{rec.category}</span>}
                  <span>•</span>
                  <span>
                    <Clock size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                    {rec.duration}
                  </span>
                  {rec.due_date && (
                    <>
                      <span>•</span>
                      <span style={{ color: 'var(--brand, #0B6FDB)' }}>Due {rec.due_date}</span>
                    </>
                  )}
                </div>

                <div className={styles.reasonBox} style={{ marginTop: 14 }}>
                  <div className={styles.reasonHeader}>
                    <Sparkles size={12} />
                    Why this is recommended:
                  </div>
                  <div>{rec.reason}</div>
                </div>
              </div>

              <div className={styles.cardBottom}>
                <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>
                  {rec.skill_name ? `Target skill: ${rec.skill_name}` : 'Compliance certification'}
                </span>
                <button
                  className={styles.cardAction}
                  onClick={() => navigate('/learn/my-learning')}
                >
                  View in My Learning
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default SkillRecommendationsPage;
