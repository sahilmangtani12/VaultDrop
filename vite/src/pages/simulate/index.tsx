import { useState, useRef, useEffect } from 'react';
import { Play, Database, Server, Smartphone, Lock, CheckCircle, ArrowDown, Activity, Info, Shield, Key, Trash2, ArrowRight, ArrowLeft, RefreshCw, Layers, FileText } from 'react-feather';

// --- STORY MODE DATA ---
const STORY_SLIDES = [
  {
    title: "1. The Personal Padlock",
    icon: <div className="flex items-center gap-6 text-emerald-400 animate-fade-in-up"><Smartphone size={40} /><Lock size={80} /><Key size={70} className="text-amber-400"/></div>,
    simpleSummary: "Before you do anything, your browser creates a super strong open 'Padlock' and a single matching 'Key'. You keep the Key totally hidden on your computer, but you send the open Padlock out to Dabih.",
    techDetails: "Client generates a 1024-bit RSA Asymmetric Keypair using WebCrypto. The 'Padlock' is the Public Key. The 'Key' is the Private Key."
  },
  {
    title: "2. The One-Time Password",
    icon: <div className="flex items-center gap-6 text-amber-500 animate-pulse"><Server size={40} className="text-white/40"/><RefreshCw size={70} /><span className="text-4xl font-mono font-black border-2 border-amber-500 p-2 rounded-xl">****</span></div>,
    simpleSummary: "When you upload your private files, Dabih’s server rolls millions of microscopic dice to create a totally random 'One-Time Password' just for this specific upload.",
    techDetails: "Backend node generates an ephemeral AES-256-GCM Symmetric Key using cryptographically secure high entropy."
  },
  {
    title: "3. Scrambling the File",
    icon: <div className="flex items-center gap-6 text-sky-400 scale-[1.15]"><Layers size={60}/><ArrowRight size={30}/><RefreshCw size={50} className="animate-spin text-amber-500"/><ArrowRight size={30}/><Layers size={60} className="text-purple-500 blur-[2px]"/></div>,
    simpleSummary: "The server takes your file, chops it up, and shuffles the pieces through a blender using the One-Time Password as the master formula. The file is now complete garbage to anyone without the password.",
    techDetails: "File is streamed in 2MiB chunks through an AES-CBC Block Cipher using 14 rounds of Galois Field mathematical substitutions."
  },
  {
    title: "4. Locking the Password",
    icon: <div className="relative flex items-center justify-center scale-125 pt-4"><Lock size={90} className="text-emerald-500 absolute"/><span className="text-2xl font-mono text-amber-300 font-bold z-10 bg-slate-900 border border-slate-700 px-2 py-1 rounded">****</span></div>,
    simpleSummary: "Here is the magic trick: The server shoves the One-Time Password into a tiny box, and snaps YOUR 'Padlock' shut on it immediately.",
    techDetails: "The server wraps the Raw AES Symmetric Key using the Client's RSA-OAEP Public Key with SHA-256 MGF1 Padding."
  },
  {
    title: "5. The Blind Vault (Zero Knowledge!)",
    icon: <div className="flex items-center gap-10 mt-4"><Trash2 size={70} className="text-red-500 animate-bounce"/><ArrowRight size={30} className="text-white/20"/><Database size={100} className="text-purple-400"/></div>,
    simpleSummary: "The server permanently throws away its copy of the One-Time Password into the incinerator. It then dumps the scrambled file and the locked box into the cold storage vault. Dabih is now permanently blind.",
    techDetails: "Raw AES keys are flushed entirely from the ephemeral Redis cache. Database only persists ciphertext chunks and the client-encrypted RSA blob."
  },
  {
    title: "6. Safely Unlocking Home",
    icon: <div className="flex items-center gap-6 text-indigo-400"><Database size={40} className="text-white/40"/><ArrowRight size={30}/><Smartphone size={80} className="text-emerald-400"/><Key size={50} className="text-amber-400 animate-pulse"/></div>,
    simpleSummary: "When you want your file back, you download both of the boxes. Your computer uses your hidden 'Key' to pop open the Padlock, read the password, and perfectly unscramble your file!",
    techDetails: "Client downloads the RSA Encrypted Blob, uses their Private Key to reconstruct the AES Key, and symmetrically decrypts ciphertext via local WebCrypto."
  }
];

