import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Alert,
  Avatar,
  Button,
  Card,
  ConfirmDialog,
  DataTable,
  Drawer,
  FormModal,
  Pill,
  ProgressBar,
  SelectField,
  StatTile,
  Tabs,
  TextareaField,
  TextField,
  type Column,
} from '@/components/ui'
import { useToast } from '@/components/toast-context'

const demoSchema = z.object({
  fullName: z.string().trim().min(2, 'Name must be at least 2 characters.'),
  category: z.string().min(1, 'Please select a category.'),
  notes: z.string().optional(),
})

type DemoFormData = z.infer<typeof demoSchema>

interface DemoRecord {
  id: string
  name: string
  department: string
  role: string
  status: 'active' | 'pending' | 'inactive'
  progress: number
}

const DEMO_DATA: DemoRecord[] = [
  {
    id: '1',
    name: 'Ananya Rao',
    department: 'People & HR',
    role: 'HR Admin',
    status: 'active',
    progress: 95,
  },
  {
    id: '2',
    name: 'Naresh Vemparala',
    department: 'Engineering',
    role: 'Engineering Lead',
    status: 'active',
    progress: 85,
  },
  {
    id: '3',
    name: 'Karthik Reddy',
    department: 'Product',
    role: 'Product Manager',
    status: 'active',
    progress: 70,
  },
  {
    id: '4',
    name: 'Meera Joshi',
    department: 'Finance',
    role: 'Finance Lead',
    status: 'active',
    progress: 90,
  },
  {
    id: '5',
    name: 'Rahul Varma',
    department: 'Engineering',
    role: 'Frontend Engineer',
    status: 'active',
    progress: 60,
  },
  {
    id: '6',
    name: 'Sneha Iyer',
    department: 'Design',
    role: 'Product Designer',
    status: 'pending',
    progress: 40,
  },
  {
    id: '7',
    name: 'Vikram Singh',
    department: 'Operations',
    role: 'Operations Analyst',
    status: 'inactive',
    progress: 20,
  },
]

