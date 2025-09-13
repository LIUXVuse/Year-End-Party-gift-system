export interface Gift {
  id: number;
  name: string;
  price: number;
  image: string;
  isVisible: boolean;
  animationType: 'rocket-fly' | 'car-drive' | 'plane-fly' | 'diamond-flash' | 'glowstick-wave' | 'beer-cheers' | 'horn-blast' | 'flower-bloom' | 'none';
}

export interface Team {
  id: number;
  name: string;
}

export interface Giver {
  id: string;
  nickname: string;
  avatar: string | null;
  realName: string;
  phone: string;
  department: string;
}

export interface GiftEvent {
  id:string;
  giverId: string;
  teamId: number;
  giftId: number;
  message?: string;
  timestamp: number;
}