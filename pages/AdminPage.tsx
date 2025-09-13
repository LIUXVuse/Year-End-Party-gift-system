import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import type { Gift } from '../types';

const ADMIN_PASSWORD_KEY = 'admin-password';
const ADMIN_SESSION_KEY = 'admin-session-active';

const GiftFormModal: React.FC<{
    gift: Partial<Gift> | null;
    onClose: () => void;
    onSave: (gift: Omit<Gift, 'id'> | Gift) => void;
}> = ({ gift, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<Gift>>(
        gift || { name: '', price: 0, image: '', isVisible: true, animationType: 'none' }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        const isChecked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: isCheckbox ? isChecked : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Gift);
    };

    if (!gift) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md text-white">
                <h2 className="text-2xl font-bold mb-4">{gift.id ? '編輯禮物' : '新增禮物'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="禮物名稱" className="w-full p-2 bg-gray-700 border border-gray-600 rounded" required />
                    <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="價格" className="w-full p-2 bg-gray-700 border border-gray-600 rounded" required />
                    <input type="text" name="image" value={formData.image} onChange={handleChange} placeholder="圖片 URL" className="w-full p-2 bg-gray-700 border border-gray-600 rounded" required />
                    
                    <select name="animationType" value={formData.animationType || 'none'} onChange={handleChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded">
                        <option value="none">無動畫</option>
                        <optgroup label="一般禮物">
                            <option value="glowstick-wave">螢光棒</option>
                            <option value="beer-cheers">啤酒</option>
                            <option value="horn-blast">歡呼喇叭</option>
                            <option value="flower-bloom">鮮花</option>
                        </optgroup>
                        <optgroup label="昂貴禮物">
                            <option value="car-drive">跑車</option>
                            <option value="rocket-fly">火箭</option>
                            <option value="diamond-flash">鑽石</option>
                            <option value="plane-fly">飛機</option>
                        </optgroup>
                    </select>

                     <div className="flex items-center">
                        <input type="checkbox" id="isVisible" name="isVisible" checked={formData.isVisible} onChange={handleChange} className="h-4 w-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500" />
                        <label htmlFor="isVisible" className="ml-2">上架顯示該禮物</label>
                    </div>

                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500">取消</button>
                        <button type="submit" className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700">儲存</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AdminPage: React.FC = () => {
    const { teams, givers, giftEvents, gifts, addTeam, currentTeamId, setCurrentTeamId, addGift, updateGift } = useAppContext();
    const [newTeamName, setNewTeamName] = useState('');
    const [editingGift, setEditingGift] = useState<Partial<Gift> | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [passwordMessage, setPasswordMessage] = useState('');
    
    const handleAddTeam = () => {
        if (newTeamName.trim()) {
            addTeam(newTeamName.trim());
            setNewTeamName('');
        }
    };
    
    const handleSaveGift = (gift: Omit<Gift, 'id'> | Gift) => {
        if ('id' in gift && gift.id) {
            updateGift(gift as Gift);
        } else {
            addGift(gift);
        }
        setEditingGift(null);
    };

    const handleToggleGiftVisibility = (gift: Gift) => {
        updateGift({ ...gift, isVisible: !gift.isVisible });
    };

    const handlePasswordChange = () => {
        if (newPassword.trim().length < 4) {
            setPasswordMessage('密碼長度至少需要4個字元');
            setTimeout(() => setPasswordMessage(''), 3000);
            return;
        }
        localStorage.setItem(ADMIN_PASSWORD_KEY, newPassword.trim());
        setNewPassword('');
        setPasswordMessage('密碼已成功更新！');
        setTimeout(() => setPasswordMessage(''), 3000);
    };

    const handleLogout = () => {
        sessionStorage.removeItem(ADMIN_SESSION_KEY);
        window.location.reload();
    };

    const teamStats = useMemo(() => {
        const stats: { [teamId: number]: { totalValue: number, giftCount: number } } = {};
        giftEvents.forEach(event => {
            if (!stats[event.teamId]) {
                stats[event.teamId] = { totalValue: 0, giftCount: 0 };
            }
            const gift = gifts.find(g => g.id === event.giftId);
            if (gift) {
                stats[event.teamId].totalValue += gift.price;
                stats[event.teamId].giftCount += 1;
            }
        });
        return stats;
    }, [giftEvents, gifts]);

    const giverTotals = useMemo(() => {
        const totals: { [giverId: string]: number } = {};
        giftEvents.forEach(event => {
            const gift = gifts.find(g => g.id === event.giftId);
            if (gift) {
                if (!totals[event.giverId]) {
                    totals[event.giverId] = 0;
                }
                totals[event.giverId] += gift.price;
            }
        });
        return totals;
    }, [giftEvents, gifts]);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-white">後台管理</h1>
                    <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition">
                        登出
                    </button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div>
                         {/* Team Management */}
                        <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                            <h2 className="text-2xl font-semibold mb-4 text-white">團隊管理</h2>
                            <div className="flex space-x-2 mb-6">
                                <input
                                    type="text"
                                    value={newTeamName}
                                    onChange={(e) => setNewTeamName(e.target.value)}
                                    placeholder="輸入新團隊名稱"
                                    className="flex-grow p-2 border border-gray-600 rounded-md bg-gray-700 text-white"
                                />
                                <button onClick={handleAddTeam} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition">
                                    新增團隊
                                </button>
                            </div>
                            
                            <h3 className="text-xl font-medium mb-2 text-white">團隊列表 & 狀態</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="border-b border-gray-700">
                                        <tr>
                                            <th className="p-3">團隊名稱</th>
                                            <th className="p-3">禮物總價值</th>
                                            <th className="p-3">設為當前</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {teams.map(team => (
                                            <tr key={team.id} className="border-b border-gray-700 hover:bg-gray-700">
                                                <td className="p-3 font-medium">{team.name}</td>
                                                <td className="p-3">${(teamStats[team.id]?.totalValue || 0).toLocaleString()}</td>
                                                <td className="p-3">
                                                    <button 
                                                        onClick={() => setCurrentTeamId(team.id)}
                                                        className={`px-4 py-1 text-sm rounded-full ${currentTeamId === team.id ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-200 hover:bg-gray-500'}`}
                                                        disabled={currentTeamId === team.id}
                                                    >
                                                        {currentTeamId === team.id ? '目前' : '設定'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                         {/* Gift Management */}
                        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                            <div className="flex justify-between items-center mb-4">
                               <h2 className="text-2xl font-semibold text-white">禮物管理</h2>
                               <button onClick={() => setEditingGift({})} className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition">
                                   新增禮物
                                </button>
                            </div>
                             <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="border-b border-gray-700">
                                        <tr>
                                            <th className="p-3">禮物</th>
                                            <th className="p-3">價格</th>
                                            <th className="p-3">上架狀態</th>
                                            <th className="p-3">操作</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {gifts.map(gift => (
                                            <tr key={gift.id} className="border-b border-gray-700 hover:bg-gray-700">
                                                <td className="p-3 font-medium flex items-center space-x-3">
                                                    <img src={gift.image} alt={gift.name} className="w-8 h-8 object-contain"/>
                                                    <span>{gift.name}</span>
                                                </td>
                                                <td className="p-3">${gift.price.toLocaleString()}</td>
                                                <td className="p-3">
                                                    <label htmlFor={`vis-${gift.id}`} className="flex items-center cursor-pointer">
                                                        <div className="relative">
                                                        <input type="checkbox" id={`vis-${gift.id}`} className="sr-only" checked={gift.isVisible} onChange={() => handleToggleGiftVisibility(gift)} />
                                                        <div className={`block w-14 h-8 rounded-full ${gift.isVisible ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                                                        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${gift.isVisible ? 'transform translate-x-6' : ''}`}></div>
                                                        </div>
                                                        <div className="ml-3 text-gray-300 text-sm">{gift.isVisible ? '上架中' : '已下架'}</div>
                                                    </label>
                                                </td>
                                                <td className="p-3">
                                                    <button onClick={() => setEditingGift(gift)} className="text-blue-400 hover:text-blue-300">編輯</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div>
                         <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                            <h2 className="text-2xl font-semibold mb-4 text-white">送禮者消費統計</h2>
                            <p className="text-sm text-gray-400 mb-4">此處列表方便工作人員與送禮者結算金額。</p>
                            <div className="overflow-y-auto max-h-[70vh]">
                                 <table className="w-full text-left">
                                    <thead className="sticky top-0 bg-gray-800 border-b border-gray-700">
                                        <tr>
                                            <th className="p-3">真實姓名</th>
                                            <th className="p-3">單位</th>
                                            <th className="p-3">手機</th>
                                            <th className="p-3 text-right">總消費</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {givers.sort((a,b) => (giverTotals[b.id] || 0) - (giverTotals[a.id] || 0)).map(giver => (
                                            <tr key={giver.id} className="border-b border-gray-700 hover:bg-gray-700">
                                                <td className="p-3">{giver.realName} <span className="text-gray-400">({giver.nickname})</span></td>
                                                <td className="p-3">{giver.department}</td>
                                                <td className="p-3">{giver.phone}</td>
                                                <td className="p-3 text-right font-mono font-semibold text-blue-400">
                                                    ${(giverTotals[giver.id] || 0).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                            <h2 className="text-2xl font-semibold mb-4 text-white">安全設定</h2>
                             <div className="space-y-2">
                                <label htmlFor="new-password" className="block text-sm font-medium text-gray-300">修改管理員密碼</label>
                                <div className="flex space-x-2">
                                     <input
                                        id="new-password"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="輸入新密碼"
                                        className="flex-grow p-2 border border-gray-600 rounded-md bg-gray-700 text-white"
                                    />
                                    <button onClick={handlePasswordChange} className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition">
                                        儲存
                                    </button>
                                </div>
                                {passwordMessage && <p className={`text-sm mt-2 ${passwordMessage.includes('成功') ? 'text-green-400' : 'text-red-400'}`}>{passwordMessage}</p>}
                            </div>
                         </div>
                    </div>

                </div>
            </div>
            {editingGift && <GiftFormModal gift={editingGift} onClose={() => setEditingGift(null)} onSave={handleSaveGift} />}
        </div>
    );
};

export default AdminPage;