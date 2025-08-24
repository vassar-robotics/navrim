import { useAuth } from '@/components/context/auth'
import PageLayout from '@/components/layout/page-layout'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { zodResolver } from '@hookform/resolvers/zod'
import { Cog } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import * as z from 'zod'

// Define the form schema with zod
const loginFormSchema = z.object({
  email: z.string().min(1, 'Email is required').pipe(z.email('Please enter a valid email address')),
  password: z.string().min(1, 'Password is required'),
})

// Infer the form values type from the schema
type LoginFormValues = z.infer<typeof loginFormSchema>

export const LoginPage: React.FC = () => {
  const { auth, signin, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (auth?.userProfile) {
      toast.success('Signed in successfully')
      navigate('/')
    }
  }, [auth])

  // Initialize the form with react-hook-form and zod resolver
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  // Handle form submission
  const onSubmit = async (values: LoginFormValues) => {
    await signin(values.email, values.password) // it's unnessesary to redirect to home page because it's already redirected in useEffect
      .catch((error) => {
        toast.error(error.message)
      })
  }

  // Show skeleton while checking authentication status
  if (isLoading) {
    return (
      <PageLayout>
        <div className="w-full max-w-sm space-y-6">
          {/* Logo and Title Skeleton */}
          <div className="flex flex-col items-center space-y-2">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-24" />
            </div>
            <Skeleton className="h-4 w-32" />
          </div>

          {/* Form Skeleton */}
          <div className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Forgot password link */}
            <Skeleton className="h-4 w-28" />

            {/* Submit Button */}
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Sign up link */}
          <div className="flex items-center justify-center space-x-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      </PageLayout>
    )
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
          <p className="text-muted-foreground">Sign in to your account</p>
        </div>

        {/* Login Form */}
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

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      {...field}
                      disabled={form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between">
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </Form>

        {/* Sign up link */}
        <div className="text-center text-sm">
          <span className="text-muted-foreground">Don't have an account? </span>
          <Link to="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </PageLayout>
  )
}
