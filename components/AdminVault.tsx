import React, { useState } from 'react';
import { Lock, Eye, Server, ShieldAlert, History, Key } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { MOCK_ADMIN_LOGS, MOCK_USERS } from '../constants';

export const AdminVault: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [timeTravel, setTimeTravel] = useState(100);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Faizal@143') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('ACCESS DENIED: GENESIS KEY INVALID');
      setPassword('');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-full min-h-[600px] relative">
        <GlassCard border="alert" className="w-full max-w-md p-10 flex flex-col items-center text-center z-10 bg-black/60">
          <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center mb-8 border border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
            <Lock className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-3xl font-display font-bold text-white mb-2">Sentry Gate</h2>
          <p className="text-red-400 font-mono text-xs mb-8">LEVEL 5 CLEARANCE REQUIRED</p>
          
          <form onSubmit={handleLogin} className="w-full">
            <div className="relative mb-6">
                <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="ENTER GENESIS KEY"
                className="w-full bg-black/50 border border-red-900 rounded-xl px-4 py-4 text-center font-mono text-red-400 focus:outline-none focus:border-red-500 focus:shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-all placeholder-red-900/50 text-lg"
                />
            </div>
            {error && <p className="text-red-500 font-mono text-xs mb-4">{error}</p>}
            <button 
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold tracking-widest transition-all shadow-lg"
            >
              INITIATE OVERRIDE
            </button>
          </form>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      <header className="flex justify-between items-center mb-8 border-b border-red-500/20 pb-4">
        <div>
          <h1 className="text-4xl font-display font-bold text-red-500 flex items-center gap-3">
            <ShieldAlert className="w-10 h-10" />
            Admin Core
          </h1>
          <p className="text-red-400/60 font-mono text-sm mt-1 tracking-widest">OMNI-VIEW ENABLED • USER: FAIZAL_PRIME</p>
        </div>
        <div className="flex gap-4">
           <button onClick={() => setIsAuthenticated(false)} className="px-4 py-2 bg-white/5 border border-white/10 text-gray-400 font-bold text-xs hover:text-white rounded-lg transition-all">
               LOCK VAULT
           </button>
        </div>
      </header>

      {/* Time Reversal Control */}
      <GlassCard className="border-red-500/30 bg-red-950/10">
          <div className="flex items-center gap-4 mb-2 text-red-400 font-bold text-sm">
              <History className="w-4 h-4" />
              SYSTEM STATE REVERSAL
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={timeTravel}
            onChange={(e) => setTimeTravel(Number(e.target.value))}
            className="w-full h-2 bg-red-900/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-red-500 [&::-webkit-slider-thumb]:rounded-full"
          />
          <div className="flex justify-between text-xs text-red-500/50 mt-1 font-mono">
              <span>-24 HOURS</span>
              <span>NOW</span>
          </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard border="alert" className="md:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-red-500" />
              Global User Oversight
            </h3>
            <span className="text-xs text-red-400 animate-pulse bg-red-500/10 px-2 py-1 rounded">LIVE TRACKING</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-red-500/10 font-bold text-xs text-red-400 uppercase">
                <tr>
                  <th className="p-3 rounded-l-lg">ID</th>
                  <th className="p-3">Identity</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 rounded-r-lg">Command</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-500/10">
                {MOCK_USERS.map(user => (
                  <tr key={user.id} className="hover:bg-red-500/5 transition-colors">
                    <td className="p-3 font-mono text-xs text-red-500">{user.id}</td>
                    <td className="p-3 font-bold text-white">{user.name}</td>
                    <td className="p-3 text-xs">{user.role}</td>
                    <td className="p-3"><span className="inline-block w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_lime]"></span></td>
                    <td className="p-3">
                      <button className="text-red-400 hover:text-white text-xs border border-red-500/30 px-3 py-1 rounded hover:bg-red-500/20 transition-all">
                        OVERRIDE
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <div className="flex flex-col gap-6">
          <GlassCard className="flex-1 border-red-500/30">
             <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <Server className="w-5 h-5 text-red-500" />
              Neural Load
            </h3>
            <div className="space-y-6">
              {[{label: 'QUANTUM CPU', val: 92}, {label: 'MEMORY FABRIC', val: 45}, {label: 'AI THREADS', val: 88}].map((stat, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1 font-bold text-red-300">
                        <span>{stat.label}</span>
                        <span>{stat.val}%</span>
                    </div>
                    <div className="w-full bg-red-900/20 rounded-full h-2 overflow-hidden border border-red-900/30">
                        <div style={{width: `${stat.val}%`}} className="bg-red-600 h-full shadow-[0_0_10px_#dc2626]"></div>
                    </div>
                  </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="flex-1 border-red-500/30">
             <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              Intrusion Logs
            </h3>
            <div className="space-y-3 font-mono text-xs max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
              {MOCK_ADMIN_LOGS.map(log => (
                <div key={log.id} className="flex flex-col border-b border-red-500/10 pb-2 last:border-0">
                  <div className="flex justify-between text-red-300/50 mb-1">
                      <span>{log.timestamp}</span>
                      <span className={log.status === 'ERROR' ? 'text-red-500 font-bold' : 'text-green-500'}>{log.status}</span>
                  </div>
                  <span className="text-gray-300">{log.action}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};