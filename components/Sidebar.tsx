import React from 'react';
import { LayoutDashboard, FilePieChart, ShieldCheck, Cpu, Radio, Command } from 'lucide-react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  onStartLive: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, onStartLive }) => {
  const navItems = [
    { id: AppView.DASHBOARD, icon: LayoutDashboard, label: 'Nexus Hub' },
    { id: AppView.ANALYSIS, icon: FilePieChart, label: 'Deep Dive' },
    { id: AppView.SIMULATION, icon: Cpu, label: 'Prophet Sim' },
    { id: AppView.ADMIN, icon: ShieldCheck, label: 'Admin Panel' },
  ];

  return (
    <div className="w-20 lg:w-64 h-screen fixed left-0 top-0 glass-morphism border-r border-white/10 flex flex-col z-50 transition-all duration-300 backdrop-blur-xl">
      <div className="p-6 flex items-center justify-center lg:justify-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl glow-effect flex items-center justify-center bg-gradient-to-br from-prism-primary to-prism-secondary shrink-0">
             <Command className="w-6 h-6 text-white" />
        </div>
        <div className="hidden lg:block overflow-hidden">
            <h1 className="font-display font-bold text-xl gradient-text whitespace-nowrap">
            Prism Nexus
            </h1>
            <p className="text-[10px] text-purple-300 tracking-wider">INTELLIGENCE HUB</p>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-2 px-3">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`
              flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group relative overflow-hidden
              ${currentView === item.id 
                ? 'bg-white/10 text-white shadow-[0_0_20px_rgba(139,92,246,0.2)] border border-white/20' 
                : 'text-purple-300/70 hover:bg-white/5 hover:text-white border border-transparent'}
            `}
          >
            <item.icon className={`w-5 h-5 relative z-10 ${currentView === item.id ? 'text-prism-accent' : ''}`} />
            <span className="hidden lg:block font-medium text-sm relative z-10">{item.label}</span>
          </button>
        ))}
        
        <div className="my-4 border-t border-white/10 mx-4"></div>
        
        <button
            onClick={onStartLive}
            className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-prism-primary/20 to-prism-secondary/20 border border-prism-primary/30 text-white hover:shadow-[0_0_20px_rgba(102,126,234,0.3)] transition-all group mx-1"
        >
            <div className="w-8 h-8 rounded-lg bg-prism-primary/20 flex items-center justify-center shrink-0">
               <Radio className="w-4 h-4 text-prism-accent animate-pulse" />
            </div>
            <div className="hidden lg:block text-left">
                <span className="block font-bold text-xs text-prism-accent">LIVE SESSION</span>
                <span className="block text-[10px] text-gray-400">Connect Neural Link</span>
            </div>
        </button>
      </nav>

      <div className="p-6">
        <div className="glass-morphism rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-prism-accent to-prism-secondary flex items-center justify-center font-bold text-xs shadow-lg">
                FZ
            </div>
            <div className="hidden lg:block">
                <p className="text-xs font-bold text-white">Faizal Admin</p>
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-prism-success animate-pulse"></div>
                    <p className="text-[10px] text-prism-success">System Online</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};