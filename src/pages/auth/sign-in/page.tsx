import { useClerk, useUser } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { Trophy, Shield, Loader2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { authService } from '@/services/auth.service';

export function AdminSignInPage() {
  const clerk = useClerk();
  const { isSignedIn, user, isLoaded } = useUser();
  const navigate = useNavigate();

  // State to track status
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInWithGoogle = async () => {

    try {
      setIsLoading(true);
      setError(null);

      // Redirect to admin dashboard after login
      await clerk.client.signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/admin/sso-callback',
        redirectUrlComplete: '/admin/dashboard',
      });

    } catch (err: any) {
      console.error('Sign in error:', err);
      setIsLoading(false);

      const errorMessage = err.errors?.[0]?.message || err.message || 'Failed to sign in. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Logic: Sync Admin data AFTER Sign In
  useEffect(() => {
    const syncAdminUser = async () => {
      // Only run if signed in and loaded
      if (isLoaded && isSignedIn && user) {
        try {
          // 1. Assign admin role
          await authService.assignRole({
            role: 'admin',
            clerkId: user.id,
            email: user.primaryEmailAddress?.emailAddress || '',
            name: user.fullName || 'Admin User',
          });

          // 2. Sync admin data
          await authService.syncAdmin({
            clerkId: user.id,
            email: user.primaryEmailAddress?.emailAddress || '',
            name: user.fullName || 'Admin User',
          });

          toast.success('Welcome back');

          // Force navigation to dashboard
          navigate('/admin/dashboard', { replace: true });
        } catch (error) {
          console.error('Failed to assign role:', error);
          toast.error('Failed to initialize admin session');
        }
      }
    };

    if (isSignedIn && isLoaded) {
      syncAdminUser();
    }
  }, [isLoaded, isSignedIn, user, navigate]);

  // If already signed in, auto-redirect to dashboard
  if (isLoaded && isSignedIn) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // If already signed in (and syncing happens), show loader or nothing
  if (isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
          <p className="text-muted-foreground">Initializing Admin Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 shadow-lg shadow-emerald-500/25">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-2xl bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Tambola Pro
            </span>
          </Link>
          <div className="mt-3 flex items-center justify-center gap-2 text-muted-foreground">
            <Shield className="h-4 w-4 text-emerald-600" />
            <span>Admin Portal</span>
          </div>
        </div>

        {/* Custom Admin Sign-In Card */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Login</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Restricted access area
              </p>
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={signInWithGoogle}
              disabled={isLoading}
              className="w-full relative flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              ) : (
                <>
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span className="font-medium text-gray-700 dark:text-gray-200">
                    Sign in with Google
                  </span>
                </>
              )}
            </button>

            <div id="clerk-captcha" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSignInPage;
