import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { forgotPassword } from '@/api/auth'
import { AuthLayout } from '@/components/AuthLayout'
import { Alert, Button, TextField } from '@/components/ui'

const schema = z.object({
  email: z.string().trim().min(1, 'Enter your work email.').email('Enter a valid email.'),
})
type Form = z.infer<typeof schema>

export function ForgotPasswordPage() {
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) })

  const onSubmit = handleSubmit(async ({ email }) => {
    setError(null)
    try {
      await forgotPassword(email)
      // Same message whether or not the account exists, so nobody can probe for addresses.
      setDone(true)
    } catch {
      setError('Something went wrong. Please try again in a minute.')
    }
  })

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your work email and we will send you a reset link."
    >
      {done ? (
        <Alert kind="ok">
          If an account exists for that email, a reset link is on its way. It expires in 30 minutes.
        </Alert>
      ) : (
        <form onSubmit={onSubmit} noValidate>
          {error && <Alert>{error}</Alert>}
          <TextField
            label="Work email"
            type="email"
            autoComplete="username"
            error={errors.email?.message}
            {...register('email')}
          />
          <Button type="submit" variant="primary" block loading={isSubmitting}>
            Send reset link
          </Button>
        </form>
      )}
      <p>
        <Link to="/login">Back to sign in</Link>
      </p>
    </AuthLayout>
  )
}
