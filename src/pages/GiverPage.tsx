import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import type { Giver, Gift } from '../types';
import { UserIcon } from '../components/Icons';

const GIVER_STORAGE_KEY = 'year-end-party-giver';

const UserRegistrationModal: React.FC<{ onRegister: (giver: Giver) => void }> = ({ onRegister }) => {
    const { addGiver } = useAppContext();
    const [nickname, setNickname] = useState('');
    const [avatar, setAvatar] = useState<string | null>(null);
    const [realName, setRealName] = useState('');
    const [phone, setPhone] = useState('');
    const [department, setDepartment] = useState('');
    const [error, setError] = useState('');

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setAvatar(event.target?.result as string);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSubmit = () => {
        if (!nickname || !realName || !phone || !department) {
            setError('所有欄位（頭像除外）都是必填的！');
            return;
        }
        setError('');
        const newGiver = addGiver({ nickname, avatar, realName, phone, department });
        onRegister(newGiver);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md text-gray-800">
                <h2 className="text-2xl font-bold mb-4">歡迎！請先登入</h2>
                <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                        <label htmlFor="avatar-upload" className="cursor-pointer">
                            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                {avatar ? <img src={avatar} alt="Avatar" className="w-full h-full object-cover" /> : <UserIcon className="w-12 h-12 text-gray-500" />}
                            </div>
                        </label>
                        <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                        <input type="text" placeholder="輸入您的暱稱" value={nickname} onChange={e => setNickname(e.target.value)} className="w-full p-2 border rounded" />
                    </div>
                    <input type="text" placeholder="您的真實姓名（不會公開顯示）" value={realName} onChange={e => setRealName(e.target.value)} className="w-full p-2 border rounded" />
                    <input type="text" placeholder="您的單位（不會公開顯示）" value={department} onChange={e => setDepartment(e.target.value)} className="w-full p-2 border rounded" />
                    <input type="tel" placeholder="您的手機號碼（不會公開顯示）" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-2 border rounded" />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button onClick={handleSubmit} className="w-full bg-purple-600 text-white p-3 rounded-lg font-bold hover:bg-purple-700 transition">
                        進入會場
                    </button>
                </div>
            </div>
        </div>
    );
};

const GiftModal: React.FC<{ gift: Gift; onSend: (message?: string) => void; onClose: () => void }> = ({ gift, onSend, onClose }) => {
    const [showMessageInput, setShowMessageInput] = useState(false);
    const [message, setMessage] = useState('');

    const handleSend = () => {
        onSend(showMessageInput ? message : undefined);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm text-center">
                <img src={gift.image} alt={gift.name} className="w-32 h-32 mx-auto object-contain mb-4" />
                <h3 className="text-2xl font-bold">{gift.name}</h3>
                <p className="text-lg text-gray-600 mb-4">${gift.price.toLocaleString()}</p>
                {!showMessageInput ? (
                    <div className="space-y-2">
                        <button onClick={() => setShowMessageInput(true)} className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">想說點話</button>
                        <button onClick={handleSend} className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">直接送出</button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <textarea
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            maxLength={50}
                            placeholder="輸入想說的話 (50字以內)"
                            className="w-full p-2 border rounded h-24"
                        />
                        <p className="text-right text-sm text-gray-500">{message.length}/50</p>
                        <button onClick={handleSend} className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">送出禮物與留言</button>
                    </div>
                )}
                <button onClick={onClose} className="mt-4 text-gray-500">取消</button>
            </div>
        </div>
    );
};

const GiverPage: React.FC = () => {
    const { teams, currentTeamId, sendGift, gifts, ensureGiver, addGiver } = useAppContext();
    const [giver, setGiver] = useState<Giver | null>(null);
    const [selectedGift, setSelectedGift] = useState<Gift | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem(GIVER_STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored) as Giver;
                // Ensure global context knows this giver and keep the unified record
                const unified = ensureGiver(parsed);
                if (unified.id !== parsed.id) {
                    localStorage.setItem(GIVER_STORAGE_KEY, JSON.stringify(unified));
                }
                setGiver(unified);
                return;
            } catch {}
        }
        // No stored giver: keep as null and let registration modal handle addGiver
    }, [ensureGiver]);

    const handleRegister = (newGiver: Giver) => {
        // When user just registered via modal, make sure the unified record is stored
        const unified = ensureGiver(newGiver);
        localStorage.setItem(GIVER_STORAGE_KEY, JSON.stringify(unified));
        setGiver(unified);
    };

    const handleSendGift = (message?: string) => {
        if (giver && selectedGift && currentTeamId) {
            sendGift({
                giverId: giver.id,
                giftId: selectedGift.id,
                teamId: currentTeamId,
                message: message,
            });
        }
        setSelectedGift(null);
    };
    
    const currentTeam = teams.find(t => t.id === currentTeamId);
    const visibleGifts = gifts.filter(g => g.isVisible);

    if (!giver) {
        return <UserRegistrationModal onRegister={handleRegister} />;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-md p-4 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <div>
                        <p className="text-sm text-gray-500">正在為</p>
                        <h1 className="text-xl font-bold text-purple-700">{currentTeam?.name || '...'}</h1>
                    </div>
                    <div className="flex items-center space-x-2">
                        <p className="font-semibold">{giver.nickname}</p>
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                           {giver.avatar ? <img src={giver.avatar} alt="Avatar" className="w-full h-full object-cover"/> : <UserIcon className="w-full h-full p-2 text-gray-500"/>}
                        </div>
                    </div>
                </div>
            </header>

            <main className="p-4 max-w-4xl mx-auto">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {visibleGifts.map(gift => (
                        <div key={gift.id} onClick={() => setSelectedGift(gift)} className="bg-white p-3 rounded-lg shadow text-center cursor-pointer hover:shadow-lg hover:scale-105 transition-transform">
                            <img src={gift.image} alt={gift.name} className="w-24 h-24 mx-auto rounded-md object-contain mb-2" />
                            <p className="font-semibold">{gift.name}</p>
                            <p className="text-sm text-gray-600">${gift.price.toLocaleString()}</p>
                        </div>
                    ))}
                </div>
            </main>
            
            {selectedGift && (
                <GiftModal
                    gift={selectedGift}
                    onSend={handleSendGift}
                    onClose={() => setSelectedGift(null)}
                />
            )}
        </div>
    );
};

export default GiverPage;
