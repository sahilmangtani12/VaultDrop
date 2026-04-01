import { useState } from 'react';
import { Folder, Users, Trash2, Home, Star } from 'react-feather';
import useFiles from '@/lib/hooks/files';
import useSession from '@/Session';
import Bytes from '@/util/Bytes';

export default function Sidebar() {
  const list = useFiles((state) => state.list);
  const listShared = useFiles((state) => state.shared);
  const listTrash = useFiles((state) => state.trash);
  const search = useFiles((state) => state.search);
  const { user } = useSession();

  const navBtnClass = (isActive: boolean) =>
    `flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-200 text-sm ${
      isActive 
        ? "bg-white/10 text-white font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]" 
        : "text-white/60 hover:bg-white/5 hover:text-white"
    }`;

  const [activeTab, setActiveTab] = useState<'files' | 'shared' | 'starred' | 'trash'>('files');

  const handleNav = (tab: 'files' | 'shared' | 'starred' | 'trash') => {
    setActiveTab(tab);
    if (tab === 'files') list(null);
    if (tab === 'shared') listShared();
    if (tab === 'starred') search('starred');
    if (tab === 'trash') listTrash();
  };

  const usedStorage = user?.storageUsed || 0;
  const maxStorage = 15 * 1024 * 1024 * 1024; // 15 GB
  const usedPercentage = Math.min(100, Math.max(0, (usedStorage / maxStorage) * 100));

  return (
    <div className="w-full flex flex-row items-center justify-between pb-4 select-none shrink-0 border-b border-white/[0.05] mb-4 overflow-hidden">
      <div className="flex flex-row items-center gap-1.5 overflow-x-auto custom-scrollbar pr-4">
        <button onClick={() => handleNav('files')} className={navBtnClass(activeTab === 'files')}>
          <Home size={16} />
          <span className="whitespace-nowrap">My Files</span>
        </button>
        <button onClick={() => handleNav('shared')} className={navBtnClass(activeTab === 'shared')}>
          <Users size={16} />
          <span className="whitespace-nowrap">Shared</span>
        </button>
        <button onClick={() => handleNav('starred')} className={navBtnClass(activeTab === 'starred')}>
          <Star size={16} />
          <span className="whitespace-nowrap">Starred</span>
        </button>
        
        <div className="mx-2 w-px h-5 bg-white/10 shrink-0" />
        
        <button onClick={() => handleNav('trash')} className={navBtnClass(activeTab === 'trash')}>
          <Trash2 size={16} />
          <span className="whitespace-nowrap">Trash</span>
        </button>
      </div>

      <div className="hidden md:flex items-center ml-4 shrink-0">
        <div className="glass-strong rounded-full px-4 py-2 flex flex-row items-center gap-3 group relative overflow-hidden shrink-0">
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent pointer-events-none" />
            <Folder size={14} className="text-white/60 shrink-0" />
            <div className="flex flex-col w-32 justify-center shrink-0">
                <div className="flex items-center justify-between w-full mb-1">
                   <h4 className="text-white/90 text-[9px] uppercase font-bold tracking-widest bg-white/10 px-1 rounded-sm">Storage</h4>
                   <span className="text-white/50 text-[10px] font-mono tracking-tight"><Bytes value={usedStorage} decimals={1} binary={false} /></span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden">
                    <div className={`h-1 rounded-full ${usedPercentage > 90 ? 'bg-red-400' : usedPercentage > 75 ? 'bg-yellow-400' : 'bg-blue-400'}`} style={{ width: `${usedPercentage}%` }}></div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
