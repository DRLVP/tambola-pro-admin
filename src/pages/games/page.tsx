import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  MoreHorizontal,
  Play,
  Pause,
  Trash2,
  Edit,
  Eye,
  Users,
  Gamepad2,
  Loader2,
  RefreshCw,
  Square
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from 'date-fns';
import type { Game } from '@/types';
import { gameService } from '@/services/game.service';

const statusColors: Record<Game['status'], string> = {
  waiting: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  completed: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  paused: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
};

export function AdminGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchGames = useCallback(async () => {
    try {
      setLoading(true);
      const response = await gameService.getGames({ limit: 100 }); // Fetch enough games
      setGames(response.data);
    } catch (error) {
      console.error('Failed to fetch games:', error);
      toast.error('Failed to load games');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const filteredGames = games.filter((game) => {
    const matchesSearch = game.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || game.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStartGame = async (game: Game) => {
    try {
      toast.loading(`Starting ${game.name}...`, { id: 'game-start' });
      await gameService.startGame(game._id);
      toast.success(`${game.name} started successfully`, { id: 'game-start' });
      fetchGames(); // Refresh list to get updated status
    } catch (error) {
      console.error('Failed to start game:', error);
      toast.error(`Failed to start ${game.name}`, { id: 'game-start' });
    }
  };

  const handlePauseGame = async (game: Game) => {
    try {
      toast.loading(`Pausing ${game.name}...`, { id: 'game-pause' });
      await gameService.pauseGame(game._id);
      toast.success(`${game.name} paused successfully`, { id: 'game-pause' });
      fetchGames();
    } catch (error) {
      console.error('Failed to pause game:', error);
      toast.error(`Failed to pause ${game.name}`, { id: 'game-pause' });
    }
  };

  const handleEndGame = async (game: Game) => {
    try {
      toast.loading(`Ending ${game.name}...`, { id: 'game-end' });
      await gameService.endGame(game._id);
      toast.success(`${game.name} ended successfully`, { id: 'game-end' });
      fetchGames();
    } catch (error) {
      console.error('Failed to end game:', error);
      toast.error(`Failed to end ${game.name}`, { id: 'game-end' });
    }
  };

  const handleDeleteGame = async () => {
    if (selectedGame) {
      try {
        setActionLoading(true);
        await gameService.deleteGame(selectedGame._id);
        setGames(games.filter(g => g._id !== selectedGame._id));
        toast.success('Game deleted successfully');
        setDeleteDialogOpen(false);
        setSelectedGame(null);
      } catch (error) {
        console.error('Failed to delete game:', error);
        toast.error('Failed to delete game');
      } finally {
        setActionLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Games Management</h1>
          <p className="text-muted-foreground">Create and manage Tambola games</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchGames} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link to="/admin/games/create">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Game
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="waiting">Waiting</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Games Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Games</CardTitle>
          <CardDescription>
            {loading ? 'Loading games...' : `${filteredGames.length} game${filteredGames.length !== 1 ? 's' : ''} found`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Game</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Players</TableHead>
                  <TableHead>Ticket Price</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGames.map((game) => (
                  <TableRow key={game._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{game.name}</p>
                        <p className="text-sm text-muted-foreground">by {game.hostName || 'Admin'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[game.status] || 'bg-gray-100 text-gray-700'}>
                        {game.status === 'active' && (
                          <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5 animate-pulse" />
                        )}
                        {game.status ? game.status.charAt(0).toUpperCase() + game.status.slice(1) : 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {game.currentPlayers || 0}/{game.maxPlayers}
                      </div>
                    </TableCell>
                    <TableCell>?{game.ticketPrice}</TableCell>
                    <TableCell>
                      {game.createdAt ? format(new Date(game.createdAt), 'dd MMM yyyy') : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link to={`/admin/games/${game._id}/control`} className="flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          {game.status === 'waiting' && (
                            <>
                              <DropdownMenuItem asChild>
                                <Link to={`/admin/games/${game._id}/edit`} className="flex items-center gap-2">
                                  <Edit className="h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStartGame(game)} className="text-green-600">
                                <Play className="h-4 w-4 mr-2" />
                                Start Game
                              </DropdownMenuItem>
                            </>
                          )}
                          {game.status === 'active' && (
                            <>
                              <DropdownMenuItem asChild>
                                <Link to={`/admin/games/${game._id}/control`} className="flex items-center gap-2 text-violet-600">
                                  <Gamepad2 className="h-4 w-4" />
                                  Game Control
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePauseGame(game)} className="text-amber-600">
                                <Pause className="h-4 w-4 mr-2" />
                                Pause Game
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEndGame(game)} className="text-red-600">
                                <Square className="h-4 w-4 mr-2" />
                                End Game
                              </DropdownMenuItem>
                            </>
                          )}
                          {game.status === 'paused' && (
                            <>
                              <DropdownMenuItem asChild>
                                <Link to={`/admin/games/${game._id}/control`} className="flex items-center gap-2 text-violet-600">
                                  <Gamepad2 className="h-4 w-4" />
                                  Game Control
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStartGame(game)} className="text-green-600">
                                <Play className="h-4 w-4 mr-2" />
                                Resume Game
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEndGame(game)} className="text-red-600">
                                <Square className="h-4 w-4 mr-2" />
                                End Game
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedGame(game);
                              setDeleteDialogOpen(true);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!loading && filteredGames.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No games found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Game?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedGame?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleDeleteGame(); }}
              className="bg-red-600 hover:bg-red-700"
              disabled={actionLoading}
            >
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default AdminGames;
