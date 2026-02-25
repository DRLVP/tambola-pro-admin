import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { envConfig } from '@/lib/envConfig';

interface SocketState {
  // State
  socket: Socket | null;
  isConnected: boolean;

  // Actions
  initializeSocket: () => void;
  disconnectSocket: () => void;
  joinGame: (gameId: string) => void;
  leaveGame: (gameId: string) => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,

  initializeSocket: () => {
    const { socket: existingSocket } = get();

    // Prevent multiple socket connections
    if (existingSocket) {
      console.log('Socket already initialized');
      return;
    }

    const socketUrl = envConfig.socketUrl;

    const newSocket = io(socketUrl, {
      path: '/socket.io',
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      set({ isConnected: true });
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      set({ isConnected: false });
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      set({ isConnected: false });
    });

    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },

  joinGame: (gameId) => {
    const { socket, isConnected } = get();
    if (socket && isConnected) {
      socket.emit('game:join', { gameId });
      console.log('Joined game room:', gameId);
    }
  },

  leaveGame: (gameId) => {
    const { socket, isConnected } = get();
    if (socket && isConnected) {
      socket.emit('game:leave', { gameId });
      console.log('Left game room:', gameId);
    }
  },
}));

// Selector hooks for optimized re-renders
export const useSocket = () => useSocketStore((state) => state.socket);
export const useIsSocketConnected = () => useSocketStore((state) => state.isConnected);

// Action hooks
export const useSocketActions = () => useSocketStore((state) => ({
  initializeSocket: state.initializeSocket,
  disconnectSocket: state.disconnectSocket,
  joinGame: state.joinGame,
  leaveGame: state.leaveGame,
}));

export default useSocketStore;
