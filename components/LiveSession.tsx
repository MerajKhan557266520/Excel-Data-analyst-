import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Mic, MicOff, Activity, XCircle, Play } from 'lucide-react';

interface LiveSessionProps {
  onClose: () => void;
}

export const LiveSession: React.FC<LiveSessionProps> = ({ onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<'IDLE' | 'INITIALIZING' | 'LISTENING' | 'SPEAKING'>('IDLE');
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  
  // Audio Contexts
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null); 
  const nextStartTimeRef = useRef<number>(0);
  const audioStreamRef = useRef<MediaStream | null>(null);
  
  // Visualization
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  // Clean up on unmount
  useEffect(() => {
    return () => {
        stopSession();
    };
  }, []);

  const initConnection = async () => {
    setError(null);
    setStatus('INITIALIZING');
    
    try {
        // 1. Get User Media first (Explicit interaction required)
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStreamRef.current = stream;
        setHasPermission(true);

        // 2. Initialize Audio Contexts
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        inputContextRef.current = new AudioContextClass({ sampleRate: 16000 });
        outputContextRef.current = new AudioContextClass({ sampleRate: 24000 });

        // 3. Connect to Gemini
        const apiKey = process.env.API_KEY || '';
        if (!apiKey) throw new Error("API Key Missing");
        
        const ai = new GoogleGenAI({ apiKey });
        
        const sessionPromise = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks: {
              onopen: () => {
                console.log("Session Opened");
                setStatus('LISTENING');
                setIsActive(true);
                setupAudioInput(stream, sessionPromise);
              },
              onmessage: async (message: LiveServerMessage) => {
                const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                if (audioData) {
                  setStatus('SPEAKING');
                  await playAudioChunk(audioData);
                }
                if (message.serverContent?.turnComplete) {
                  setStatus('LISTENING');
                }
              },
              onclose: () => {
                console.log("Session Closed");
                setStatus('IDLE');
                setIsActive(false);
              },
              onerror: (err) => {
                console.error("Session Error:", err);
                setError("Neural Link Disrupted. Please reconnect.");
                setStatus('IDLE');
                setIsActive(false);
              }
            },
            config: {
              responseModalities: [Modality.AUDIO],
              systemInstruction: "You are 'Echo', the sentient voice of Prism Nexus. You are concise, intelligent, and helpful. You analyze data and provide insights.",
            }
        });
        
        sessionRef.current = sessionPromise;

    } catch (e: any) {
        console.error("Initialization Failed:", e);
        setError(`Connection Failed: ${e.message || "Unknown Error"}`);
        setStatus('IDLE');
    }
  };

  const setupAudioInput = (stream: MediaStream, sessionPromise: Promise<any>) => {
    if (!inputContextRef.current) return;
    
    const source = inputContextRef.current.createMediaStreamSource(stream);
    const processor = inputContextRef.current.createScriptProcessor(4096, 1, 1);
    
    processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const b64Data = pcmToB64(inputData);
      
      sessionPromise.then(session => {
        session.sendRealtimeInput({
          media: {
            mimeType: 'audio/pcm;rate=16000',
            data: b64Data
          }
        });
      });
      
      // Update Visualizer
      drawVisualizer(inputData);
    };
    
    source.connect(processor);
    processor.connect(inputContextRef.current.destination);
  };

  const playAudioChunk = async (base64Audio: string) => {
    if (!outputContextRef.current) return;
    
    const ctx = outputContextRef.current;
    const audioBytes = b64ToUint8Array(base64Audio);
    const audioBuffer = await decodeAudioData(audioBytes, ctx);
    
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    
    const currentTime = ctx.currentTime;
    const startTime = Math.max(currentTime, nextStartTimeRef.current);
    source.start(startTime);
    nextStartTimeRef.current = startTime + audioBuffer.duration;
  };

  const stopSession = () => {
    // Cleanup Media Stream
    if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
        audioStreamRef.current = null;
    }

    inputContextRef.current?.close();
    outputContextRef.current?.close();
    cancelAnimationFrame(animationRef.current);
    setIsActive(false);
    setStatus('IDLE');
  };

  // --- Helpers ---
  function pcmToB64(data: Float32Array) {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    let binary = '';
    const bytes = new Uint8Array(int16.buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  function b64ToUint8Array(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }
  
  async function decodeAudioData(data: Uint8Array, ctx: AudioContext) {
    const dataInt16 = new Int16Array(data.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
  }

  const drawVisualizer = (data: Float32Array) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = status === 'SPEAKING' ? '#f093fb' : '#667eea';
    
    const barWidth = 3;
    const gap = 2;
    const totalBars = Math.floor(canvas.width / (barWidth + gap));
    const step = Math.floor(data.length / totalBars);
    
    for(let i=0; i<totalBars; i++) {
        const val = Math.abs(data[i * step]);
        const h = Math.max(val * canvas.height * 2, 2);
        const y = (canvas.height - h) / 2;
        ctx.fillRect(i * (barWidth + gap), y, barWidth, h);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0118]/95 backdrop-blur-xl animate-pulse-glow">
       <div className="absolute top-8 right-8">
           <button onClick={onClose} className="text-white/50 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full">
               <XCircle className="w-10 h-10" />
           </button>
       </div>
       
       <div className="flex flex-col items-center gap-8 w-full max-w-2xl px-6">
           <div className="relative">
               <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 
                    ${status === 'SPEAKING' ? 'bg-prism-accent shadow-[0_0_80px_#f093fb]' : 
                      status === 'LISTENING' ? 'bg-prism-primary shadow-[0_0_50px_#667eea]' :
                      'bg-gray-800 border-2 border-white/10'} 
                    ${isActive ? 'animate-float' : ''}`}>
                    {isActive ? (
                        <Activity className={`w-16 h-16 text-white ${status === 'SPEAKING' ? 'animate-pulse' : ''}`} />
                    ) : (
                        <MicOff className="w-12 h-12 text-gray-500" />
                    )}
               </div>
               
               {isActive && (
                   <>
                    <div className="absolute inset-[-20px] border border-white/20 rounded-full animate-spin-slow"></div>
                    <div className="absolute inset-[-40px] border border-white/10 rounded-full animate-spin-slow" style={{animationDirection: 'reverse'}}></div>
                   </>
               )}
           </div>
           
           <div className="text-center space-y-2">
               <h2 className="text-4xl font-display font-bold text-white gradient-text">ECHO INTELLIGENCE</h2>
               <p className="font-sans text-prism-primary text-sm tracking-[0.2em] uppercase">
                   {status === 'IDLE' ? 'NEURAL LINK STANDBY' : `${status} /// CHANNEL SECURE`}
               </p>
           </div>
           
           {status !== 'IDLE' && (
             <div className="w-full h-24 glass-morphism rounded-xl overflow-hidden relative border-prism-primary/30">
                  <canvas ref={canvasRef} width={600} height={96} className="w-full h-full"></canvas>
             </div>
           )}

           {error && <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-200 text-sm font-bold text-center max-w-md">{error}</div>}
           
           <div className="flex gap-4">
               {!isActive ? (
                   <button 
                       onClick={initConnection} 
                       className="px-8 py-4 rounded-xl bg-gradient-to-r from-prism-primary to-prism-secondary text-white font-bold hover:shadow-[0_0_30px_rgba(102,126,234,0.5)] transition-all flex items-center gap-2 text-lg transform hover:scale-105"
                   >
                       <Play className="w-5 h-5 fill-current" />
                       INITIALIZE CONNECTION
                   </button>
               ) : (
                   <button 
                       onClick={stopSession} 
                       className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-red-500/20 hover:border-red-500 transition-all text-sm tracking-wider"
                   >
                       TERMINATE LINK
                   </button>
               )}
           </div>
       </div>
    </div>
  );
};