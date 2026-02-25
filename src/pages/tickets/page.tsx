import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Eye,
  Loader2,
  RefreshCw,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { ticketService } from "@/services/ticket.service";
import type { Ticket, TicketStatus } from "@/types";
import { toast } from "sonner";
import api from "@/services/api";

export function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | TicketStatus>("all");

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ticketService.getAllTickets({ limit: 100 });
      setTickets(response.data);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
      toast.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleConfirmTicket = async (ticketId: string) => {
    try {
      await api.post(`/tickets/${ticketId}/confirm`);
      toast.success("Ticket confirmed!");
      fetchTickets(); // Refresh list
    } catch (error) {
      toast.error("Failed to confirm ticket");
    }
  };

  const handleCancelTicket = async (ticketId: string) => {
    try {
      await api.post(`/tickets/${ticketId}/cancel`);
      toast.success("Ticket cancelled!");
      fetchTickets(); // Refresh list
    } catch (error) {
      toast.error("Failed to cancel ticket");
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch = ticket._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.userName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || ticket.status === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tickets Management</h1>
          <p className="text-muted-foreground">
            View and manage all game tickets
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchTickets} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tickets</CardTitle>
          <CardDescription>Browse all tickets and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by ticket ID or user..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="won">Won</TabsTrigger>
                <TabsTrigger value="lost">Lost</TabsTrigger>
              </TabsList>
              <TabsContent value={activeTab} className="mt-4">
                <div className="rounded-md border">
                  {loading ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ticket ID</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Game</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Purchased</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTickets.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              No tickets found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredTickets.map((ticket) => {
                            // Handle populated user/game objects from backend
                            const getUserDisplay = () => {
                              if (ticket.userName) return ticket.userName;
                              if (typeof ticket.userId === 'object' && ticket.userId !== null && 'name' in ticket.userId) {
                                return (ticket.userId as any).name;
                              }
                              return String(ticket.userId);
                            };

                            const getGameDisplay = () => {
                              if (ticket.gameName) return ticket.gameName;
                              if (typeof ticket.gameId === 'object' && ticket.gameId !== null && 'name' in ticket.gameId) {
                                return (ticket.gameId as any).name;
                              }
                              return String(ticket.gameId);
                            };

                            return (
                              <TableRow key={ticket._id}>
                                <TableCell className="font-mono text-sm">{ticket._id.substring(0, 8)}...</TableCell>
                                <TableCell>{getUserDisplay()}</TableCell>
                                <TableCell>{getGameDisplay()}</TableCell>
                                <TableCell>
                                  <Badge variant={ticket.status === "won" ? "default" : ticket.status === "pending" ? "destructive" : "secondary"}>
                                    {ticket.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {ticket.purchasedAt ? format(new Date(ticket.purchasedAt), "PPP") : "-"}
                                </TableCell>
                                <TableCell className="text-right flex items-center justify-end gap-2">
                                  {ticket.status === 'pending' && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                        onClick={() => handleConfirmTicket(ticket._id)}
                                        title="Confirm Ticket"
                                      >
                                        <CheckCircle className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => handleCancelTicket(ticket._id)}
                                        title="Cancel Ticket"
                                      >
                                        <XCircle className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default TicketsPage;