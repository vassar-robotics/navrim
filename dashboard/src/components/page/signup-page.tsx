import { useAuth } from '@/components/context/auth'
import PageLayout from '@/components/layout/page-layout'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { Cog, Mail } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import * as z from 'zod'

// Define the form schema with zod
const signupFormSchema = z
  .object({
    displayName: z.string().min(1, 'Display name is required').max(32, 'Display name must be 32 characters or less'),
    email: z.string().min(1, 'Email is required').pipe(z.email('Please enter a valid email address')),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(32, 'Password must be 32 characters or less'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

// Infer the form values type from the schema
type SignupFormValues = z.infer<typeof signupFormSchema>

export const SignupPage: React.FC = () => {
  const { auth, signup } = useAuth()
  const [signupSuccess, setSignupSuccess] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (auth?.userProfile) {
      toast.success('Already logged in')
      navigate('/')
    }
  }, [auth])

  // Initialize the form with react-hook-form and zod resolver
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  // Handle form submission
  const onSubmit = async (values: SignupFormValues) => {
    await signup(values.email, values.password, values.displayName)
      .then(() => {
        setUserEmail(values.email)
        setSignupSuccess(true)
      })
      .catch((error) => {
        toast.error(error.message)
      })
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
          <p className="text-muted-foreground">{signupSuccess ? 'Check your email' : 'Create your account'}</p>
        </div>

        {signupSuccess ? (
          /* Success Message */
          <div className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="rounded-full bg-primary/10 p-4">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2 text-center">
                {/* <h3 className="text-lg font-semibold">Verify your email</h3> */}
                <p className="text-sm">We've sent a verification email to:</p>
                <p className="text-lg font-medium">{userEmail}</p>
                <p className="text-sm">
                  Please check your mailbox and click the verification link to complete your registration.
                </p>
              </div>
            </div>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Didn't receive the email? </span>
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => {
                  form.reset()
                  setSignupSuccess(false)
                }}
              >
                Try again with a different email
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Signup Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} disabled={form.formState.isSubmitting} />
                      </FormControl>
                      <FormDescription className="text-xs">
                        {field.value && !form.formState.errors.displayName && <>{field.value.length}/32 characters</>}
                      </FormDescription>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

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

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Create a password (6-32 characters)"
                          {...field}
                          disabled={form.formState.isSubmitting}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        {field.value && !form.formState.errors.password && (
                          <>
                            {field.value.length < 6
                              ? `${6 - field.value.length} more characters needed`
                              : `${field.value.length}/32 characters`}
                          </>
                        )}
                      </FormDescription>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Confirm your password"
                          {...field}
                          disabled={form.formState.isSubmitting}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <div className="text-xs text-muted-foreground">
                  By signing up, you agree to our{' '}
                  <Link to="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </div>

                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Creating account...' : 'Sign Up'}
                </Button>
              </form>
            </Form>

            {/* Sign in link */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link to="/signin" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </PageLayout>
  )
}
