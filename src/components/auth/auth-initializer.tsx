import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useNavigate, useLocation } from 'react-router';
import { setAuthTokenGetter } from '@/services/api';
import { authService } from '@/services/auth.service';
import { useAuthStore, clearAllStores } from '@/stores';
import { Loader2, AlertCircle, ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';

type WorkflowStatus = 'loading' | 'syncing' | 'ready' | 'error' | 'forbidden';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { getToken, isSignedIn, isLoaded, signOut } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const [status, setStatus] = useState<WorkflowStatus>('loading');

  // Handle logout with store cleanup
  const handleSignOut = async () => {
    console.log('🚪 Signing out and clearing stores...');
    clearAllStores();
    await signOut(() => navigate('/admin/sign-in'));
  };

  useEffect(() => {
    // 1. Initialize Token Getter (Always needed)
    setAuthTokenGetter(async () => {
      try { return await getToken(); } catch { return null; }
    });

    const initWorkflow = async () => {
      // A. Wait for Clerk to load
      if (!isLoaded) return;

      // B. Public Routes (Sign In) - Skip Sync
      if (location.pathname.includes('/sign-in') || location.pathname.includes('/sso-callback')) {
        setStatus('ready');
        return;
      }

      // C. Session Check
      if (!isSignedIn) {
        console.log('🔒 No session found, redirecting to login...');
        navigate('/admin/sign-in');
        return;
      }

      // D. Database Check & Registration (Sync)
      if (user) {
        // Skip sync if user is already in store
        if (useAuthStore.getState().isUserSynced(user.id)) {
          console.log('✅ User already synced (from cache)');
          if (status !== 'ready') setStatus('ready');
          return;
        }

        setStatus('syncing');
        try {
          console.log('🔄 Syncing user with database...');

          const response = await authService.syncAdmin({
            clerkId: user.id,
            email: user.primaryEmailAddress?.emailAddress || '',
            name: user.fullName || 'Admin',
          });

          if (response.data) {
            // Backend already enforces role — only admin/super_admin/moderator reach here
            useAuthStore.getState().setUser({
              id: response.data.userId,
              clerkId: user.id,
              email: user.primaryEmailAddress?.emailAddress || '',
              name: user.fullName || 'Admin',
              role: response.data.role as 'admin' | 'super_admin' | 'moderator',
            });
          }

          console.log('✅ Admin verified and synced.');
          setStatus('ready');
        } catch (error) {
          // 403 = role is 'user' — backend explicitly blocked access
          if (axios.isAxiosError(error) && error.response?.status === 403) {
            console.warn('🚫 Backend returned 403 — role=user, access denied.');
            setStatus('forbidden');
            return;
          }
          console.error('❌ Sync failed:', error);
          setStatus('error');
        }
      }
    };

    initWorkflow();
  }, [isLoaded, isSignedIn, user, location.pathname, getToken, navigate]);
  // Note: setUser and isUserSynced are excluded - Zustand actions are stable

  // --- RENDER STATES ---

  if (status === 'loading' || status === 'syncing') {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-violet-600" />
        <div className="flex flex-col items-center text-muted-foreground animate-pulse">
          <p className="font-medium">
            {status === 'loading' ? 'Verifying Session...' : 'Syncing Database...'}
          </p>
          <p className="text-sm">Please wait while we set up your workspace</p>
        </div>
      </div>
    );
  }

  if (status === 'forbidden') {
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
          <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            If you believe this is an error, contact your system administrator.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background gap-4">
        <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold">Authentication Failed</h2>
        <p className="text-muted-foreground">We couldn't verify your account with the server.</p>
        <div className="flex gap-2 mt-2">
          <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
          <Button variant="destructive" onClick={handleSignOut}>Sign Out</Button>
        </div>
      </div>
    );
  }

  // Ready State: Render the App
  return <>{children}</>;
}

export default AuthInitializer;