function StoryMode() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [showTech, setShowTech] = useState(false);

  const prevSlide = () => setActiveSlide(p => Math.max(0, p - 1));
  const nextSlide = () => setActiveSlide(p => Math.min(STORY_SLIDES.length - 1, p + 1));

  const slide = STORY_SLIDES[activeSlide];

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto animation-fade-in relative z-10 pt-4 pb-32">
      <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
            <Shield className="text-indigo-400" size={36} />
            How Dabih Works
          </h1>
          <p className="text-white/60 mt-2 text-lg font-medium">An interactive storybook explaining End-to-End Encryption in simple terms.</p>
        </div>
        <button 
           onClick={() => setShowTech(!showTech)}
           className={`px-5 py-2.5 rounded-xl font-bold transition-all text-sm shrink-0 border-2 ${showTech ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'bg-black/40 text-white/40 border-white/10 hover:text-white/80'}`}
        >
          {showTech ? '🤓 Technical Math Displayed' : '🤫 Show Hidden Tech terms'}
        </button>
      </div>

      <div className="flex gap-2 justify-center mb-8">
        {STORY_SLIDES.map((_, i) => (
           <div key={i} onClick={() => setActiveSlide(i)} className={`h-2 transition-all rounded-full cursor-pointer ${i === activeSlide ? 'bg-indigo-500 w-16 shadow-[0_0_10px_rgba(99,102,241,0.8)]' : 'bg-white/10 w-4 hover:bg-white/30'}`} />
        ))}
      </div>

      <div className="glass-strong border border-white/10 rounded-[2rem] p-12 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden transition-all duration-500 min-h-[450px]">
          <div className={`absolute inset-0 bg-gradient-to-b opacity-10 pointer-events-none transition-colors duration-1000 ${
              activeSlide === 0 ? 'from-emerald-500 to-transparent' : 
              activeSlide === 4 ? 'from-red-500 to-transparent' : 
              activeSlide === 5 ? 'from-indigo-500 to-transparent' : 'from-amber-500 to-transparent'
          }`}></div>
          <h2 className="text-4xl font-extrabold text-white mb-16 tracking-wide drop-shadow-md z-10">{slide.title}</h2>
          <div className="h-32 flex items-center justify-center mb-16 z-10">{slide.icon}</div>
          <div className="max-w-2xl mx-auto z-10">
            <p className="text-xl md:text-2xl text-slate-100 font-medium leading-relaxed drop-shadow-sm">"{slide.simpleSummary}"</p>
          </div>
          <div className={`mt-8 max-w-xl mx-auto p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-200 font-mono text-sm leading-relaxed transition-all duration-500 ${showTech ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 md:absolute pointer-events-none hidden'}`}>
             <strong className="uppercase text-indigo-400 text-xs block mb-1 tracking-widest">Developer Translation</strong>
             👉 {slide.techDetails}
          </div>
      </div>

      <div className="flex items-center justify-between mt-8">
         <button disabled={activeSlide === 0} onClick={prevSlide} className="px-6 py-4 flex items-center gap-3 font-extrabold text-white/50 hover:text-white disabled:opacity-20 transition-all rounded-full hover:bg-white/5 uppercase tracking-widest">
            <ArrowLeft size={24} /> Back
         </button>
         <button disabled={activeSlide === STORY_SLIDES.length - 1} onClick={nextSlide} className="px-8 py-4 bg-white text-black flex items-center gap-3 font-extrabold disabled:opacity-20 hover:scale-105 active:scale-95 transition-all rounded-full uppercase tracking-widest shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            Next Step <ArrowRight size={24} />
         </button>
      </div>
    </div>
  );
}

// --- LIVE SIMULATION MODE DATA ---
type Step = 'IDLE' | 'GEN_RSA' | 'GEN_AES' | 'WRAP_RSA' | 'CHUNK_ENCRYPT' | 'ZERO_KNOWLEDGE' | 'DECRYPT_AES' | 'DECRYPT_FILE';

