import React, { useState, useEffect } from 'react';
import AdminPage from './AdminPage';
import { AdminIcon } from '../components/Icons';

const ADMIN_PASSWORD_KEY = 'admin-password';
const ADMIN_SESSION_KEY = 'admin-session-active';

const AdminAuthPage: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        // Check for an active session on component mount
        if (sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true') {
            setIsAuthenticated(true);
        }
        // Ensure default password is set if none exists
        if (!localStorage.getItem(ADMIN_PASSWORD_KEY)) {
            localStorage.setItem(ADMIN_PASSWORD_KEY, 'admin666');
        }
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const storedPassword = localStorage.getItem(ADMIN_PASSWORD_KEY);
        if (password === storedPassword) {
            setIsAuthenticated(true);
            sessionStorage.setItem(ADMIN_SESSION_KEY, 'true'); // Set session flag
            setError('');
        } else {
            setError('密碼錯誤，請重試。');
        }
    };

    if (isAuthenticated) {
        return <AdminPage />;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <form onSubmit={handleLogin} className="bg-gray-800 shadow-md rounded-lg p-8">
                    <div className="mb-6 text-center">
                         <AdminIcon className="h-16 w-16 mb-4 text-indigo-400 mx-auto" />
                        <h1 className="text-2xl font-bold">工作人員登入</h1>
                        <p className="text-gray-400 text-sm mt-1">Admin Panel Login</p>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="password">
                            密碼
                        </label>
                        <input
                            className="shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            id="password"
                            type="password"
                            placeholder="******************"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                     {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
                    <div className="flex items-center justify-between">
                        <button
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
                            type="submit"
                        >
                            登入
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminAuthPage;