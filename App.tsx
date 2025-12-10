import React, { useState, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { AdminVault } from './components/AdminVault';
import { AnalysisViewer } from './components/AnalysisViewer';
import { SimulationEngine } from './components/SimulationEngine';
import { LiveSession } from './components/LiveSession';
import { GlassCard } from './components/GlassCard';
import { AppView, UploadedFile, AnalysisResult } from './types';
import { analyzeData, searchInsights, analyzeUrl } from './services/geminiService';
import { Search, UploadCloud, FolderOpen, Layers, Terminal, Globe, FileSpreadsheet, Sparkles, Command, FileText } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<string | null>(null);
  const [showLiveSession, setShowLiveSession] = useState(false);
  const [focusedFileId, setFocusedFileId] = useState<string | null>(null);
  
  // URL Analysis State
  const [urlInput, setUrlInput] = useState('');
  const [isUrlAnalyzing, setIsUrlAnalyzing] = useState(false);
  const [urlData, setUrlData] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // --- Handlers ---

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles: File[] = Array.from(e.dataTransfer.files);
    await processFiles(droppedFiles);
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList: File[] = Array.from(e.target.files);
      await processFiles(fileList);
    }
  };

  // Helper to read file content (Handles Excel/CSV/Text)
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const fileExt = file.name.split('.').pop()?.toLowerCase();

        if (fileExt === 'xlsx' || fileExt === 'xls') {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = e.target?.result;
                    // @ts-ignore
                    const workbook = window.XLSX.read(data, { type: 'binary' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    // @ts-ignore
                    const text = window.XLSX.utils.sheet_to_csv(worksheet);
                    resolve(text);
                } catch (err) {
                    console.error("Excel Parse Error", err);
                    resolve("Error parsing Excel file.");
                }
            };
            reader.onerror = reject;
            reader.readAsBinaryString(file);
        } else {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = reject;
            reader.readAsText(file);
        }
    });
  };

  const processFiles = async (fileList: File[]) => {
    if (fileList.length === 0) return;

    // Switch view immediately to indicate processing
    setIsAnalyzing(true);
    
    // Determine if we should switch view or stay (if simply adding more files)
    // But user requested "Deep Dive" immediately.
    setCurrentView(AppView.ANALYSIS);
    
    const newFiles: UploadedFile[] = [];

    // Process files
    for (const file of fileList) {
        if (file.name.startsWith('.')) continue; // Skip hidden files
        try {
            const content = await readFileContent(file);

            newFiles.push({
                id: Math.random().toString(36).substr(2, 9),
                name: file.webkitRelativePath || file.name,
                type: file.type || 'unknown',
                size: file.size,
                content: content,
                timestamp: Date.now(),
                status: 'secured'
            });
        } catch (err) {
            console.warn(`Failed to read file ${file.name}`, err);
        }
    }
    
    if (newFiles.length > 0) {
        const updatedFiles = [...files, ...newFiles];
        setFiles(updatedFiles);
        setFocusedFileId(null); // Reset focus to "All Files"
        
        // Trigger Analysis
        await runAnalysis(updatedFiles);
    } else {
        setIsAnalyzing(false);
    }
  };

  const runAnalysis = async (filesToAnalyze: UploadedFile[], focusId?: string) => {
      setIsAnalyzing(true);
      setAnalysisData(null);

      let contentPrompt = "";
      let contextLabel = "";

      if (focusId) {
          const file = filesToAnalyze.find(f => f.id === focusId);
          if (file) {
              contentPrompt = `FILE: ${file.name}\nCONTENT:\n${file.content.substring(0, 15000)}`;
              contextLabel = `Analysis of ${file.name}`;
          }
      } else {
          // Multi-file analysis
          contentPrompt = filesToAnalyze.map(f => `FILE: ${f.name}\nCONTENT PREVIEW:\n${f.content.substring(0, 3000)}`).join('\n\n');
          contextLabel = `Multi-File Integrated Analysis (${filesToAnalyze.length} sources)`;
      }

      try {
        const result = await analyzeData(contentPrompt, contextLabel);
        setAnalysisData(result);
      } catch (e) {
        console.error("Analysis Failed", e);
      } finally {
        setIsAnalyzing(false);
      }
  };

  const handleFileClick = (fileId: string) => {
      setFocusedFileId(fileId);
      setCurrentView(AppView.ANALYSIS); // Switch to analysis view
      runAnalysis(files, fileId);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    const context = files.map(f => `File: ${f.name}\nContent: ${f.content.substring(0, 1000)}...`).join('\n\n');
    const result = await searchInsights(searchQuery, context);
    setSearchResult(result);
  };

  const handleUrlAnalysis = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!urlInput.trim()) return;
      
      setIsUrlAnalyzing(true);
      setUrlData(null); // Clear previous data
      const result = await analyzeUrl(urlInput);
      setUrlData(result);
      setIsUrlAnalyzing(false);
  };

  const downloadExcel = () => {
      if (!urlData) return;
      
      // Convert URL Data to CSV format
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += `REPORT TYPE,URL INTELLIGENCE EXPORT\n`;
      csvContent += `SOURCE URL,${urlInput}\n`;
      csvContent += `TITLE,"${(urlData.title || '').replace(/"/g, '""')}"\n`;
      csvContent += `GENERATED,${new Date().toISOString()}\n\n`;
      csvContent += `SUMMARY\n"${(urlData.summary || 'No summary available').replace(/"/g, '""')}"\n\n`;
      
      csvContent += `KEY STATISTICS\nLABEL,VALUE\n`;
      urlData.keyStats?.forEach((stat: any) => {
          csvContent += `"${stat.label}","${stat.value}"\n`;
      });
      csvContent += `\n`;

      csvContent += `TOPICS DETECTED\n`;
      urlData.topics?.forEach((topic: string) => {
          csvContent += `"${topic}"\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `prism_intel_${new Date().getTime()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const getContextData = () => {
     return files.map(f => f.content).join('\n').substring(0, 20000); 
  };

  return (
    <div className="flex min-h-screen bg-prism-bg font-sans text-gray-200">
      <Sidebar 
        currentView={currentView} 
        setView={setCurrentView} 
        onStartLive={() => setShowLiveSession(true)}
      />
      
      {showLiveSession && <LiveSession onClose={() => setShowLiveSession(false)} />}
      
      <main className="flex-1 ml-20 lg:ml-64 p-6 lg:p-10 relative overflow-hidden">
         {/* Background Elements */}
         <div className="fixed top-20 right-20 w-[600px] h-[600px] bg-prism-primary/10 rounded-full blur-[100px] animate-pulse-glow z-0 pointer-events-none"></div>
         <div className="fixed bottom-20 left-20 w-[500px] h-[500px] bg-prism-accent/10 rounded-full blur-[80px] z-0 pointer-events-none"></div>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 z-10 relative gap-6">
            <div className="w-full md:w-auto">
                <h1 className="text-3xl font-display font-bold gradient-text">
                    {currentView === AppView.ADMIN ? 'Admin Override' : 
                     currentView === AppView.SIMULATION ? 'Prophet Simulation' :
                     currentView === AppView.ANALYSIS ? (focusedFileId ? 'Deep Dive: Single Source' : 'Deep Dive: Multi-Source') :
                     'Nexus Dashboard'}
                </h1>
                <p className="text-purple-300/60 text-sm mt-1">Universal Intelligence Hub</p>
            </div>
            
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl w-full relative group">
                <input
                    type="text"
                    placeholder="Search across all data streams..."
                    className="w-full glass-morphism rounded-xl py-4 pl-14 pr-14 text-sm focus:outline-none focus:border-prism-primary focus:ring-1 focus:ring-prism-primary transition-all placeholder-purple-300/30 text-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-5 top-4 w-5 h-5 text-purple-400 group-focus-within:text-prism-accent transition-colors" />
                <div className="absolute right-4 top-4 flex gap-2">
                   <div className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-bold text-gray-400 border border-white/5">AI</div>
                </div>
            </form>
        </div>

        {/* Search Result Overlay */}
        {searchResult && (
            <div className="mb-8 animate-fadeIn relative z-20">
                <GlassCard border="primary">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2 text-prism-accent font-bold text-sm">
                            <Sparkles className="w-4 h-4" />
                            INTELLIGENCE FOUND
                        </div>
                        <button onClick={() => setSearchResult(null)} className="text-gray-400 hover:text-white">✕</button>
                    </div>
                    <p className="text-gray-200 leading-relaxed">{searchResult}</p>
                </GlassCard>
            </div>
        )}

        {/* View Routing */}
        <div className="relative z-10 min-h-[600px] pb-24">
            {currentView === AppView.ADMIN && <AdminVault />}
            
            {currentView === AppView.ANALYSIS && (
                <AnalysisViewer data={analysisData} isLoading={isAnalyzing} />
            )}

            {currentView === AppView.SIMULATION && (
                <SimulationEngine contextData={getContextData()} />
            )}

            {currentView === AppView.DASHBOARD && (
                <div className="space-y-8 animate-fadeIn">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Upload Zone - 2 Cols */}
                        <div className="lg:col-span-2">
                             <div 
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`
                                    h-full min-h-[400px] border-2 border-dashed rounded-3xl p-10 transition-all duration-300 flex flex-col items-center justify-center text-center relative overflow-hidden group glass-morphism
                                    ${isDragging 
                                        ? 'border-prism-primary bg-prism-primary/10' 
                                        : 'border-white/10 hover:border-prism-primary/50'}
                                `}
                            >
                                <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-prism-primary/20 to-prism-secondary/20 flex items-center justify-center glow-effect group-hover:scale-110 transition-transform">
                                    <UploadCloud className="w-10 h-10 text-white" />
                                </div>
                                
                                <h2 className="text-2xl text-white font-bold mb-2">Drag & Drop Files</h2>
                                <p className="text-purple-300/60 mb-8 max-w-md">
                                    Universal ingestion active. Supports CSV, Excel (.xlsx), PDF, JSON.
                                    <br/>Drag folders for batch processing.
                                </p>
                                
                                <div className="flex gap-4">
                                    <input 
                                        type="file" 
                                        multiple 
                                        className="hidden" 
                                        ref={fileInputRef}
                                        onChange={handleFileInput} 
                                    />
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-8 py-3 bg-gradient-to-r from-prism-primary to-prism-secondary rounded-xl text-white font-bold hover:shadow-[0_0_20px_rgba(118,75,162,0.4)] transition-all transform hover:-translate-y-0.5"
                                    >
                                        Browse Files
                                    </button>

                                    <input 
                                        type="file" 
                                        // @ts-ignore
                                        webkitdirectory="" 
                                        directory=""
                                        multiple
                                        className="hidden" 
                                        ref={folderInputRef}
                                        onChange={handleFileInput}
                                    />
                                    <button 
                                        onClick={() => folderInputRef.current?.click()}
                                        className="px-8 py-3 glass-morphism rounded-xl text-white font-bold hover:bg-white/10 transition-all flex items-center gap-2"
                                    >
                                        <FolderOpen className="w-4 h-4" /> Folder
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* URL Intelligence Panel - 1 Col */}
                        <div className="lg:col-span-1">
                            <GlassCard border="none" className="h-full flex flex-col !p-6 bg-prism-surface/50">
                                <h3 className="text-white font-bold text-lg flex items-center gap-2 mb-4">
                                    <Globe className="w-5 h-5 text-prism-accent" />
                                    URL Intelligence
                                </h3>
                                
                                <form onSubmit={handleUrlAnalysis} className="mb-6">
                                    <div className="relative mb-3">
                                        <input 
                                            type="url" 
                                            required
                                            placeholder="Paste URL to analyze..." 
                                            className="w-full bg-black/20 border border-white/10 rounded-xl p-3 pl-4 text-sm text-white focus:outline-none focus:border-prism-accent focus:ring-1 focus:ring-prism-accent"
                                            value={urlInput}
                                            onChange={(e) => setUrlInput(e.target.value)}
                                        />
                                    </div>
                                    <button 
                                        type="submit"
                                        disabled={isUrlAnalyzing}
                                        className="w-full py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all disabled:opacity-50"
                                    >
                                        {isUrlAnalyzing ? 'Scanning Neural Web...' : 'Analyze URL'}
                                    </button>
                                </form>

                                <div className="flex-1 bg-black/20 rounded-xl border border-white/5 p-4 relative overflow-hidden min-h-[200px]">
                                    {isUrlAnalyzing ? (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <div className="w-8 h-8 border-2 border-prism-accent border-t-transparent rounded-full animate-spin mb-3"></div>
                                            <span className="text-xs text-prism-accent animate-pulse">EXTRACTING DATA...</span>
                                        </div>
                                    ) : urlData ? (
                                        <div className="h-full flex flex-col animate-fadeIn">
                                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                                <h4 className="text-white font-bold text-sm mb-2 leading-tight">{urlData.title}</h4>
                                                <p className="text-xs text-gray-400 mb-4 line-clamp-4">{urlData.summary}</p>
                                                
                                                <div className="space-y-2 mb-4">
                                                    {urlData.keyStats?.slice(0, 4).map((stat: any, i: number) => (
                                                        <div key={i} className="flex justify-between text-xs border-b border-white/5 pb-1">
                                                            <span className="text-gray-500">{stat.label}</span>
                                                            <span className="text-prism-accent font-mono">{stat.value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <button 
                                                onClick={downloadExcel}
                                                className="w-full mt-3 py-2 bg-prism-success/10 border border-prism-success/50 text-prism-success hover:bg-prism-success/20 rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition-all"
                                            >
                                                <FileSpreadsheet className="w-3 h-3" />
                                                Download Excel
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600">
                                            <Globe className="w-10 h-10 mb-2 opacity-20" />
                                            <span className="text-xs">Awaiting Target URL</span>
                                        </div>
                                    )}
                                </div>
                            </GlassCard>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                          {icon: Layers, title: "Multi-File Analysis", desc: "Cross-reference multiple datasets as unified intelligence."},
                          {icon: Command, title: "Nexus Dashboard", desc: "Holographic visualization with self-analyzing AI modules."},
                          {icon: Terminal, title: "Admin Override", desc: "Master access panel with unrestricted oversight."}
                        ].map((feature, i) => (
                          <GlassCard key={i} hoverEffect className="p-6">
                             <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 text-prism-accent">
                                <feature.icon className="w-6 h-6" />
                             </div>
                             <h3 className="text-white font-bold mb-2">{feature.title}</h3>
                             <p className="text-purple-300/60 text-sm">{feature.desc}</p>
                          </GlassCard>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Always Visible File Tray (Bottom) */}
            {files.length > 0 && (
                <div className="fixed bottom-0 left-20 lg:left-64 right-0 bg-[#0a0118]/90 backdrop-blur-xl border-t border-white/10 p-4 z-40 transition-all">
                    <h3 className="text-white font-bold text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-prism-primary" />
                        Active Data Streams ({files.length})
                    </h3>
                    <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                        <button 
                           onClick={() => {
                               setFocusedFileId(null);
                               setCurrentView(AppView.ANALYSIS);
                               runAnalysis(files);
                           }}
                           className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all shrink-0
                             ${!focusedFileId && currentView === AppView.ANALYSIS
                               ? 'bg-prism-primary/20 border-prism-primary text-white' 
                               : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'}
                           `}
                        >
                            <Layers className="w-4 h-4" />
                            <div className="text-left">
                                <p className="text-xs font-bold">Unified View</p>
                                <p className="text-[10px] opacity-60">All Data Merged</p>
                            </div>
                        </button>

                        {files.map(f => (
                             <button 
                                key={f.id} 
                                onClick={() => handleFileClick(f.id)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all shrink-0 min-w-[200px]
                                   ${focusedFileId === f.id && currentView === AppView.ANALYSIS
                                     ? 'bg-prism-primary/20 border-prism-primary text-white shadow-[0_0_15px_rgba(102,126,234,0.2)]' 
                                     : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}
                                `}
                             >
                                 <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-prism-primary to-prism-secondary flex items-center justify-center text-white shrink-0">
                                     {f.name.endsWith('xlsx') ? <FileSpreadsheet className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                 </div>
                                 <div className="text-left overflow-hidden">
                                     <p className="font-semibold text-xs truncate max-w-[120px]">{f.name}</p>
                                     <p className="text-[10px] opacity-50">{(f.size / 1024).toFixed(1)} KB • Ready</p>
                                 </div>
                             </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}