function FlowBox({ title, color, detail, active, stepPhase }: { title: string, color: string, detail: string, active: boolean, stepPhase: string }) {
  const colorMap: Record<string, string> = {
    sky: 'border-sky-500/50 bg-sky-500/10 text-sky-400',
    amber: 'border-amber-500/50 bg-amber-500/10 text-amber-400',
    purple: 'border-purple-500/50 bg-purple-500/10 text-purple-400',
    emerald: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400',
    rose: 'border-rose-500/50 bg-rose-500/10 text-rose-400',
  };
  const glowMap: Record<string, string> = {
    sky: 'shadow-sky-500/20', amber: 'shadow-amber-500/20', purple: 'shadow-purple-500/20', emerald: 'shadow-emerald-500/20', rose: 'shadow-rose-500/20'
  }

  return (
    <div className={`relative group w-[220px] p-5 rounded-2xl border-2 backdrop-blur-sm transition-all duration-500 flex flex-col items-center justify-center text-center gap-3 ${active ? `${colorMap[color]} shadow-lg ${glowMap[color]} scale-105` : 'border-white/10 bg-white/5 text-white/40 scale-100'}`}>
      <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-black/50 border border-white/10 absolute -top-3 left-2">{stepPhase}</span>
      <span className="text-[13px] font-bold leading-tight mt-1">{title}</span>
      <div className="absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 w-[280px] p-4 bg-slate-900 border-2 border-slate-700/80 rounded-xl text-left scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all origin-top pointer-events-none z-50 shadow-2xl">
         <div className="text-[11px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-1"><Info size={14}/> Simple Explanation</div>
         <div className="text-sm text-slate-100 leading-relaxed">{detail}</div>
         <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-[8px] border-[8px] border-transparent border-b-slate-700/80"></div>
      </div>
    </div>
  );
}

function FlowArrowDown({ active, label, detail }: { active: boolean, label?: string, detail?: string }) {
  return (
    <div className="h-12 relative flex flex-col items-center justify-center w-[220px] group">
       <div className={`absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1.5 transition-all duration-500 rounded-full ${active ? 'bg-indigo-400 shadow-[0_0_12px_rgba(129,140,248,0.8)]' : 'bg-white/10'}`}></div>
       {active && <ArrowDown size={22} className="absolute bottom-[-8px] text-indigo-400 z-10" />}
       {label && (
         <div className={`absolute left-[calc(50%+16px)] text-xs font-bold uppercase transition-colors px-3 py-1 rounded-full whitespace-nowrap z-20 ${active ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-white/30 hidden md:block'}`}>
            {label}
            {detail && <div className="absolute top-[calc(100%+8px)] left-0 w-48 p-3 bg-slate-900 border border-slate-700 rounded-lg text-left scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all origin-top z-50 whitespace-normal normal-case font-sans shadow-xl hidden md:block">
              <span className="text-slate-100 text-sm">{detail}</span>
            </div>}
         </div>
       )}
    </div>
  );
}

