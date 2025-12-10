import React, { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { VIEW_OPTIONS } from '../constants';
import { AnalysisResult } from '../types';
import { GlassCard } from './GlassCard';
import { Sparkles, ArrowRight } from 'lucide-react';

interface AnalysisViewerProps {
  data: AnalysisResult | null;
  isLoading: boolean;
}

export const AnalysisViewer: React.FC<AnalysisViewerProps> = ({ data, isLoading }) => {
  const [activeTab, setActiveTab] = useState<string>(VIEW_OPTIONS[0].id);

  if (isLoading) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center gap-6 relative">
        <div className="w-24 h-24 rounded-full border-4 border-prism-primary border-t-transparent animate-spin"></div>
        <div className="absolute text-prism-accent font-bold animate-pulse">PROCESSING</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-white/10 rounded-3xl bg-white/5">
        <p className="mb-2 font-bold">No Analysis Data</p>
        <span className="text-sm">Upload files to initiate Deep Dive sequence.</span>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
             <GlassCard border="primary" className="min-h-[350px]">
                <h3 className="text-white mb-6 font-bold flex justify-between items-center">
                    <span>Trend Vector</span>
                    <span className="text-[10px] bg-prism-primary/20 text-prism-primary px-2 py-1 rounded">LIVE</span>
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={data.metrics.length > 0 ? data.metrics : []}>
                        <defs>
                            <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#667eea" stopOpacity={0.6}/>
                                <stop offset="95%" stopColor="#667eea" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis dataKey="label" stroke="#94a3b8" tick={{fontSize: 10}} />
                        <YAxis stroke="#94a3b8" tick={{fontSize: 10}} />
                        <Tooltip 
                            contentStyle={{backgroundColor: '#1a0b2e', borderColor: '#764ba2', color: '#fff', borderRadius: '8px'}} 
                        />
                        <Area type="monotone" dataKey="value" stroke="#667eea" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                    </AreaChart>
                </ResponsiveContainer>
             </GlassCard>
             
             <GlassCard border="none" className="min-h-[350px] flex flex-col">
                <h3 className="text-white mb-6 font-bold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-prism-accent" />
                    Cognitive Insights
                </h3>
                <ul className="space-y-4 flex-1">
                    {data.keyTrends.map((trend, i) => (
                        <li key={i} className="flex gap-4 text-sm text-gray-300 p-3 bg-white/5 rounded-xl border border-white/5 hover:border-prism-secondary/50 transition-colors">
                            <span className="text-prism-accent font-bold">0{i+1}</span> 
                            <span>{trend}</span>
                        </li>
                    ))}
                </ul>
                <div className="mt-6 pt-4 border-t border-white/10">
                    <h4 className="text-prism-alert text-xs font-bold mb-3 uppercase tracking-wider">Anomalies Detected</h4>
                    <div className="flex flex-wrap gap-2">
                        {data.outliers.length > 0 ? data.outliers.map((o, i) => (
                            <span key={i} className="px-3 py-1 bg-prism-alert/10 text-prism-alert text-xs font-bold rounded-lg border border-prism-alert/30">
                                {o}
                            </span>
                        )) : <span className="text-gray-500 text-xs">System Nominal. No Outliers.</span>}
                    </div>
                </div>
             </GlassCard>
          </div>
        );
      case 'nlp':
        return (
          <GlassCard className="prose prose-invert max-w-none border-prism-primary/30">
             <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-prism-primary to-prism-secondary flex items-center justify-center text-white text-xl font-bold">
                    AI
                </div>
                <div>
                    <h3 className="text-white text-2xl font-bold m-0">Executive Synthesis</h3>
                    <p className="text-prism-primary text-xs m-0 font-bold uppercase tracking-widest">Powered by Prism Core</p>
                </div>
             </div>
             
             <div className="p-8 bg-white/5 rounded-2xl border border-white/10 text-lg leading-relaxed text-gray-200">
                 {data.summary}
             </div>
             
             <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                 {data.suggestedActions.map((action, i) => (
                     <div key={i} className="p-6 bg-prism-success/5 border border-prism-success/20 rounded-xl hover:bg-prism-success/10 transition-colors cursor-default">
                         <h4 className="text-prism-success text-xs mb-3 font-bold uppercase tracking-wider flex items-center gap-2">
                            Path 0{i+1} <ArrowRight className="w-3 h-3" />
                         </h4>
                         <p className="text-sm text-gray-300 font-medium">{action}</p>
                     </div>
                 ))}
             </div>
          </GlassCard>
        );
      default:
        return (
            <GlassCard className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-full max-w-2xl">
                    <h3 className="text-center text-white mb-8 font-bold">System Hologram</h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                            { subject: 'VELOCITY', A: 120, fullMark: 150 },
                            { subject: 'ACCURACY', A: 98, fullMark: 150 },
                            { subject: 'SCALE', A: 86, fullMark: 150 },
                            { subject: 'SECURITY', A: 99, fullMark: 150 },
                            { subject: 'PREDICTION', A: 85, fullMark: 150 },
                            { subject: 'AGILITY', A: 65, fullMark: 150 },
                        ]}>
                            <PolarGrid stroke="#ffffff20" />
                            <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fill: '#e2e8f0', fontSize: 11, fontWeight: 'bold' }} />
                            <PolarRadiusAxis angle={30} domain={[0, 150]} stroke="#334155" tick={false}/>
                            <Radar name="System" dataKey="A" stroke="#f093fb" strokeWidth={3} fill="#f093fb" fillOpacity={0.4} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </GlassCard>
        );
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* View Selector Tabs */}
      <div className="flex gap-2 pb-2 overflow-x-auto">
        {VIEW_OPTIONS.filter(opt => ['dashboard', 'nlp', 'model'].includes(opt.id)).map((opt) => (
          <button
            key={opt.id}
            onClick={() => setActiveTab(opt.id)}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-xl whitespace-nowrap transition-all text-sm font-bold
              ${activeTab === opt.id 
                ? 'bg-white/10 text-white shadow-lg border border-white/20' 
                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}
            `}
          >
            <opt.icon className="w-4 h-4" />
            {opt.label}
          </button>
        ))}
      </div>

      <div className="min-h-[500px]">
        {renderContent()}
      </div>
    </div>
  );
};