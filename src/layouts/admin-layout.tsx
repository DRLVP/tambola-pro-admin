import { Link, Outlet, useLocation } from 'react-router';
import { useState } from 'react';
import { useAuth, useUser, UserButton, SignedIn, SignedOut } from '@clerk/clerk-react';
import {
  LayoutDashboard,
  Gamepad2,
  Users,
  Ticket,
  Settings,
  BarChart3,
  Trophy,
  Menu,
  LogOut,
  Sun,
  Moon,
  ChevronLeft,
  PlusCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';

const sidebarLinks = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Games',
    href: '/admin/games',
    icon: Gamepad2,
    children: [
      { title: 'All Games', href: '/admin/games' },
      { title: 'Create Game', href: '/admin/games/create' },
    ],
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: 'Tickets',
    href: '/admin/tickets',
    icon: Ticket,
  },
  {
    title: 'Reports',
    href: '/admin/reports',
    icon: BarChart3,
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

export function AdminLayout() {
  const location = useLocation();
  const { signOut } = useAuth();
  const { user } = useUser();
  const [isDark, setIsDark] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const isLinkActive = (href: string) => {
    if (href === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-16 border-b">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600">
          <Trophy className="h-5 w-5 text-white" />
        </div>
        {(!isSidebarCollapsed || isMobileOpen) && (
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-tight">Tambola Pro</span>
            <span className="text-xs text-muted-foreground">Admin Panel</span>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {(!isSidebarCollapsed || isMobileOpen) && (
        <div className="p-4 border-b">
          <Link to="/admin/games/create" onClick={() => setIsMobileOpen(false)}>
            <Button className="w-full gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
              <PlusCircle className="h-4 w-4" />
              Create Game
            </Button>
          </Link>
        </div>
      )}

      {/* Nav Links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          const isActive = isLinkActive(link.href);
          return (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {(!isSidebarCollapsed || isMobileOpen) && link.title}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t space-y-2">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {(!isSidebarCollapsed || isMobileOpen) && 'Sign Out'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col border-r bg-background transition-all duration-300 relative',
          isSidebarCollapsed ? 'w-[70px]' : 'w-64'
        )}
      >
        <SidebarContent />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute bottom-20 -right-3 h-6 w-6 rounded-full border bg-background shadow-md hidden lg:flex"
        >
          <ChevronLeft className={cn('h-4 w-4 transition-transform', isSidebarCollapsed && 'rotate-180')} />
        </Button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40">
          {/* Mobile Menu */}
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <SidebarContent />
            </SheetContent>
          </Sheet>

          <div className="hidden lg:flex items-center gap-2">
            <h1 className="text-lg font-semibold">Admin Panel</h1>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {/* Clerk UserButton for signed-in users */}
            <SignedIn>
              <div className="flex items-center gap-2">
                <span className="hidden md:block text-sm font-medium">
                  {user?.firstName || 'Admin'}
                </span>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: 'h-8 w-8',
                      userButtonPopoverCard: 'shadow-xl',
                    },
                  }}
                  afterSignOutUrl="/"
                />
              </div>
            </SignedIn>

            {/* Fallback for signed-out (shouldn't happen with AdminRoute) */}
            <SignedOut>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 px-2">
                    <span className="hidden md:block text-sm font-medium">Admin</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/admin/sign-in">Sign In</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SignedOut>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}

export default AdminLayout;