function LiveSimulationMode() {
  const [step, setStep] = useState<Step>('IDLE');
  const [logs, setLogs] = useState<{ id: number; msg: string; source: 'client' | 'server' | 'db'; color: string }[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);
  
  const [clientRsaPub, setClientRsaPub] = useState<string | null>(null);
  const [clientRsaPriv, setClientRsaPriv] = useState<string | null>(null);
  
  const [serverAesKey, setServerAesKey] = useState<string | null>(null);
  const [serverEncryptedRsaBlob, setServerEncryptedRsaBlob] = useState<string | null>(null);
  const [chunkPlaintext, setChunkPlaintext] = useState<string | null>(null);
  const [chunkCiphertext, setChunkCiphertext] = useState<string | null>(null);

  useEffect(() => {
    if (logContainerRef.current) logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
  }, [logs]);

  const addLog = (msg: string, source: 'client' | 'server' | 'db', color: string) => {
    setLogs(prev => [...prev, { id: Date.now() + Math.random(), msg, source, color }]);
  };

  const runSimulation = () => {
    setLogs([]);
    setStep('GEN_RSA');
    setClientRsaPub(null);
    setClientRsaPriv(null);
    setServerAesKey(null);
    setServerEncryptedRsaBlob(null);
    setChunkPlaintext(null);
    setChunkCiphertext(null);
    
    setTimeout(() => {
      setClientRsaPub('0x00A1...E6F (n, e)');
      setClientRsaPriv('0x88B2...99C (d, p, q)');
      addLog('Browser: Generated personal "Padlock" and "Key".', 'client', 'text-emerald-400');
      
      setTimeout(() => {
        setStep('GEN_AES');
        addLog('App: File selected. Notifying backend server...', 'client', 'text-sky-400');
        
        setTimeout(() => {
            setServerAesKey('0x12A9F...B77 (256-bit)');
            addLog('Server: Generated random "AES Password" for this file.', 'server', 'text-amber-400');
            
            setTimeout(() => {
                setStep('WRAP_RSA');
                setServerEncryptedRsaBlob('0x99F... [Locked Blob]');
                addLog('Server: Locked the AES Password using the Client\'s Padlock.', 'server', 'text-amber-400');
                
                setTimeout(() => {
                    setStep('CHUNK_ENCRYPT');
                    setChunkPlaintext('CONFIDENTIAL...');
                    addLog('Browser: Streaming file chunk to sever.', 'client', 'text-sky-400');
                    
                    setTimeout(() => {
                        setChunkCiphertext('0x8FA12B... (Scrambled)');
                        addLog('Server: Scrambling file chunk with the AES Password.', 'server', 'text-amber-400');
                        
                        setTimeout(() => {
                            setStep('ZERO_KNOWLEDGE');
                            setServerAesKey(null);
                            addLog('Server: Wiping the AES Password from server memory!', 'server', 'text-red-400');
                            addLog('Database: Saved the scrambled chunk and the Locked Padlock.', 'db', 'text-purple-400');
                            
                            setTimeout(() => {
                                setStep('DECRYPT_AES');
                                addLog('Browser: Downloading the Locked Padlock from Database...', 'client', 'text-sky-400');
                                
                                setTimeout(() => {
                                    addLog('Browser: Using my Personal Key to unlock the AES Password.', 'client', 'text-emerald-400');
                                    setServerAesKey('0x12A9F...B77 (Restored!)');
                                    
                                    setTimeout(() => {
                                        setStep('DECRYPT_FILE');
                                        addLog('Browser: Un-scrambling the file using the AES Password.', 'client', 'text-emerald-400');
                                        setChunkPlaintext('CONFIDENTIAL... [Restored]');
                                        
                                        setTimeout(() => {
                                            addLog('Done! The server never saw the file contents natively.', 'client', 'text-green-500');
                                            setStep('IDLE');
                                        }, 4000);
                                    }, 2000);
                                }, 2500);
                            }, 3500);
                        }, 2500);
                    }, 2000);
                }, 2000);
            }, 1500);
        }, 2000);
      }, 1500);
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto animation-fade-in relative z-10 pt-4 pb-32 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Activity className="text-teal-400" size={32} />
            Data Flow Explorer
          </h1>
          <p className="text-white/60 mt-1 max-w-2xl">Watch the exact journey of your data. Hover over any glowing box for a simple explanation!</p>
        </div>
        <button disabled={step !== 'IDLE'} onClick={runSimulation} className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/20 shrink-0 border border-indigo-400/50">
          {step === 'IDLE' ? <Play size={18} /> : <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin pb-1" />}
          {step === 'IDLE' ? 'Start Upload Sequence' : 'Simulating...'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        {/* CLIENT COLUMN */}
        <div className={`glass-strong rounded-3xl p-6 border-2 transition-colors duration-500 flex flex-col gap-4 overflow-hidden ${['GEN_RSA', 'DECRYPT_AES', 'DECRYPT_FILE'].includes(step) ? 'border-emerald-500/50 bg-emerald-500/[0.02]' : 'border-white/[0.05]'}`}>
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0"><Smartphone className="text-emerald-400" size={20} /></div>
            <div>
              <h2 className="text-white font-semibold flex items-center gap-2">Client Browser</h2>
              <span className="text-xs text-white/40">Your Local Computer</span>
            </div>
          </div>
          <div className="flex flex-col gap-3 flex-1 relative">
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 relative group cursor-help">
              <span className="text-[11px] font-bold text-emerald-400 uppercase">Public Key (Padlock)</span>
              <div className="absolute top-[calc(100%+8px)] left-0 w-[240px] p-3 bg-slate-900 border border-slate-700 rounded-lg scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all z-50 shadow-xl"><p className="text-sm text-slate-100">Sent to the server so it can lock secrets securely for you. Anyone can snap it shut.</p></div>
              <div className="text-white/80 font-mono text-xs mt-1">{clientRsaPub || 'Waiting...'}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.1)] relative group cursor-help">
              <span className="text-[11px] font-bold text-rose-400 uppercase">Private Key (Actual Key)</span>
               <div className="absolute top-[calc(100%+8px)] left-0 w-[240px] p-3 bg-slate-900 border border-slate-700 rounded-lg scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all z-50 shadow-xl"><p className="text-sm text-slate-100">Never leaves your computer. This is the only thing in the universe that can open the Locked Padlock.</p></div>
              <div className="text-white/80 font-mono text-xs mt-1 break-all">{clientRsaPriv || 'Waiting...'}</div>
            </div>
             <div className={`p-3 rounded-xl bg-black/40 border border-white/5 transition-opacity mt-2 ${chunkPlaintext ? 'opacity-100' : 'opacity-30'}`}>
              <span className="text-xs font-semibold text-sky-400 uppercase">File Chunk (Plaintext)</span>
              <div className="text-white/80 font-mono text-xs md:text-sm mt-1 flex items-center gap-2"><FileText size={14} className="text-sky-400" />{chunkPlaintext || 'secret.pdf [Not mapped]'}</div>
            </div>
             {step === 'DECRYPT_AES' && <div className="mt-auto animate-pulse p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium flex items-center gap-2"><Lock size={16} /> Unlocking Padlock locally...</div>}
          </div>
        </div>

        {/* SERVER COLUMN */}
        <div className={`glass-strong rounded-3xl p-6 border-2 transition-colors duration-500 flex flex-col gap-4 overflow-hidden ${['GEN_AES', 'WRAP_RSA', 'CHUNK_ENCRYPT'].includes(step) ? 'border-amber-500/50 bg-amber-500/[0.02]' : 'border-white/[0.05]'}`}>
           <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0"><Server className="text-amber-400" size={20} /></div>
            <div>
              <h2 className="text-white font-semibold flex items-center gap-2">Dabih Node Server</h2>
              <span className="text-xs text-white/40">Temporary Processing</span>
            </div>
          </div>
          <div className="flex flex-col gap-3 flex-1">
             <div className={`p-3 rounded-xl bg-black/40 border transition-all ${step === 'ZERO_KNOWLEDGE' ? 'border-red-500/50 grayscale opacity-50' : 'border-white/5'} relative overflow-hidden group cursor-help`}>
              <span className={`text-[11px] font-bold ${step === 'ZERO_KNOWLEDGE' ? 'text-red-400' : 'text-amber-400'} uppercase transition-colors`}>Random AES Password</span>
              <div className="absolute top-[calc(100%+8px)] left-0 w-[240px] p-3 bg-slate-900 border border-slate-700 rounded-lg scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all z-50 shadow-xl"><p className="text-sm text-slate-100">A massive random password created just for this one specific file upload.</p></div>
              {step === 'ZERO_KNOWLEDGE' && <div className="absolute inset-0 bg-red-950/80 backdrop-blur-[2px] flex items-center justify-center font-bold text-red-500 text-sm z-10 tracking-widest animation-pulse">DESTROYED</div>}
              <div className="text-white/80 font-mono text-xs mt-1">{serverAesKey || 'Waiting...'}</div>
            </div>
             <div className="p-3 rounded-xl bg-black/40 border border-indigo-500/20 group cursor-help relative">
              <span className="text-[11px] font-bold text-indigo-400 uppercase flex items-center gap-1">Locked Padlock Blob <Lock size={12}/></span>
              <div className="absolute top-[calc(100%+8px)] left-0 w-[240px] p-3 bg-slate-900 border border-slate-700 rounded-lg scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all z-50 shadow-xl"><p className="text-sm text-slate-100">The AES Password safely locked inside the Client's Padlock. The server itself cannot open this box.</p></div>
              <div className="text-white/80 font-mono text-xs mt-1 break-all">{serverEncryptedRsaBlob || 'Waiting...'}</div>
            </div>
          </div>
        </div>

        {/* DATABASE COLUMN */}
        <div className={`glass-strong rounded-3xl p-6 border-2 transition-colors duration-500 flex flex-col gap-4 overflow-hidden ${['ZERO_KNOWLEDGE'].includes(step) ? 'border-purple-500/50 bg-purple-500/[0.02]' : 'border-white/[0.05]'}`}>
           <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0"><Database className="text-purple-400" size={20} /></div>
            <div>
              <h2 className="text-white font-semibold flex items-center gap-2">Database</h2>
              <span className="text-xs text-white/40">Permanent Cold Storage</span>
            </div>
          </div>
          <div className="flex flex-col gap-4 flex-1 justify-center relative">
             <div className={`p-4 rounded-xl border border-dashed transition-all duration-700 ${serverEncryptedRsaBlob ? 'bg-purple-500/10 border-purple-500/40 transform translate-y-0 opacity-100' : 'bg-white/5 border-white/10 -translate-y-4 opacity-50'}`}>
                <div className="font-bold text-white/90 text-[13px] mb-1 flex items-center gap-2"><CheckCircle size={16} className={serverEncryptedRsaBlob ? 'text-purple-400' : 'text-white/20'}/>Locked Password Saved</div>
                <div className="text-xs text-white/50 leading-relaxed">Secured. 100% unreadable without Client Private Key.</div>
             </div>
             <div className={`p-4 rounded-xl border border-dashed transition-all duration-700 ${chunkCiphertext ? 'bg-purple-500/10 border-purple-500/40 transform translate-y-0 opacity-100' : 'bg-white/5 border-white/10 -translate-y-4 opacity-50'}`}>
                <div className="font-bold text-white/90 text-[13px] mb-1 flex items-center gap-2"><CheckCircle size={16} className={chunkCiphertext ? 'text-purple-400' : 'text-white/20'}/>Scrambled Data Saved</div>
                <div className="text-xs text-white/50 leading-relaxed">Secured. 100% unreadable without the AES password.</div>
             </div>
          </div>
        </div>
      </div>

      <div className="glass-strong rounded-3xl p-6 md:p-10 border border-white/[0.05] relative animate-fade-in mt-2 flex flex-col items-center gap-0">
         <h3 className="text-white/90 font-black mb-10 tracking-widest text-lg flex items-center gap-3 w-full border-b border-white/10 pb-6">
            <Activity className="text-teal-400" size={24} /> THE SECURE PIPELINE ENGINE
         </h3>
         <FlowBox title="1. Generate Password" color="amber" stepPhase="INIT" detail="The Server rolls completely random dice to create a unique AES Password (256 bits). It's temporarily held in volatile memory to scramble the incoming files." active={['GEN_AES', 'WRAP_RSA', 'CHUNK_ENCRYPT'].includes(step)} />
         <FlowArrowDown active={['WRAP_RSA', 'CHUNK_ENCRYPT'].includes(step)} label="Feed Into" detail="Password flows to the Scrambler and Padlock Wrappers." />
         <div className="flex gap-8 md:gap-24 items-start pb-4">
             <div className="flex flex-col items-center w-[220px]">
                 <FlowBox title="2a. Lock The Password" color="emerald" stepPhase="RSA-OAEP" detail="The Server takes the 'Open Padlock' you sent it (Public Key) and clicks it shut around the AES Password. Mathematically, it's raising large prime numbers to exponents." active={['WRAP_RSA'].includes(step)} />
                 <FlowArrowDown active={['ZERO_KNOWLEDGE', 'DECRYPT_AES', 'DECRYPT_FILE'].includes(step)} label="Vault" detail="The locked password box drops into the Database permanently." />
                 <FlowBox title="Locked Password Blob" color="purple" stepPhase="DATABASE" detail="This box is now resting in the database. The server DOES NOT have the key to open it. It is blind to the password." active={['WRAP_RSA', 'ZERO_KNOWLEDGE', 'DECRYPT_AES', 'DECRYPT_FILE'].includes(step)} />
             </div>
             <div className="flex flex-col items-center w-[220px]">
                 <FlowBox title="2b. Scramble The File" color="sky" stepPhase="AES-CBC" detail="The Server takes your raw file, chops it into pieces, and shuffles the bytes 14 times (like blending a smoothie) using the AES Password as the formula." active={['CHUNK_ENCRYPT', 'DECRYPT_FILE'].includes(step)} />
                 <FlowArrowDown active={['ZERO_KNOWLEDGE', 'DECRYPT_AES', 'DECRYPT_FILE'].includes(step)} label="Vault" detail="The scrambled file drops into the Database permanently." />
                 <FlowBox title="Ciphertext Binary" color="purple" stepPhase="DATABASE" detail="This is mathematical gibberish. Since the file is scrambled, and the AES password is deleted, the server cannot read your file anymore." active={['CHUNK_ENCRYPT', 'ZERO_KNOWLEDGE', 'DECRYPT_FILE', 'DECRYPT_AES'].includes(step)} />
             </div>
         </div>
      </div>

      <div className="glass-strong rounded-3xl p-6 border border-white/[0.05] h-56 flex flex-col mt-4">
        <h3 className="text-white/80 font-semibold mb-3 tracking-wide text-sm flex items-center justify-between"><span className="flex items-center gap-2"><Lock size={14}/> LIVE EVENT LOG</span></h3>
        <div ref={logContainerRef} className="flex-1 overflow-y-auto space-y-2 font-mono text-[13px] pr-4 custom-scrollbar">
          {logs.length === 0 && <span className="text-white/20 italic">Click Start Upload Sequence to watch the zero-knowledge process...</span>}
          {logs.map(log => (
            <div key={log.id} className="flex gap-4 animate-fade-in-up py-0.5">
              <span className="text-white/30 shrink-0 select-none">[{new Date().toISOString().split('T')[1].slice(0, 8)}]</span>
              <span className={`shrink-0 uppercase font-bold w-16 ${log.source === 'client' ? 'text-emerald-500' : log.source === 'server' ? 'text-amber-500' : 'text-purple-500'}`}>{log.source.padEnd(6, ' ')}</span>
              <span className={`${log.color} break-words`}>{log.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// MAIN PAGE CONTAINER
export default function SimulatePage() {
  const [viewMode, setViewMode] = useState<'STORY' | 'LIVE'>('STORY');

  return (
    <div className="w-full min-h-screen relative z-10 flex flex-col">
       <div className="flex justify-center pt-8 pb-4 animate-fade-in z-20 sticky top-16">
          <div className="bg-black/40 p-1.5 rounded-full flex gap-2 border border-white/10 backdrop-blur-xl shadow-xl">
             <button 
                onClick={() => setViewMode('STORY')} 
                className={`px-8 py-2.5 rounded-full font-bold text-sm transition-all focus:outline-none flex items-center gap-2 tracking-wide ${viewMode === 'STORY' ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'text-white/40 hover:text-white/90 hover:bg-white/5'}`}
             >
                <Layers size={16}/> Present to Teachers
             </button>
             <button 
                onClick={() => setViewMode('LIVE')} 
                className={`px-8 py-2.5 rounded-full font-bold text-sm transition-all focus:outline-none flex items-center gap-2 tracking-wide ${viewMode === 'LIVE' ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'text-white/40 hover:text-white/90 hover:bg-white/5'}`}
             >
                <Activity size={16}/> Live Tech Simulation
             </button>
          </div>
       </div>
       
       <div className="flex-1 w-full px-4">
          {viewMode === 'STORY' ? <StoryMode /> : <LiveSimulationMode />}
       </div>
    </div>
  );
}
