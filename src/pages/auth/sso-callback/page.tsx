import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react';

export default function SSOCallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <AuthenticateWithRedirectCallback
          signInForceRedirectUrl="/admin/dashboard"
          signUpForceRedirectUrl="/admin/dashboard"
        />
        <p className="mt-4 text-muted-foreground animate-pulse">
          Verifying credentials...
        </p>
      </div>
    </div>
  );
}