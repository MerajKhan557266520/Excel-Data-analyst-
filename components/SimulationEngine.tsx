import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { runSimulation } from '../services/geminiService';
import { SimulationScenario } from '../types';
import { Cpu } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SimulationEngineProps {
  contextData: string;
}

export const SimulationEngine: React.FC<SimulationEngineProps> = ({ contextData }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SimulationScenario | null>(null);

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    const simResult = await runSimulation(prompt, contextData);
    setResult(simResult);
    setIsLoading(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <header className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-white/10 pb-6">
        <div>
           <h2 className="text-3xl text-white font-bold flex items-center gap-3">
             <Cpu className="w-8 h-8 text-prism-accent" />
             Prophet Engine
           </h2>
           <p className="text-purple-300/70 text-sm mt-1">Reality Simulation & Predictive Modeling</p>
        </div>
      </header>

      <GlassCard className="border-prism-primary/30 p-8">
        <form onSubmit={handleSimulate} className="flex gap-4">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe a future scenario (e.g., 'Competitor X slashes prices by 20%')..."
            className="flex-1 bg-black/30 border border-white/10 rounded-xl p-4 text-white placeholder-purple-300/40 focus:outline-none focus:border-prism-accent focus:ring-1 focus:ring-prism-accent transition-all"
          />
          <button 
            type="submit" 
            disabled={isLoading}
            className="bg-gradient-to-r from-prism-primary to-prism-secondary hover:shadow-lg text-white px-8 py-2 rounded-xl font-bold transition-all disabled:opacity-50"
          >
            {isLoading ? 'Computing...' : 'Simulate'}
          </button>
        </form>
      </GlassCard>

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
           <GlassCard border="primary" className="flex flex-col gap-6">
              <div className="flex justify-between items-start">
                 <div>
                    <h3 className="text-2xl font-bold text-white mb-1">{result.name}</h3>
                    <div className="flex gap-3 text-xs font-mono">
                       <span className="text-gray-400">ID: {result.id}</span>
                       <span className="text-prism-accent">PROBABILITY: {result.probability}%</span>
                    </div>
                 </div>
                 <div className={`px-3 py-1 rounded-lg border text-xs font-bold ${
                    result.impact === 'EXTINCTION_LEVEL' ? 'bg-red-900/50 border-red-500 text-red-500 animate-pulse' :
                    result.impact === 'CRITICAL' ? 'bg-orange-900/50 border-orange-500 text-orange-500' :
                    'bg-green-900/50 border-green-500 text-green-500'
                 }`}>
                    IMPACT: {result.impact}
                 </div>
              </div>
              
              <div className="p-5 bg-white/5 rounded-xl border border-white/5">
                 <p className="text-gray-200 leading-relaxed text-sm">{result.description}</p>
              </div>

              <div>
                 <h4 className="text-prism-secondary text-xs font-bold uppercase tracking-wider mb-3">Optimal Action Path</h4>
                 <div className="space-y-2">
                    {result.actionPath.map((step, i) => (
                       <div key={i} className="flex gap-3 items-center p-3 bg-black/20 rounded-lg border border-white/5">
                          <span className="w-6 h-6 rounded-full bg-prism-secondary/20 text-prism-secondary flex items-center justify-center text-xs font-bold">{i+1}</span>
                          <span className="text-sm text-gray-300">{step}</span>
                       </div>
                    ))}
                 </div>
              </div>
           </GlassCard>

           <div className="flex flex-col gap-6">
              <GlassCard className="flex-1 flex flex-col">
                  <h4 className="text-white font-bold text-sm mb-4">Projected Metrics Shift</h4>
                  <div className="flex-1 min-h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={[
                              { name: 'T-0', val: 50 },
                              { name: 'T+1', val: 55 },
                              { name: 'Event', val: result.impact === 'CRITICAL' ? 20 : 80 },
                              { name: 'T+3', val: result.impact === 'CRITICAL' ? 15 : 90 },
                              { name: 'T+4', val: result.impact === 'CRITICAL' ? 25 : 85 },
                          ]}>
                              <defs>
                                <linearGradient id="simGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#f093fb" stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor="#f093fb" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                              <XAxis dataKey="name" stroke="#666" />
                              <YAxis stroke="#666" />
                              <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#333'}} />
                              <Area type="monotone" dataKey="val" stroke="#f093fb" fill="url(#simGradient)" />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </GlassCard>
           </div>
        </div>
      )}
    </div>
  );
};