import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ApiError } from '@/api/client'
import { useAuth } from '@/auth/AuthContext'
import { AuthLayout } from '@/components/AuthLayout'
import { Alert, Button, PasswordField, TextField } from '@/components/ui'

const schema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Enter your work email.')
    .email('Enter a valid email, like name@brightcone.ai.'),
  password: z.string().min(1, 'Enter your password.'),
  remember: z.boolean(),
})
type Form = z.infer<typeof schema>

export function LoginPage() {
  const { status, user, notice, signIn, clearNotice } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { remember: true } })

  if (status === 'authenticated' && user) {
    return <Navigate to={user.must_change_password ? '/change-password' : from} replace />
  }

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null)
    clearNotice()
    try {
      const me = await signIn(values.email, values.password, values.remember)
      navigate(me.must_change_password ? '/change-password' : from, { replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        // 401 = wrong credentials, 403 = locked/disabled, 429 = slow down. The server words them safely.
        setServerError(err.message)
      } else {
        setServerError('We could not reach the server. Check your connection and try again.')
      }
    }
  })

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Use your Brightcone work email. You will see the pages for your role."
    >
      {notice && <Alert kind="info">{notice}</Alert>}
      {serverError && <Alert>{serverError}</Alert>}
      <form onSubmit={onSubmit} noValidate>
        <TextField
          label="Work email"
          type="email"
          autoComplete="username"
          placeholder="name@brightcone.ai"
          error={errors.email?.message}
          {...register('email')}
        />
        <PasswordField
          label="Password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <div className="row">
          <label>
            <input type="checkbox" {...register('remember')} /> Keep me signed in
          </label>
          <Link to="/forgot-password">Forgot password?</Link>
        </div>
        <Button type="submit" variant="primary" block loading={isSubmitting}>
          Sign in
        </Button>
      </form>
      <div className="auth-reference-divider" aria-hidden="true">
        or
      </div>
      <button type="button" className="auth-coming-soon" disabled aria-disabled="true">
        Continue with Microsoft · Coming soon
      </button>
      <div className="auth-demo-note">
        <strong>Demo accounts · Coming soon</strong>
        Demo sign-in details are not available from the connected authentication service.
      </div>
    </AuthLayout>
  )
}
