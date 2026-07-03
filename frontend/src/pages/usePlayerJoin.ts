import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectSocket } from '../services/socket';
import { useGameStore } from '../store/useGameStore';

export const usePlayerJoin = () => {
  const [pin, setPin] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const setStorePin = useGameStore((s) => s.setPin);
  const setMyPlayer = useGameStore((s) => s.setMyPlayer);
  const setPhase = useGameStore((s) => s.setPhase);

  const navigate = useNavigate();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim() || !nickname.trim()) return;
    setError('');
    setLoading(true);

    const socket = connectSocket();

    // Clean up any existing listeners from previous failed attempts
    socket.off('player_joined');
    socket.off('error');

    // Listen for success (player_joined) to know our playerId
    const handlePlayerJoined = (data: any) => {
      // Check if this is us (latest joiner matches our nickname)
      if (data.nickname === nickname.trim()) {
        // Remove listeners to prevent memory leaks in the game page
        socket.off('player_joined', handlePlayerJoined);
        socket.off('error');

        setStorePin(pin.trim());
        setMyPlayer(data.playerId, nickname.trim());
        setPhase('lobby');

        // Persist for reconnection (using sessionStorage to isolate tabs)
        sessionStorage.setItem('player_nickname', nickname.trim());
        sessionStorage.setItem('player_id', data.playerId.toString());

        // NTP sync
        socket.emit('sync_time', { t0: Date.now() });

        navigate(`/play/${pin.trim()}`);
      }
    };

    socket.on('player_joined', handlePlayerJoined);

    // Listen for errors
    socket.on('error', (msg: string) => {
      setError(msg);
      setLoading(false);
    });

    // Emit join
    socket.emit('join_room', { pin: pin.trim(), nickname: nickname.trim() });
  };

  return {
    pin,
    setPin,
    nickname,
    setNickname,
    error,
    loading,
    handleJoin,
    navigate
  };
};
