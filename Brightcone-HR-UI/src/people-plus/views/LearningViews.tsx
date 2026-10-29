import React from 'react'
import { useRecords, useRecordCatalog } from '@/features/records/api'
import { useAuth } from '@/auth/useAuth'
import { Icon } from '../Icon'

export const LearningViews: React.FC = () => {
  const { can } = useAuth()
  const allowed = can('people:manage') || can('users:manage')
  const catalog = useRecordCatalog(allowed)

  const hasCourseType = (catalog.data as { record_types?: { key: string }[] })
    ?.record_types?.some((t) => t.key === 'course') ?? false

  const courses = useRecords('course', allowed && hasCourseType)
  const courseList = (courses.data as { items?: any[] })?.items ?? []

  return (
    <div className="view">
      <div className="head">
        <div>
          <div className="eyebrow">Learn & Upskilling</div>
          <h1>Learning & Certifications</h1>
          <p>Training courses, compliance certifications, and professional development.</p>
        </div>
      </div>

      <div className="card mt">
        {!hasCourseType ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Icon name="learn" size={32} />
            <h3 style={{ marginTop: 12 }}>Learning platform not configured</h3>
            <p className="muted" style={{ marginTop: 8 }}>
              Create a "course" record type via the Records API to enable the LMS.
              Courses will appear here once configured.
            </p>
          </div>
        ) : courseList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Icon name="learn" size={32} />
            <h3 style={{ marginTop: 12 }}>No courses available</h3>
            <p className="muted" style={{ marginTop: 8 }}>
              Add course records via the API to populate the learning catalogue.
            </p>
          </div>
        ) : (
          <>
            <h3>Course Catalogue</h3>
            <div className="grid g3" style={{ marginTop: 14 }}>
              {courseList.map((c: any) => (
                <div key={c.id} className="card">
                  <h3 style={{ fontSize: 16, marginBottom: 8 }}>{c.data?.title ?? c.id}</h3>
                  <span className={`pill ${c.archived ? 'p-ok' : 'p-info'}`}>
                    {c.archived ? 'Completed' : 'Available'}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
