import { createBrowserRouter, RouterProvider } from 'react-router';
import { ClerkProvider } from '@clerk/clerk-react';
import { AuthInitializer } from '@/components/auth/auth-initializer';
import { AdminRoute } from '@/components/auth/admin-route';
import { AdminLayout } from '@/layouts/admin-layout';

// Redirect Page
import RedirectToAdmin from '@/pages/redirect-to-admin';
import NotFoundPage from '@/pages/not-found';

// Auth Pages
import SignInPage from '@/pages/auth/sign-in/page';

// Admin Pages (Admin Protected)
import AdminDashboardPage from '@/pages/dashboard/page';
import AdminGamesListPage from '@/pages/games/page';
import AdminGameCreatePage from '@/pages/games/create';
import AdminGameEditPage from '@/pages/games/[id]/edit';
import AdminGameControlPage from '@/pages/games/[id]/control';
import AdminUsersPage from '@/pages/users/page';
import AdminTicketsPage from '@/pages/tickets/page';
import AdminReportsPage from '@/pages/reports/page';
import AdminSettingsPage from '@/pages/settings/page';
import SSOCallbackPage from '@/pages/auth/sso-callback/page';

// Get Clerk Publishable Key from environment
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error('Missing Clerk Publishable Key. Please add VITE_CLERK_PUBLISHABLE_KEY to your .env file');
}

// Create Router Configuration - Admin Only
const router = createBrowserRouter([
  // ADD THIS ROUTE (before the /admin protected route)
  {
    path: '/admin/sso-callback',
    element: (
      <ClerkProvider publishableKey={clerkPubKey}>
        <AuthInitializer>
          <SSOCallbackPage />
        </AuthInitializer>
      </ClerkProvider>
    ),
  },
  // Root redirect to admin
  {
    path: '/',
    element: (
      <ClerkProvider publishableKey={clerkPubKey}>
        <RedirectToAdmin />
      </ClerkProvider>
    ),
  },

  // Admin Sign In (Public)
  {
    path: '/admin/sign-in',
    element: (
      <ClerkProvider publishableKey={clerkPubKey}>
        <AuthInitializer>
          <SignInPage />
        </AuthInitializer>
      </ClerkProvider>
    ),
  },

  // Admin Routes (Protected)
  {
    path: '/admin',
    element: (
      <ClerkProvider publishableKey={clerkPubKey}>
        <AuthInitializer>
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        </AuthInitializer>
      </ClerkProvider>
    ),
    children: [
      {
        index: true,
        element: <AdminDashboardPage />,
      },
      {
        path: 'dashboard',
        element: <AdminDashboardPage />,
      },
      {
        path: 'games',
        element: <AdminGamesListPage />,
      },
      {
        path: 'games/create',
        element: <AdminGameCreatePage />,
      },
      {
        path: 'games/:id/edit',
        element: <AdminGameEditPage />,
      },
      {
        path: 'games/:id/control',
        element: <AdminGameControlPage />,
      },
      {
        path: 'users',
        element: <AdminUsersPage />,
      },
      {
        path: 'tickets',
        element: <AdminTicketsPage />,
      },
      {
        path: 'reports',
        element: <AdminReportsPage />,
      },
      {
        path: 'settings',
        element: <AdminSettingsPage />,
      },
    ],
  },

  // 404 Not Found (catch all)
  {
    path: '*',
    element: (
      <ClerkProvider publishableKey={clerkPubKey}>
        <NotFoundPage />
      </ClerkProvider>
    ),
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}

export default Router;
