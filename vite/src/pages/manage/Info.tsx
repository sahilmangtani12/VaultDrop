"use client";

import useFiles from "@/lib/hooks/files";
import useFinder from "./Context";
import InodeInfo from "./info/Inode";
import Members from "./info/Members";
import Buttons from "./info/Buttons";
import { X } from "react-feather";

export default function Info() {
  const { selected, setSelected } = useFinder();
  const nodes = useFiles((state) => state.nodes);
  const set = new Set(selected);
  const selectedNodes = nodes.filter((node) => set.has(node.mnemonic));

  const isOpen = selectedNodes.length > 0;

  return (
    <div 
      className={`h-full w-full glass border border-white/20 rounded-2xl flex flex-col transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] transform shadow-[0_8px_40px_rgba(0,0,0,0.6)] ${
        isOpen ? 'translate-x-0 opacity-100 backdrop-blur-3xl pointer-events-auto' : 'translate-x-10 opacity-0 pointer-events-none'
      }`}
    >
      <div className="flex justify-between items-center p-4 border-b border-white/5 shrink-0">
        <h2 className="text-white/80 font-medium tracking-wide">
          {selectedNodes.length === 1 ? 'Details' : `${selectedNodes.length} Items Selected`}
        </h2>
        <button 
          onClick={() => setSelected([])}
          className="text-white/40 hover:text-white/90 p-1.5 rounded-full hover:bg-white/10 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {selectedNodes.length === 1 ? (
          <div className="space-y-6">
            <InodeInfo inode={selectedNodes[0]} />
            <Members inode={selectedNodes[0]} />
          </div>
        ) : selectedNodes.length > 1 ? (
          <div className="flex flex-col items-center justify-center h-40 opacity-70">
             <p className="text-white/50 text-sm mt-4 text-center">
               Multiple items selected. <br/> Use the actions below.
             </p>
          </div>
        ) : null}
      </div>

      <div className="p-4 border-t border-white/5 shrink-0 w-full bg-white/[0.02]">
        <Buttons />
      </div>
    </div>
  );
}
