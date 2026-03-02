import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Loader2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Ticket,
  ChevronRight,
  Gamepad2,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ticketService } from "@/services/ticket.service";
import { gameService } from "@/services/game.service";
import type { Game, Ticket as TicketType } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Status config ───
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  available: { label: "Available", color: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300", icon: Ticket },
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300", icon: Clock },
  confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300", icon: CheckCircle2 },
  active: { label: "Active", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300", icon: CheckCircle2 },
  won: { label: "Won 🏆", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 font-semibold", icon: CheckCircle },
  lost: { label: "No Win", color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400", icon: XCircle },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300", icon: XCircle },
};

const GAME_STATUS_COLORS: Record<string, string> = {
  waiting: "border-l-amber-500",
  active: "border-l-green-500",
  paused: "border-l-orange-500",
  completed: "border-l-gray-400",
  cancelled: "border-l-red-500",
};

// ─── Main Component ───
export function TicketsPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | string>("all");

  // ─── Fetch all games ───
  const fetchGames = useCallback(async () => {
    try {
      setGamesLoading(true);
      const response = await gameService.getGames({ limit: 100 });
      setGames(response.data || []);
    } catch (error) {
      console.error("Failed to fetch games:", error);
      toast.error("Failed to load games");
    } finally {
      setGamesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  // ─── Fetch tickets for selected game ───
  const fetchGameTickets = useCallback(async (gameId: string) => {
    try {
      setTicketsLoading(true);
      const response = await ticketService.getGameTickets(gameId);
      setTickets(response.data || []);
    } catch (error) {
      console.error("Failed to fetch game tickets:", error);
      toast.error("Failed to load tickets");
      setTickets([]);
    } finally {
      setTicketsLoading(false);
    }
  }, []);

  const handleSelectGame = (gameId: string) => {
    setSelectedGameId(gameId);
    setStatusFilter("all");
    setSearchQuery("");
    fetchGameTickets(gameId);
  };

  // ─── Ticket Actions ───
  const handleConfirmTicket = async (ticketId: string) => {
    try {
      await ticketService.confirmTicket(ticketId);
      toast.success("Ticket confirmed!");
      if (selectedGameId) fetchGameTickets(selectedGameId);
    } catch (error) {
      toast.error("Failed to confirm ticket");
    }
  };

  const handleCancelTicket = async (ticketId: string) => {
    try {
      await ticketService.cancelTicket(ticketId);
      toast.success("Ticket cancelled & freed!");
      if (selectedGameId) fetchGameTickets(selectedGameId);
    } catch (error) {
      toast.error("Failed to cancel ticket");
    }
  };

  const handleConfirmAll = async () => {
    const pendingTickets = tickets.filter(t => t.status === 'pending');
    if (pendingTickets.length === 0) return;

    try {
      await Promise.all(pendingTickets.map(t => ticketService.confirmTicket(t._id)));
      toast.success(`${pendingTickets.length} ticket(s) confirmed!`);
      if (selectedGameId) fetchGameTickets(selectedGameId);
    } catch (error) {
      toast.error("Some tickets failed to confirm");
      if (selectedGameId) fetchGameTickets(selectedGameId);
    }
  };

  // ─── Derived Data ───
  const selectedGame = games.find(g => g._id === selectedGameId);

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = !searchQuery ||
      (t.userName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(t.ticketNumber).includes(searchQuery);
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Per-game ticket stats
  const ticketStats = {
    total: tickets.length,
    available: tickets.filter(t => t.status === 'available').length,
    pending: tickets.filter(t => t.status === 'pending').length,
    active: tickets.filter(t => t.status === 'active' || t.status === 'confirmed').length,
    won: tickets.filter(t => t.status === 'won').length,
  };

  // ─── Render ───
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Tickets Management</h1>
          <p className="text-muted-foreground text-sm">
            Manage tickets by game — select a game to view its tickets
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchGames} disabled={gamesLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${gamesLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        {/* ─── LEFT: Game List ─── */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
            Games ({games.length})
          </h2>

          {gamesLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : games.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center text-muted-foreground">
                <Gamepad2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No games created yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
              {games.map((game) => (
                <button
                  key={game._id}
                  onClick={() => handleSelectGame(game._id)}
                  className={cn(
                    "w-full text-left rounded-xl border-l-4 p-4 transition-all duration-200",
                    GAME_STATUS_COLORS[game.status] || "border-l-gray-300",
                    selectedGameId === game._id
                      ? "bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 shadow-md"
                      : "bg-card hover:bg-muted/50 border border-border hover:shadow-sm"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm truncate">{game.name}</h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {game.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Ticket className="h-3 w-3" />
                          {game.soldTickets || 0}/{game.settings?.maxTickets || game.maxPlayers}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      selectedGameId === game._id && "text-violet-500 rotate-90"
                    )} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ─── RIGHT: Ticket Management ─── */}
        <div>
          {!selectedGameId ? (
            <Card className="border-dashed h-[400px] flex items-center justify-center">
              <CardContent className="text-center text-muted-foreground">
                <Ticket className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p className="font-medium text-lg">Select a Game</p>
                <p className="text-sm mt-1">Choose a game from the left to view and manage its tickets</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Game Header Card */}
              <Card className="bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30 border-violet-200 dark:border-violet-800">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-violet-800 dark:text-violet-200">
                        {selectedGame?.name}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        ₹{selectedGame?.ticketPrice} per ticket • {selectedGame?.status}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {ticketStats.pending > 0 && (
                        <Button size="sm" onClick={handleConfirmAll} className="gap-1.5 bg-green-600 hover:bg-green-700">
                          <CheckCircle className="h-3.5 w-3.5" />
                          Confirm All ({ticketStats.pending})
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => selectedGameId && fetchGameTickets(selectedGameId)}
                        disabled={ticketsLoading}
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${ticketsLoading ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                  </div>

                  {/* Mini Stats */}
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3 mt-4">
                    {[
                      { label: "Total", value: ticketStats.total, color: "text-foreground" },
                      { label: "Available", value: ticketStats.available, color: "text-sky-600" },
                      { label: "Pending", value: ticketStats.pending, color: "text-amber-600" },
                      { label: "Active", value: ticketStats.active, color: "text-green-600" },
                      { label: "Won", value: ticketStats.won, color: "text-emerald-600" },
                    ].map((stat) => (
                      <div key={stat.label} className="text-center rounded-lg bg-white/60 dark:bg-black/20 py-2 px-1">
                        <p className={cn("text-lg font-bold", stat.color)}>{stat.value}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Filters */}
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by user name or ticket #..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[160px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="won">Won</SelectItem>
                    <SelectItem value="lost">No Win</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Ticket Table */}
              <Card>
                <CardContent className="p-0">
                  {ticketsLoading ? (
                    <div className="flex justify-center items-center py-16">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="overflow-x-auto -mx-2 px-2">
                      <Table className="min-w-[500px]">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[80px]">Ticket #</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredTickets.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-40" />
                                {tickets.length === 0
                                  ? "No tickets generated for this game yet"
                                  : "No tickets match your filter"}
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredTickets.map((ticket) => {
                              const statusCfg = STATUS_CONFIG[ticket.status] || { label: ticket.status, color: "" };
                              return (
                                <TableRow key={ticket._id} className="group">
                                  <TableCell>
                                    <span className="font-bold text-violet-700 dark:text-violet-400">
                                      #{ticket.ticketNumber ?? '—'}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    {ticket.userName ? (
                                      <span className="font-medium">{ticket.userName}</span>
                                    ) : (
                                      <span className="text-muted-foreground italic text-sm">Unassigned</span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Badge className={statusCfg.color}>{statusCfg.label}</Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                      {ticket.status === 'pending' && (
                                        <>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-green-600 hover:text-green-700 hover:bg-green-50 gap-1"
                                            onClick={() => handleConfirmTicket(ticket._id)}
                                          >
                                            <CheckCircle className="h-4 w-4" />
                                            Confirm
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-1"
                                            onClick={() => handleCancelTicket(ticket._id)}
                                          >
                                            <XCircle className="h-4 w-4" />
                                            Cancel
                                          </Button>
                                        </>
                                      )}
                                      {(ticket.status === 'active' || ticket.status === 'confirmed') && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-1"
                                          onClick={() => handleCancelTicket(ticket._id)}
                                        >
                                          <XCircle className="h-4 w-4" />
                                          Cancel
                                        </Button>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Showing count */}
              {!ticketsLoading && filteredTickets.length > 0 && (
                <p className="text-xs text-muted-foreground text-center">
                  Showing {filteredTickets.length} of {tickets.length} tickets
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TicketsPage;