import React, { useEffect, useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import type { GiftEvent, Gift } from '../types';
import { UserIcon } from '../components/Icons';

interface LiveEvent extends GiftEvent {
  giverNickname: string;
  giverAvatar: string | null;
  giftName: string;
  giftImage: string;
  giftPrice: number;
  animationType?: Gift['animationType'];
}

const GiftAnimationOverlay: React.FC<{ animation: { type: string, image: string } | null }> = ({ animation }) => {
    if (!animation) return null;

    let animationClass = '';
    let imageSizeClass = 'max-w-md max-h-md';
    switch (animation.type) {
        case 'rocket-fly':
            animationClass = 'animate-rocket-fly';
            break;
        case 'car-drive':
            animationClass = 'animate-car-drive bottom-10';
            break;
        case 'plane-fly':
            animationClass = 'animate-plane-fly top-1/4';
            break;
        case 'diamond-flash':
            animationClass = 'animate-diamond-flash';
            break;
        case 'glowstick-wave':
            animationClass = 'animate-glowstick-wave';
            imageSizeClass = 'w-64 h-64';
            break;
        case 'beer-cheers':
            animationClass = 'animate-beer-cheers';
            imageSizeClass = 'w-80 h-80';
            break;
        case 'horn-blast':
            animationClass = 'animate-horn-blast';
            imageSizeClass = 'w-72 h-72';
            break;
        case 'flower-bloom':
            animationClass = 'animate-flower-bloom';
            imageSizeClass = 'w-96 h-96';
            break;
        default:
            return null;
    }

    return (
        <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
            <img src={animation.image} alt="animation" className={`${imageSizeClass} absolute ${animationClass}`} />
        </div>
    );
};


const Leaderboard: React.FC = () => {
    const { giftEvents, givers, gifts, currentTeamId } = useAppContext();

    const leaderboardData = useMemo(() => {
        if (!currentTeamId) return [];

        const teamEvents = giftEvents.filter(e => e.teamId === currentTeamId);
        const giverTotals: { [giverId: string]: { nickname: string; total: number } } = {};

        teamEvents.forEach(event => {
            const giver = givers.find(g => g.id === event.giverId);
            const gift = gifts.find(g => g.id === event.giftId);
            if (giver && gift) {
                if (!giverTotals[giver.id]) {
                    giverTotals[giver.id] = { nickname: giver.nickname, total: 0 };
                }
                giverTotals[giver.id].total += gift.price;
            }
        });

        return Object.values(giverTotals)
            .sort((a, b) => b.total - a.total)
            .slice(0, 5);

    }, [giftEvents, givers, gifts, currentTeamId]);

    return (
        <div className="absolute top-4 right-4 bg-black bg-opacity-60 p-4 rounded-lg w-80 text-white shadow-lg border border-yellow-400 z-20">
            <h2 className="text-2xl font-bold text-center text-yellow-300 mb-4">乾爹排行榜</h2>
            <ol className="space-y-3">
                {leaderboardData.map((giver, index) => (
                    <li key={index} className="flex items-center justify-between text-lg">
                        <span className="font-bold">{index + 1}. {giver.nickname}</span>
                        <span className="font-mono text-yellow-400">${giver.total.toLocaleString()}</span>
                    </li>
                ))}
                 {leaderboardData.length < 5 && Array.from({ length: 5 - leaderboardData.length }).map((_, i) => (
                    <li key={`placeholder-${i}`} className="flex items-center justify-between text-lg opacity-50">
                       <span className="font-bold">{leaderboardData.length + i + 1}. ...</span>
                        <span className="font-mono">$...</span>
                    </li>
                ))}
            </ol>
        </div>
    );
};

const ConfettiAnimation: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-4 bg-yellow-300 rounded-full animate-confetti-rain"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
            backgroundColor: ['#fde047', '#f9a8d4', '#818cf8', '#6ee7b7'][Math.floor(Math.random() * 4)],
          }}
        />
      ))}
    </div>
  );
};

const DisplayPage: React.FC = () => {
    const { teams, givers, giftEvents, gifts, currentTeamId } = useAppContext();
    const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
    const [lastEventCount, setLastEventCount] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const [activeAnimation, setActiveAnimation] = useState<{type: string, image: string} | null>(null);

    useEffect(() => {
        if (giftEvents.length > lastEventCount) {
            const newEvents = giftEvents.slice(lastEventCount);
            const enrichedNewEvents: LiveEvent[] = newEvents.map(event => {
                const giver = givers.find(g => g.id === event.giverId);
                const gift = gifts.find(g => g.id === event.giftId);
                return {
                    ...event,
                    giverNickname: giver?.nickname || 'Anonymous',
                    giverAvatar: giver?.avatar || null,
                    giftName: gift?.name || 'Unknown Gift',
                    giftImage: gift?.image || '',
                    giftPrice: gift?.price || 0,
                    animationType: gift?.animationType,
                };
            }).filter(e => e.teamId === currentTeamId);

            enrichedNewEvents.forEach((event, index) => {
                setTimeout(() => {
                    setLiveEvents(prev => [...prev, event]);
                    
                    // Show confetti for high-value gifts
                    if (event.giftPrice >= 3000) {
                        setShowConfetti(true);
                        setTimeout(() => setShowConfetti(false), 5000);
                    }
                    
                    // Trigger animation for any gift that has one
                    if (event.animationType && event.animationType !== 'none') {
                        setActiveAnimation({type: event.animationType, image: event.giftImage});
                        setTimeout(() => setActiveAnimation(null), 6000); // Animation duration + buffer
                    }

                    setTimeout(() => {
                        setLiveEvents(prev => prev.filter(e => e.id !== event.id));
                    }, 5000);
                }, index * 800);
            });
            setLastEventCount(giftEvents.length);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [giftEvents, givers, gifts, currentTeamId]);

    const currentTeam = teams.find(t => t.id === currentTeamId);

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 overflow-hidden relative">
            {showConfetti && <ConfettiAnimation />}
            <GiftAnimationOverlay animation={activeAnimation} />
            <div className="absolute top-4 left-4 text-left z-20">
                <p className="text-xl text-gray-400">目前表演團隊</p>
                <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                    {currentTeam?.name || '準備中...'}
                </h1>
            </div>

            <Leaderboard />

            <div className="absolute bottom-10 left-0 w-full flex flex-col items-start space-y-4 px-4 z-10">
                 {liveEvents.map((event) => (
                    <div key={event.id} className="bg-black bg-opacity-70 p-3 rounded-full shadow-lg flex items-center animate-gift-popup">
                        <div className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden flex-shrink-0">
                           {event.giverAvatar ? <img src={event.giverAvatar} alt="Avatar" className="w-full h-full object-cover"/> : <UserIcon className="w-full h-full p-2 text-gray-400"/>}
                        </div>
                        <div className="ml-3 text-lg">
                            <span className="font-bold text-yellow-300">{event.giverNickname}</span>
                            <span className="mx-2">送出了</span>
                            <span className="font-bold text-pink-400">{event.giftName}</span>
                            {event.message && <span className="ml-3 text-gray-300 italic">"{event.message}"</span>}
                        </div>
                         <img src={event.giftImage} alt={event.giftName} className="w-12 h-12 rounded-full ml-4 object-contain" />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DisplayPage;