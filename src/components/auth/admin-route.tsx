import { useAuth, useUser } from '@clerk/clerk-react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { Loader2, ShieldX } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { clearAllStores } from '@/stores';

interface AdminRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * Wrapper component for admin-only routes.
 * - Redirects to sign-in if not authenticated (Clerk session missing).
 * - Shows "Access Denied" if the user's role in the Zustand store is 'user'.
 * - Grants access only to admin / super_admin / moderator roles.
 */
export function AdminRoute({
  children,
  redirectTo = '/admin/sign-in'
}: AdminRouteProps) {
  const { isLoaded, isSignedIn, signOut } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  // Read the role stored after DB sync
  const storedUser = useAuthStore((state) => state.user);

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Redirect to admin sign-in if not authenticated
  if (!isSignedIn) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // ✅ STRICT ROLE GUARD: Block any non-admin user who has a stored role of 'user'
  // This acts as a second line of defense after AuthInitializer.
  if (storedUser && storedUser.role === 'user') {
    console.warn('🚫 AdminRoute: Blocking access — stored role is "user".');

    const handleSignOut = async () => {
      clearAllStores();
      await signOut(() => navigate('/admin/sign-in'));
    };

    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background gap-6 px-4">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <div className="h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <ShieldX className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your account does not have administrator privileges.
              <br />
              This dashboard is restricted to admin accounts only.
            </p>
          </div>
          <Button
            variant="destructive"
            className="w-full sm:w-auto"
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
          <p className="text-xs text-muted-foreground">
            If you believe this is an error, contact your system administrator.
          </p>
        </div>
      </div>
    );
  }

  console.log('🛡️ AdminRoute: Access Granted', {
    userId: user?.id,
    email: user?.primaryEmailAddress?.emailAddress,
    role: storedUser?.role ?? 'pending-sync',
  });

  // Render children if authenticated and role is valid
  return <>{children}</>;
}

export default AdminRoute;
