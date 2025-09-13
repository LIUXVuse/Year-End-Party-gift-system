import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect, useRef } from 'react';
import type { Team, Giver, GiftEvent, Gift } from '../types';
import { GIFTS as INITIAL_GIFTS } from '../constants';

interface AppContextType {
  teams: Team[];
  givers: Giver[];
  giftEvents: GiftEvent[];
  gifts: Gift[];
  currentTeamId: number | null;
  addTeam: (name: string) => void;
  addGiver: (giver: Omit<Giver, 'id'>) => Giver;
  sendGift: (giftEvent: Omit<GiftEvent, 'id' | 'timestamp'>) => void;
  setCurrentTeamId: (id: number | null) => void;
  addGift: (gift: Omit<Gift, 'id'>) => void;
  updateGift: (updatedGift: Gift) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialTeams: Team[] = [
  { id: 1, name: 'High-Energy Sales Team' },
  { id: 2, name: 'The Code Wizards (IT)' },
  { id: 3, name: 'Marketing Mavericks' },
];

const LS_KEYS = {
  teams: 'yeps_teams',
  givers: 'yeps_givers',
  giftEvents: 'yeps_gift_events',
  gifts: 'yeps_gifts',
  currentTeamId: 'yeps_current_team',
};

type ChannelMsg =
  | { type: 'ADD_GIVER'; payload: Giver }
  | { type: 'SEND_GIFT'; payload: GiftEvent }
  | { type: 'SET_TEAM'; payload: number | null }
  | { type: 'ADD_GIFT'; payload: Gift }
  | { type: 'UPDATE_GIFT'; payload: Gift };

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initial state from localStorage if present
  const [teams, setTeams] = useState<Team[]>(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEYS.teams) || 'null') || initialTeams; } catch { return initialTeams; }
  });
  const [givers, setGivers] = useState<Giver[]>(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEYS.givers) || 'null') || []; } catch { return []; }
  });
  const [giftEvents, setGiftEvents] = useState<GiftEvent[]>(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEYS.giftEvents) || 'null') || []; } catch { return []; }
  });
  const [gifts, setGifts] = useState<Gift[]>(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEYS.gifts) || 'null') || INITIAL_GIFTS; } catch { return INITIAL_GIFTS; }
  });
  const [currentTeamId, setCurrentTeamId] = useState<number | null>(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEYS.currentTeamId) || 'null') ?? 1; } catch { return 1; }
  });

  const channelRef = useRef<BroadcastChannel | null>(null);

  // Setup BroadcastChannel listener (same-device, multi-tab) and storage listener (persistence + cross-tab fallback)
  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channelRef.current = new BroadcastChannel('year-end-party-gift-stream');
      channelRef.current.onmessage = (ev: MessageEvent<ChannelMsg>) => {
        const msg = ev.data;
        switch (msg?.type) {
          case 'ADD_GIVER':
            setGivers(prev => prev.find(g => g.id === msg.payload.id) ? prev : [...prev, msg.payload]);
            break;
          case 'SEND_GIFT':
            setGiftEvents(prev => [...prev, msg.payload]);
            break;
          case 'SET_TEAM':
            setCurrentTeamId(msg.payload);
            break;
          case 'ADD_GIFT':
            setGifts(prev => prev.find(g => g.id === msg.payload.id) ? prev : [...prev, msg.payload]);
            break;
          case 'UPDATE_GIFT':
            setGifts(prev => prev.map(g => g.id === msg.payload.id ? msg.payload : g));
            break;
        }
      };
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === LS_KEYS.givers && e.newValue) setGivers(JSON.parse(e.newValue));
      if (e.key === LS_KEYS.giftEvents && e.newValue) setGiftEvents(JSON.parse(e.newValue));
      if (e.key === LS_KEYS.gifts && e.newValue) setGifts(JSON.parse(e.newValue));
      if (e.key === LS_KEYS.teams && e.newValue) setTeams(JSON.parse(e.newValue));
      if (e.key === LS_KEYS.currentTeamId && e.newValue) setCurrentTeamId(JSON.parse(e.newValue));
    };
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('storage', onStorage);
      channelRef.current?.close();
    };
  }, []);

  // Persist to localStorage whenever state changes
  useEffect(() => { try { localStorage.setItem(LS_KEYS.teams, JSON.stringify(teams)); } catch {} }, [teams]);
  useEffect(() => { try { localStorage.setItem(LS_KEYS.givers, JSON.stringify(givers)); } catch {} }, [givers]);
  useEffect(() => { try { localStorage.setItem(LS_KEYS.giftEvents, JSON.stringify(giftEvents)); } catch {} }, [giftEvents]);
  useEffect(() => { try { localStorage.setItem(LS_KEYS.gifts, JSON.stringify(gifts)); } catch {} }, [gifts]);
  useEffect(() => { try { localStorage.setItem(LS_KEYS.currentTeamId, JSON.stringify(currentTeamId)); } catch {} }, [currentTeamId]);

  const addTeam = useCallback((name: string) => {
    setTeams(prev => [...prev, { id: Date.now(), name }]);
  }, []);

  const addGiver = useCallback((giverData: Omit<Giver, 'id'>) => {
    const existingGiver = givers.find(g => g.phone === giverData.phone);
    if (existingGiver) return existingGiver;
    const newGiver: Giver = { ...giverData, id: `giver-${Date.now()}` };
    setGivers(prev => [...prev, newGiver]);
    channelRef.current?.postMessage({ type: 'ADD_GIVER', payload: newGiver } as ChannelMsg);
    return newGiver;
  }, [givers]);

  const sendGift = useCallback((giftEventData: Omit<GiftEvent, 'id' | 'timestamp'>) => {
    const newGiftEvent: GiftEvent = {
      ...giftEventData,
      id: `event-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    };
    setGiftEvents(prev => [...prev, newGiftEvent]);
    channelRef.current?.postMessage({ type: 'SEND_GIFT', payload: newGiftEvent } as ChannelMsg);
  }, []);

  const addGift = useCallback((giftData: Omit<Gift, 'id'>) => {
    const newGift: Gift = { ...giftData, id: Date.now() };
    setGifts(prev => [...prev, newGift]);
    channelRef.current?.postMessage({ type: 'ADD_GIFT', payload: newGift } as ChannelMsg);
  }, []);

  const updateGift = useCallback((updatedGift: Gift) => {
    setGifts(prev => prev.map(g => g.id === updatedGift.id ? updatedGift : g));
    channelRef.current?.postMessage({ type: 'UPDATE_GIFT', payload: updatedGift } as ChannelMsg);
  }, []);

  // Wrap setter to broadcast team changes from admin to display
  const setCurrentTeamIdWithBroadcast = useCallback((id: number | null) => {
    setCurrentTeamId(id);
    channelRef.current?.postMessage({ type: 'SET_TEAM', payload: id } as ChannelMsg);
  }, []);


  const value = {
    teams,
    givers,
    giftEvents,
    gifts,
    currentTeamId,
    addTeam,
    addGiver,
    sendGift,
    setCurrentTeamId: setCurrentTeamIdWithBroadcast,
    addGift,
    updateGift,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
