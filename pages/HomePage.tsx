
import React from 'react';
import { Link } from 'react-router-dom';
import { UserIcon, DisplayIcon, AdminIcon } from '../components/Icons';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          尾牙刷禮物系統
        </h1>
        <p className="text-xl text-gray-300">Year-End Party Gift Stream</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
        <Link to="/giver" className="bg-gray-800 p-8 rounded-lg shadow-lg hover:shadow-purple-500/50 hover:bg-gray-700 transition-all transform hover:-translate-y-2 flex flex-col items-center text-center">
          <UserIcon className="h-16 w-16 mb-4 text-purple-400" />
          <h2 className="text-2xl font-semibold mb-2">我是觀眾 (Giver)</h2>
          <p className="text-gray-400">掃描QR Code由此進入，為台上的表演者刷禮物！</p>
        </Link>
        
        <Link to="/display" className="bg-gray-800 p-8 rounded-lg shadow-lg hover:shadow-pink-500/50 hover:bg-gray-700 transition-all transform hover:-translate-y-2 flex flex-col items-center text-center">
          <DisplayIcon className="h-16 w-16 mb-4 text-pink-500" />
          <h2 className="text-2xl font-semibold mb-2">我是大螢幕 (Display)</h2>
          <p className="text-gray-400">連接到舞台後方的大螢幕，實時顯示禮物動態。</p>
        </Link>

        <Link to="/admin" className="bg-gray-800 p-8 rounded-lg shadow-lg hover:shadow-indigo-500/50 hover:bg-gray-700 transition-all transform hover:-translate-y-2 flex flex-col items-center text-center">
          <AdminIcon className="h-16 w-16 mb-4 text-indigo-400" />
          <h2 className="text-2xl font-semibold mb-2">我是工作人員 (Admin)</h2>
          <p className="text-gray-400">管理表演團隊與查看禮物統計數據。</p>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
