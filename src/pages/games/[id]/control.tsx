import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Play,
  Pause,
  Square,
  RotateCcw,
  Users,
  Trophy,
  Timer,
  Hash,
  Loader2,
  Volume2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AdminNumberPad } from '@/components/admin-number-pad';
import { cn } from '@/lib/utils';
import { gameService } from '@/services/game.service';
import { useSocketStore } from '@/stores/socket-store';
import { areAllRulesCompleted, PATTERN_DEFINITIONS } from '@/lib/game-rules';
import type { Game, GameRule } from '@/types';

// Status colors
const statusColors: Record<string, string> = {
  waiting: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  paused: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  completed: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};



export function AdminGameControl() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { initializeSocket, joinGame, leaveGame, socket, isConnected } = useSocketStore();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [lastNumber, setLastNumber] = useState<number | null>(null);
  const [showEndDialog, setShowEndDialog] = useState(false);

  // Load game data
  useEffect(() => {
    async function loadGame() {
      if (!id) return;

      try {
        setLoading(true);
        setError(false);
        const response = await gameService.getGame(id);
        if (response.success) {
          setGame(response.data);
          if (response.data.calledNumbers.length > 0) {
            setLastNumber(response.data.calledNumbers[response.data.calledNumbers.length - 1]);
          }
        }
      } catch (error) {
        console.error('Failed to load game:', error);
        setError(true);
        toast.error('Failed to load game details');
      } finally {
        setLoading(false);
      }
    }

    loadGame();
  }, [id]);

  // Initialize socket and join game room
  useEffect(() => {
    initializeSocket();
  }, [initializeSocket]);

  useEffect(() => {
    if (isConnected && id) {
      joinGame(id);
      return () => {
        leaveGame(id);
      };
    }
  }, [isConnected, id, joinGame, leaveGame]);

  // Socket listeners
  useEffect(() => {
    if (!socket || !id) return;

    const handleNumberCalled = (data: { number: number, gameId: string } | number) => {
      const newNumber = typeof data === 'object' ? data.number : data;

      setGame(prev => {
        if (!prev) return prev;
        // Avoid duplicate updates if already present
        if (prev.calledNumbers.includes(newNumber)) return prev;

        return {
          ...prev,
          calledNumbers: [...prev.calledNumbers, newNumber]
        };
      });
      setLastNumber(newNumber);
    };

    // Winner claimed — refresh full game data to sync rules & winners
    const handleWinnerClaimed = async () => {
      try {
        const response = await gameService.getGame(id!);
        if (response.success && response.data) {
          setGame(response.data);
          toast.success('🏆 A prize has been won!');
        }
      } catch (err) {
        console.error('Failed to refresh game on winner:', err);
      }
    };

    const handleGameEnded = () => {
      setGame(prev => prev ? { ...prev, status: 'completed', endedAt: new Date().toISOString() } : null);
      toast.info('Game has been ended');
    };

    const handleGamePaused = () => {
      setGame(prev => prev ? { ...prev, status: 'paused' } : null);
      toast.info('Game has been paused');
    };

    const handleGameResumed = () => {
      setGame(prev => prev ? { ...prev, status: 'active' } : null);
      toast.info('Game has been resumed');
    };

    socket.on('game:number-called', handleNumberCalled);
    socket.on('game:winner-claimed', handleWinnerClaimed);
    socket.on('game:ended', handleGameEnded);
    socket.on('game:paused', handleGamePaused);
    socket.on('game:resumed', handleGameResumed);

    return () => {
      socket.off('game:number-called', handleNumberCalled);
      socket.off('game:winner-claimed', handleWinnerClaimed);
      socket.off('game:ended', handleGameEnded);
      socket.off('game:paused', handleGamePaused);
      socket.off('game:resumed', handleGameResumed);
    };
  }, [socket, id]);

  // Check for auto game completion
  useEffect(() => {
    if (game && game.status === 'active' && areAllRulesCompleted(game.rules)) {
      handleEndGame(true);
    }
  }, [game?.rules]);

  // Manual random number call (calls backend)
  const handleManualCall = async () => {
    if (!game || game.status !== 'active' || !id) return;

    const called = new Set(game.calledNumbers);
    const uncalled = Array.from({ length: 90 }, (_, i) => i + 1).filter(n => !called.has(n));

    if (uncalled.length === 0) return;

    const newNumber = uncalled[Math.floor(Math.random() * uncalled.length)];

    // Call API
    try {
      await gameService.callNumber(id, newNumber);
      // State update will happen via socket listener or we can update here safely
      // Updating here for immediate feedback, socket will reconcile
      // But user requested "state updates only happen after successful API response"
      setGame(prev => {
        if (!prev) return null;
        if (prev.calledNumbers.includes(newNumber)) return prev;
        return { ...prev, calledNumbers: [...prev.calledNumbers, newNumber] };
      });
      setLastNumber(newNumber);
      toast.success(`Number ${newNumber} called`);
    } catch (error) {
      console.error('Failed to call number:', error);
      toast.error('Failed to call number');
    }
  };

  // Manual specific number call from AdminNumberPad
  const handleManualNumberCall = async (number: number): Promise<void> => {
    if (!id || !game) return;

    // Validate: check if already called
    if (game.calledNumbers.includes(number)) {
      toast.error(`Number ${number} has already been called!`);
      return;
    }

    // Call backend API first
    try {
      await gameService.callNumber(id, number);

      // Update state AFTER successful API call
      setGame(prev => {
        if (!prev) return null;
        if (prev.calledNumbers.includes(number)) return prev;
        return {
          ...prev,
          calledNumbers: [...prev.calledNumbers, number],
        };
      });
      setLastNumber(number);

      toast.success(`Number ${number} called successfully`);
    } catch (error) {
      console.error('Failed to call number:', error);
      toast.error('Failed to call number');
    }
  };

  // Start game
  const handleStartGame = async () => {
    if (!id || !game) return;

    setActionLoading('start');
    try {
      await gameService.startGame(id);
      // Update state only on success
      setGame(prev => prev ? {
        ...prev,
        status: 'active',
        startedAt: new Date().toISOString(),
      } : null);
      toast.success('Game started successfully!');
    } catch (error) {
      console.error('Failed to start game:', error);
      toast.error('Failed to start game');
    } finally {
      setActionLoading(null);
    }
  };

  // Pause game
  const handlePauseGame = async () => {
    if (!id || !game) return;

    setActionLoading('pause');
    try {
      await gameService.pauseGame(id);
      setGame(prev => prev ? { ...prev, status: 'paused' } : null);
      toast.success('Game paused');
    } catch (error) {
      console.error('Failed to pause game:', error);
      toast.error('Failed to pause game');
    } finally {
      setActionLoading(null);
    }
  };

  // Resume game
  const handleResumeGame = async () => {
    if (!id || !game) return;

    setActionLoading('resume');
    try {
      await gameService.resumeGame(id);
      setGame(prev => prev ? { ...prev, status: 'active' } : null);
      toast.success('Game resumed');
    } catch (error) {
      console.error('Failed to resume game:', error);
      toast.error('Failed to resume game');
    } finally {
      setActionLoading(null);
    }
  };

  // End game
  const handleEndGame = async (auto: boolean = false) => {
    if (!id || !game) return;

    setActionLoading('end');
    setShowEndDialog(false);

    try {
      await gameService.endGame(id);
      setGame(prev => prev ? {
        ...prev,
        status: 'completed',
        endedAt: new Date().toISOString(),
      } : null);

      if (auto) {
        toast.success('🎉 Game completed! All rules have been fulfilled.');
      } else {
        toast.success('Game ended successfully');
      }

      // Redirect to results after delay
      setTimeout(() => {
        navigate('/admin/games');
      }, 2000);
    } catch (error) {
      console.error('Failed to end game:', error);
      toast.error('Failed to end game');
    } finally {
      setActionLoading(null);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-destructive font-medium">Failed to load game</p>
        <Button onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">Game not found</p>
        <Link to="/admin/games">
          <Button>Back to Games</Button>
        </Link>
      </div>
    );
  }

  const sortedRules = [...game.rules].sort((a, b) => a.order - b.order);
  const completedRules = sortedRules.filter(r => r.isCompleted).length;
  const totalPrize = sortedRules.reduce((sum, r) => sum + r.prizeAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3 sm:gap-4">
        <Link to="/admin/games">
          <Button variant="ghost" size="icon" className="flex-shrink-0 mt-1">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold truncate">{game.name}</h1>
            <Badge className={statusColors[game.status]}>
              {game.status === 'active' && (
                <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5 animate-pulse" />
              )}
              {game.status.charAt(0).toUpperCase() + game.status.slice(1)}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">Game Control Panel</p>
        </div>
      </div>

      {/* Control Buttons */}
      <Card className="border-2 border-violet-200 dark:border-violet-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-violet-500" />
            Game Controls
          </CardTitle>
          <CardDescription>
            Manage the game state. Game will auto-end when all rules are completed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {/* Start Button */}
            {game.status === 'waiting' && (
              <Button
                size="lg"
                className="gap-2 bg-green-600 hover:bg-green-700"
                onClick={handleStartGame}
                disabled={actionLoading === 'start'}
              >
                {actionLoading === 'start' ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
                Start Game
              </Button>
            )}

            {/* Pause Button */}
            {game.status === 'active' && (
              <Button
                size="lg"
                variant="outline"
                className="gap-2 border-orange-500 text-orange-600 hover:bg-orange-50"
                onClick={handlePauseGame}
                disabled={actionLoading === 'pause'}
              >
                {actionLoading === 'pause' ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Pause className="h-5 w-5" />
                )}
                Pause Game
              </Button>
            )}

            {/* Resume Button */}
            {game.status === 'paused' && (
              <Button
                size="lg"
                className="gap-2 bg-green-600 hover:bg-green-700"
                onClick={handleResumeGame}
                disabled={actionLoading === 'resume'}
              >
                {actionLoading === 'resume' ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <RotateCcw className="h-5 w-5" />
                )}
                Resume Game
              </Button>
            )}

            {/* End Button */}
            {(game.status === 'active' || game.status === 'paused') && (
              <Button
                size="lg"
                variant="destructive"
                className="gap-2"
                onClick={() => setShowEndDialog(true)}
                disabled={actionLoading === 'end'}
              >
                {actionLoading === 'end' ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Square className="h-5 w-5" />
                )}
                End Game
              </Button>
            )}

            {/* Manual Call Button */}
            {game.status === 'active' && (
              <Button
                size="lg"
                variant="secondary"
                className="gap-2"
                onClick={handleManualCall}
              >
                <Volume2 className="h-5 w-5" />
                Call Number
              </Button>
            )}

            {/* View Results */}
            {game.status === 'completed' && (
              <Link to="/admin/games">
                <Button size="lg" className="gap-2">
                  <Trophy className="h-5 w-5" />
                  View Results
                </Button>
              </Link>
            )}
          </div>

          {/* Auto-play indicator */}
          {game.settings?.autoPlay && game.status === 'active' && (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Auto-play enabled ({Math.round(game.settings.autoPlayInterval / 1000)}s interval)
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Game Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-violet-500" />
              Game Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Last Called Number */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30">
              <span className="font-medium">Last Called</span>
              <span className="text-4xl font-bold text-violet-700 dark:text-violet-300">
                {lastNumber || '--'}
              </span>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Hash className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{game.calledNumbers.length}/90</p>
                  <p className="text-sm text-muted-foreground">Numbers Called</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{game.currentPlayers}</p>
                  <p className="text-sm text-muted-foreground">Players</p>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Number Progress</span>
                <span>{Math.round((game.calledNumbers.length / 90) * 100)}%</span>
              </div>
              <Progress value={(game.calledNumbers.length / 90) * 100} />
            </div>
          </CardContent>
        </Card>

        {/* Rules Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Rules & Prizes
            </CardTitle>
            <CardDescription>
              {completedRules}/{sortedRules.length} rules completed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {sortedRules.map((rule) => (
              <RuleItem
                key={rule.id}
                rule={rule}
              />
            ))}

            <Separator />

            <div className="flex justify-between items-center p-3 rounded-lg bg-green-50 dark:bg-green-950/30">
              <span className="font-medium">Total Prize Pool</span>
              <span className="text-xl font-bold text-green-600">
                {totalPrize.toLocaleString()} XP
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Number Pad - Manual Number Control */}
      {(game.status === 'active' || game.status === 'paused') && (
        <AdminNumberPad
          calledNumbers={game.calledNumbers}
          lastCalledNumber={lastNumber}
          onCallNumber={handleManualNumberCall}
          disabled={game.status !== 'active'}
        />
      )}

      {/* End Game Confirmation Dialog */}
      <AlertDialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              End Game?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to end this game? This action cannot be undone.
              {completedRules < sortedRules.length && (
                <span className="block mt-2 text-amber-600">
                  Warning: {sortedRules.length - completedRules} rules are still incomplete.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleEndGame(false)}
              className="bg-red-600 hover:bg-red-700"
            >
              End Game
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


    </div>
  );
}


// Rule item component
function RuleItem({ rule }: { rule: GameRule }) {
  return (
    <div className={cn(
      'flex items-center justify-between p-3 rounded-lg border transition-colors',
      rule.isCompleted
        ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
        : 'bg-muted/30'
    )}>
      <div className="flex items-center gap-3">
        <div className={cn(
          'h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold',
          rule.isCompleted
            ? 'bg-green-500 text-white'
            : 'bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300'
        )}>
          {rule.isCompleted ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            rule.order
          )}
        </div>
        <div>
          <p className="font-medium">{rule.name}</p>
          <p className="text-xs text-muted-foreground">
            {PATTERN_DEFINITIONS[rule.pattern]?.description}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-green-600">{rule.prizeAmount} XP</p>
        {rule.isCompleted && rule.winner && (
          <p className="text-xs text-muted-foreground">
            Won by {rule.winner.userName}
          </p>
        )}
      </div>
    </div>
  );
}

export default AdminGameControl;
