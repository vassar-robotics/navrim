import PageLayout from '@/components/layout/page-layout'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { AuthApi } from '@/lib/api'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle, Cog } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import * as z from 'zod'

// Define the form schema with zod
const forgotPasswordFormSchema = z.object({
  email: z.string().min(1, 'Email is required').pipe(z.email('Please enter a valid email address')),
})

// Infer the form values type from the schema
type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>

export const ForgetPasswordPage: React.FC = () => {
  const [isEmailSent, setIsEmailSent] = useState(false)

  // Initialize the form with react-hook-form and zod resolver
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: {
      email: '',
    },
  })

  // Handle form submission
  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      await AuthApi.forgotPassword(values.email)
      setIsEmailSent(true)
      toast.success('Password reset email sent!')
    } catch (error) {
      toast.error('Failed to send password reset email. Please try again.')
      console.error('Password reset error:', error)
    }
  }

  return (
    <PageLayout>
      <div className="w-full max-w-sm space-y-6">
        {/* Logo and Title */}
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center space-x-2">
            <Cog className="h-8 w-8" />
            <h1 className="text-2xl font-bold">Navrim</h1>
          </div>
          <p className="text-muted-foreground">{isEmailSent ? 'Check your email' : 'Reset your password'}</p>
        </div>

        {!isEmailSent ? (
          <>
            {/* Reset Password Form */}
            <div className="space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="name@example.com"
                            {...field}
                            disabled={form.formState.isSubmitting}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                </form>
              </Form>
            </div>

            {/* Back to sign in link */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Remember your password? </span>
              <Link to="/signin" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </>
        ) : (
          <>
            {/* Success Message */}
            <div className="space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>

              <div className="space-y-2 text-center">
                <p className="text-sm text-muted-foreground">We've sent a password reset link to:</p>
                <p className="font-medium">{form.getValues('email')}</p>
                <p className="text-sm text-muted-foreground">
                  Please check your email and follow the instructions to reset your password.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full"
                  onClick={() => {
                    setIsEmailSent(false)
                    form.reset()
                  }}
                >
                  Send Another Email
                </Button>

                <Link to="/signin" className="block">
                  <Button variant="outline" className="w-full">
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </div>

            {/* Additional help text */}
            <div className="text-center text-xs text-muted-foreground">
              <p>Didn't receive the email?</p>
              <p>Check your spam folder or try again with a different email address.</p>
            </div>
          </>
        )}
      </div>
    </PageLayout>
  )
}

export default ForgetPasswordPage
