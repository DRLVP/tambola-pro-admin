// Game Types
export interface Game {
  _id: string;
  name: string;
  description?: string;
  hostName: string;
  ticketPrice: number;
  maxPlayers: number;
  currentPlayers: number;
  status: 'waiting' | 'active' | 'paused' | 'completed' | 'cancelled';
  scheduledAt?: string;
  startedAt?: string;
  endedAt?: string;
  calledNumbers: number[];
  prizes: Prize[];
  rules: GameRule[];
  settings: GameSettings;
  winners: GameWinner[];
  createdAt: string;
  updatedAt: string;
}

export interface Prize {
  id: string;
  name: string;
  pattern: PrizePattern;
  amount: number;
  claimed: boolean;
  winner?: WinnerInfo;
}

export type PrizePattern =
  | 'early_five'
  | 'top_line'
  | 'middle_line'
  | 'bottom_line'
  | 'corners'
  | 'full_house'
  | 'first_row'
  | 'second_row'
  | 'third_row';

export interface WinnerInfo {
  userId: string;
  userName: string;
  ticketId: string;
  claimedAt: string;
}

// Game Rule - defines winning conditions
export interface GameRule {
  id: string;
  pattern: PrizePattern;
  name: string;
  order: number; // Priority/order (1st, 2nd, 3rd prize)
  prizeAmount: number;
  isCompleted: boolean;
  winner?: WinnerInfo;
}

// Game Settings - configuration for ticket allocation and gameplay
export interface GameSettings {
  minTickets: number; // Minimum 5
  maxTickets: number; // Total ticket allocation
  maxTicketsPerUser: number;
  autoPlay: boolean; // Auto-call numbers
  autoPlayInterval: number; // Interval in milliseconds (3000-10000)
}

// Game Winner - tracks winners with their ranks
export interface GameWinner {
  rank: number; // 1st, 2nd, 3rd...
  ruleId: string;
  userId: string;
  userName: string;
  ticketId: string;
  pattern: PrizePattern;
  prizeAmount: number;
  claimedAt: string;
}

// Ticket Types
export type TicketStatus = 'pending' | 'confirmed' | 'cancelled' | 'active' | 'won' | 'lost';

export interface TicketWinnerInfo {
  position: number; // 1st, 2nd, 3rd
  gameName: string;
  ruleName: string;
  pattern: PrizePattern;
  prizeAmount: number;
  wonAt: string;
}

export interface Ticket {
  _id: string;
  gameId: string;
  gameName?: string;
  userId: string;
  userName: string;
  userEmail?: string;
  numbers: number[][]; // 3 rows x 9 columns (with 0s for empty cells)
  markedNumbers: number[];
  status: TicketStatus;
  purchasedAt: string;
  confirmedAt?: string;
  cancelledAt?: string;
  winnerInfo?: TicketWinnerInfo;
}

// User Types
export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  balance: number;
  gamesPlayed: number;
  gamesWon: number;
  totalWinnings: number;
  status?: 'active' | 'banned';
  role?: 'user' | 'admin' | 'super_admin';
  createdAt: string;
  updatedAt: string;
}

// Admin Types
export interface Admin {
  _id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'moderator';
  createdAt: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalUsers: number;
  totalGames: number;
  activeGames: number;
  totalRevenue: number;
  todayRevenue: number;
  recentGames: Game[];
  topWinners: User[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Socket Event Types
export interface SocketEvents {
  // Game events
  'game:number-called': { gameId: string; number: number };
  'game:winner-claimed': { gameId: string; prize: Prize };
  'game:started': { gameId: string };
  'game:ended': { gameId: string; winners: WinnerInfo[] };

  // Player events
  'player:joined': { gameId: string; player: { userId: string; userName: string } };
  'player:left': { gameId: string; userId: string };

  // Ticket events
  'ticket:marked': { ticketId: string; number: number };
}

// Form Types
export interface CreateGameForm {
  name: string;
  description?: string;
  ticketPrice: number;
  maxPlayers: number;
  scheduledAt?: string;
  rules: Omit<GameRule, 'id' | 'isCompleted' | 'winner'>[];
  settings: GameSettings;
}

export interface PurchaseTicketForm {
  gameId: string;
  quantity: number;
}

// Navigation Types
export interface NavItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: NavItem[];
}
