import { useState } from 'react';
import { Folder, Users, Trash2, Home, Star } from 'react-feather';
import useFiles from '@/lib/hooks/files';

export default function Sidebar() {
  const list = useFiles((state) => state.list);
  const listShared = useFiles((state) => state.shared);
  const search = useFiles((state) => state.search);

  const navBtnClass = (isActive: boolean) =>
    `flex w-full items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 ${
      isActive 
        ? "bg-white/10 text-white font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]" 
        : "text-white/60 hover:bg-white/5 hover:text-white"
    }`;

  // Simple state to track active tab since we aren't using router paths for these views yet
  const [activeTab, setActiveTab] = useState<'files' | 'shared' | 'starred' | 'trash'>('files');

  const handleNav = (tab: 'files' | 'shared' | 'starred' | 'trash') => {
    setActiveTab(tab);
    if (tab === 'files') list(null);
    if (tab === 'shared') listShared();
    if (tab === 'starred') search('starred');
    // Trash would have its own fetch list methods here
  };

  return (
    <div className="w-64 shrink-0 flex flex-col h-[calc(100vh-100px)] py-4 pl-2 pr-4 select-none">
      <div className="flex flex-col gap-1">
        <button onClick={() => handleNav('files')} className={navBtnClass(activeTab === 'files')}>
          <Home size={18} />
          <span>My Files</span>
        </button>
        <button onClick={() => handleNav('shared')} className={navBtnClass(activeTab === 'shared')}>
          <Users size={18} />
          <span>Shared with me</span>
        </button>
        <button onClick={() => handleNav('starred')} className={navBtnClass(activeTab === 'starred')}>
          <Star size={18} />
          <span>Starred</span>
        </button>
        
        <div className="my-3 h-px bg-white/10 w-full" />
        
        <button onClick={() => handleNav('trash')} className={navBtnClass(activeTab === 'trash')}>
          <Trash2 size={18} />
          <span>Trash</span>
        </button>
      </div>

      <div className="mt-auto items-center justify-center pt-8">
        <div className="glass-strong rounded-2xl p-4 flex flex-col items-center text-center gap-2 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform duration-300">
                <Folder size={18} className="text-white border-white/20" />
            </div>
            <h4 className="text-white text-sm font-medium">Storage Details</h4>
            <p className="text-white/40 text-xs">Used 450 MB of 2 GB</p>
            <div className="w-full bg-white/10 rounded-full h-1.5 mt-1 overflow-hidden">
                <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: '22%' }}></div>
            </div>
        </div>
      </div>
    </div>
  );
}
