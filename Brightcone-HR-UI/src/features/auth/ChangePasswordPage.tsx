import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { changePassword } from '@/api/auth'
import { ApiError } from '@/api/client'
import { useAuth } from '@/auth/AuthContext'
import { Alert, Button, Card, PasswordField } from '@/components/ui'
import { passwordRules } from '@/domain/password'

const schema = z
  .object({
    current: z.string().min(1, 'Enter your current password.'),
    password: passwordRules,
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    path: ['confirm'],
    message: 'The two passwords do not match.',
  })
type Form = z.infer<typeof schema>

/** Also shown full-screen to people whose password was set by HR and must be replaced. */
export function ChangePasswordPage() {
  const { user, adopt, signOut } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const forced = user?.must_change_password ?? false
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) })

  const onSubmit = handleSubmit(async (values) => {
    setError(null)
    try {
      // The server signs out every other device and hands back a fresh session for this one.
      adopt(await changePassword(values.current, values.password))
      navigate('/', { replace: true, state: { notice: 'Your password was changed.' } })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
    }
  })

  return (
    <div style={forced ? { maxWidth: 460, margin: '48px auto', padding: 16 } : { maxWidth: 460 }}>
      <Card>
        <h1>{forced ? 'Choose your own password' : 'Change password'}</h1>
        {forced && (
          <p style={{ color: 'var(--muted)' }}>
            HR gave you a temporary password. Choose a new one to continue.
          </p>
        )}
        {error && <Alert>{error}</Alert>}
        <form onSubmit={onSubmit} noValidate>
          <PasswordField
            label="Current password"
            autoComplete="current-password"
            error={errors.current?.message}
            {...register('current')}
          />
          <PasswordField
            label="New password"
            autoComplete="new-password"
            hint="At least 12 characters. Other devices are signed out."
            error={errors.password?.message}
            {...register('password')}
          />
          <PasswordField
            label="Confirm new password"
            autoComplete="new-password"
            error={errors.confirm?.message}
            {...register('confirm')}
          />
          <Button type="submit" variant="primary" block loading={isSubmitting}>
            Change password
          </Button>
        </form>
        {forced && (
          <p>
            <Button variant="link" onClick={() => void signOut()}>
              Sign out instead
            </Button>
          </p>
        )}
      </Card>
    </div>
  )
}
