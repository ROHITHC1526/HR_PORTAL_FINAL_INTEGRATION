import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { resetPassword } from '@/api/auth'
import { ApiError } from '@/api/client'
import { AuthLayout } from '@/components/AuthLayout'
import { Alert, Button, PasswordField } from '@/components/ui'
import { passwordRules } from '@/domain/password'

const schema = z
  .object({ password: passwordRules, confirm: z.string() })
  .refine((v) => v.password === v.confirm, {
    path: ['confirm'],
    message: 'The two passwords do not match.',
  })
type Form = z.infer<typeof schema>

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) })

  if (!token) {
    return (
      <AuthLayout title="Choose a new password">
        <Alert>
          This link is incomplete. Open the link from your email again, or request a new one.
        </Alert>
        <Link to="/forgot-password">Request a new link</Link>
      </AuthLayout>
    )
  }

  const onSubmit = handleSubmit(async ({ password }) => {
    setError(null)
    try {
      await resetPassword(token, password)
      setDone(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
    }
  })

  return (
    <AuthLayout title="Choose a new password">
      {done ? (
        <>
          <Alert kind="ok">Your password was changed. You can sign in now.</Alert>
          <Link to="/login">Go to sign in</Link>
        </>
      ) : (
        <form onSubmit={onSubmit} noValidate>
          {error && (
            <Alert>
              {error} <Link to="/forgot-password">Request a new link</Link>
            </Alert>
          )}
          <PasswordField
            label="New password"
            autoComplete="new-password"
            hint="At least 12 characters."
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
      )}
    </AuthLayout>
  )
}
