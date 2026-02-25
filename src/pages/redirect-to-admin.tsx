import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Loader2 } from 'lucide-react';

/**
 * Simple redirect component that sends users to admin panel
 */
export function RedirectToAdmin() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/admin', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        <p className="text-muted-foreground">Redirecting to Admin Panel...</p>
      </div>
    </div>
  );
}

export default RedirectToAdmin;
