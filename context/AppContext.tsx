import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
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

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [givers, setGivers] = useState<Giver[]>([]);
  const [giftEvents, setGiftEvents] = useState<GiftEvent[]>([]);
  const [gifts, setGifts] = useState<Gift[]>(INITIAL_GIFTS);
  const [currentTeamId, setCurrentTeamId] = useState<number | null>(1);

  const addTeam = useCallback((name: string) => {
    setTeams(prev => [...prev, { id: Date.now(), name }]);
  }, []);

  const addGiver = useCallback((giverData: Omit<Giver, 'id'>) => {
    const existingGiver = givers.find(g => g.phone === giverData.phone);
    if(existingGiver) return existingGiver;

    const newGiver: Giver = { ...giverData, id: `giver-${Date.now()}` };
    setGivers(prev => [...prev, newGiver]);
    return newGiver;
  }, [givers]);

  const sendGift = useCallback((giftEventData: Omit<GiftEvent, 'id' | 'timestamp'>) => {
    const newGiftEvent: GiftEvent = {
      ...giftEventData,
      id: `event-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    };
    setGiftEvents(prev => [...prev, newGiftEvent]);
  }, []);

  const addGift = useCallback((giftData: Omit<Gift, 'id'>) => {
    const newGift: Gift = { ...giftData, id: Date.now() };
    setGifts(prev => [...prev, newGift]);
  }, []);

  const updateGift = useCallback((updatedGift: Gift) => {
    setGifts(prev => prev.map(g => g.id === updatedGift.id ? updatedGift : g));
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
    setCurrentTeamId,
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
