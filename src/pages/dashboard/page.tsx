import { useEffect } from 'react';
import { Link } from 'react-router';
import {
  Users,
  Gamepad2,
  Ticket,
  TrendingUp,
  CalendarDays,
  ArrowRight,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminStatsStore } from '@/stores/admin-stats-store';

import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export function AdminDashboard() {
  const { stats, isLoading, error, fetchStats } = useAdminStatsStore();
  // We can use a local state for initial load to prevent hydration issues if needed,
  // but store handles loading state well.

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (isLoading && !stats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-[400px] rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your platform.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/games/create">
            <Button className="gap-2">
              <Gamepad2 className="h-4 w-4" />
              Create New Game
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/admin/reports" className="block w-full h-full">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(stats?.totalRevenue || 0)}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/admin/games" className="block w-full h-full">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
                  <Gamepad2 className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats?.totalGames || 0}</div>
                  <p className="text-sm text-muted-foreground">Total Games</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/admin/users" className="block w-full h-full">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                  <p className="text-sm text-muted-foreground">Total Players</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/admin/games?status=active" className="block w-full h-full">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                  <Activity className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats?.activeGames || 0}</div>
                  <p className="text-sm text-muted-foreground">Active Games</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid lg:grid-cols-7 gap-6">
        {/* Recent Games */}
        <Card className="lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Games</CardTitle>
              <CardDescription>Latest games created on the platform</CardDescription>
            </div>
            <Link to="/admin/games">
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {!stats?.recentGames || stats.recentGames.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No recent games found.
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recentGames.map((game: any) => (
                  <Link key={game._id} to={`/admin/games/${game._id}/control`} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center font-bold text-violet-600">
                        {game.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{game.name}</p>
                          {game.status === 'completed' && game.winners && game.winners.length > 0 && (
                            <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">
                              Winner: {game.winners[0].userName || 'Unknown'}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {game.createdAt ? new Date(game.createdAt).toLocaleString(undefined, {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          }) : '-'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {game.soldTickets || 0}/{game.settings?.maxTickets || game.maxPlayers}
                      </p>
                      <p className="text-xs text-muted-foreground">Tickets Sold</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Link to="/admin/games/create">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <Gamepad2 className="h-5 w-5" />
                Create Game
              </Button>
            </Link>
            <Link to="/admin/users">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <Users className="h-5 w-5" />
                Manage Users
              </Button>
            </Link>
            <Link to="/admin/tickets">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <Ticket className="h-5 w-5" />
                View Tickets
              </Button>
            </Link>
            <Link to="/admin/reports">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <CalendarDays className="h-5 w-5" />
                View Reports
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AdminDashboard;