export function UiKitPage() {
  const { addToast } = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DemoFormData>({
    resolver: zodResolver(demoSchema),
  })

  const onFormSubmit = handleSubmit((values) => {
    addToast({
      title: 'Action Successful',
      message: `Created item "${values.fullName}" under "${values.category}".`,
      type: 'success',
    })
    reset()
    setModalOpen(false)
  })

  const handleConfirmAction = () => {
    addToast({
      title: 'Item Deleted',
      message: 'The record has been permanently removed.',
      type: 'error',
    })
    setConfirmOpen(false)
  }

  const columns: Column<DemoRecord>[] = [
    {
      key: 'name',
      header: 'Employee',
      sortable: true,
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar name={row.name} />
          <div>
            <div style={{ fontWeight: 600 }}>{row.name}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{row.role}</div>
          </div>
        </div>
      ),
    },
    { key: 'department', header: 'Department', sortable: true },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row) => (
        <Pill tone={row.status === 'active' ? 'ok' : row.status === 'pending' ? 'warn' : undefined}>
          {row.status}
        </Pill>
      ),
    },
    {
      key: 'progress',
      header: 'Completion',
      render: (row) => (
        <div style={{ width: '120px' }}>
          <ProgressBar value={row.progress} label={`${row.progress}%`} />
        </div>
      ),
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>UI Kit & Primitives Showcase</h1>
        <p style={{ margin: 0, color: 'var(--text-muted)' }}>
          Comprehensive gallery demonstrating accessible modals, drawers, toasts, and data tables
          (Ticket P1-21).
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        <StatTile label="Interactive Modals" value="3 Ready" hint="ESC to close & focus trapped" />
        <StatTile label="Toast Notifications" value="4 Variants" hint="Stackable & auto-dismiss" />
        <StatTile label="DataTable" value="7 Rows" hint="Sortable & searchable" />
        <StatTile label="Design Tokens" value="24 Tokens" hint="Dark & light compatible" />
      </div>

      <Card>
        <Tabs
          tabs={[
            {
              id: 'overview',
              label: 'Interactive Demos',
              panel: (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    marginTop: '16px',
                  }}
                >
                  <Alert kind="info">
                    All components adhere to WCAG accessibility guidelines, supporting keyboard-only
                    navigation, focus restoration, and screen-reader semantics.
                  </Alert>

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <Button variant="primary" onClick={() => setModalOpen(true)}>
                      Open FormModal
                    </Button>
                    <Button variant="danger" onClick={() => setConfirmOpen(true)}>
                      Open ConfirmDialog
                    </Button>
                    <Button variant="ghost" onClick={() => setDrawerOpen(true)}>
                      Open Slide Drawer
                    </Button>
                  </div>
                </div>
              ),
            },
            {
              id: 'table',
              label: 'Data Table',
              panel: (
                <div style={{ marginTop: '16px' }}>
                  <DataTable
                    columns={columns}
                    data={DEMO_DATA}
                    keyExtractor={(item) => item.id}
                    searchPlaceholder="Search employees or departments…"
                    pageSize={5}
                  />
                </div>
              ),
            },
            {
              id: 'feedback',
              label: 'Feedback & Toasts',
              panel: (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    marginTop: '16px',
                  }}
                >
                  <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                    Trigger dynamic toast alerts across all 4 severity levels:
                  </p>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <Button
                      variant="primary"
                      onClick={() =>
                        addToast({
                          title: 'Success',
                          message: 'Profile updated successfully.',
                          type: 'success',
                        })
                      }
                    >
                      Success Toast
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() =>
                        addToast({
                          title: 'Error',
                          message: 'Failed to connect to backend.',
                          type: 'error',
                        })
                      }
                    >
                      Error Toast
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() =>
                        addToast({
                          title: 'Warning',
                          message: 'Session will expire in 5 minutes.',
                          type: 'warning',
                        })
                      }
                    >
                      Warning Toast
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() =>
                        addToast({
                          title: 'Info',
                          message: 'New audit policy applied.',
                          type: 'info',
                        })
                      }
                    >
                      Info Toast
                    </Button>
                  </div>
                </div>
              ),
            },
          ]}
          active={activeTab}
          onChange={setActiveTab}
        />
      </Card>

      {/* FormModal demo */}
      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title="Create New Item">
        <p style={{ color: 'var(--muted)', marginTop: 0 }}>
          Fill out the form below. Press Tab to cycle fields or ESC to cancel.
        </p>
        <form
          onSubmit={onFormSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          <TextField
            label="Full Name"
            placeholder="e.g. Employee Handbook Review"
            error={errors.fullName?.message}
            {...register('fullName')}
          />
          <SelectField label="Category" error={errors.category?.message} {...register('category')}>
            <option value="">Select a category</option>
            <option value="hr">Human Resources</option>
            <option value="eng">Engineering</option>
            <option value="fin">Finance</option>
          </SelectField>
          <TextareaField
            label="Additional Notes"
            placeholder="Optional context or description…"
            {...register('notes')}
          />
          <div
            style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}
          >
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={isSubmitting}>
              Submit
            </Button>
          </div>
        </form>
      </FormModal>

      {/* ConfirmDialog demo */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmAction}
        title="Permanently Delete Record?"
        message="This action cannot be undone. All associated audit entries will remain permanently."
        confirmLabel="Yes, Delete"
        variant="danger"
      />

      {/* Drawer demo */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Side Inspection Panel">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ margin: 0 }}>
            This drawer slides out smoothly and traps focus. Press <strong>ESC</strong> or click
            outside to dismiss.
          </p>
          <Alert kind="info">
            Drawers are ideal for quick details, logs, or multi-field inspection.
          </Alert>
          <Button variant="ghost" onClick={() => setDrawerOpen(false)}>
            Close Drawer
          </Button>
        </div>
      </Drawer>
    </div>
  )
}
