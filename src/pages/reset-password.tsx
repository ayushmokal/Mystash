import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth';
import { resetPasswordSchema, type ResetPasswordForm } from '@/lib/validations/auth';

export function ResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { resetPassword } = useAuth();
  
  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordForm) => {
    try {
      setIsLoading(true);
      setError(null);
      await resetPassword(data.email);
      setSuccess(true);
    } catch (err) {
      console.error('Reset password error:', err);
      setError('Failed to send reset password email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Reset your password</h1>
          <p className="mt-2 text-gray-600">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        {success ? (
          <div className="space-y-6">
            <div className="flex items-center gap-2 rounded-md bg-green-50 p-4 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <p>Check your email for a link to reset your password.</p>
            </div>
            <Button asChild className="w-full">
              <Link to="/login">Return to login</Link>
            </Button>
          </div>
        ) : (
          <>
            {error && (
              <div className="flex items-center gap-2 rounded-md bg-red-50 p-4 text-sm text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  {...register('email')}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send reset link'}
              </Button>

              <div className="text-center">
                <Link to="/login" className="text-sm text-purple-600 hover:underline">
                  Back to login
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}