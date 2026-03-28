"use client";

import Inode from "./inode/Inode";
import DragOverlay from "./DragOverlay";
import ParentDirectory from "./inode/ParentDirectory";
import Parents from "./inode/Parents";
import useFinder from "./Context";
import Header from "./inode/Header";
import useFiles from "@/lib/hooks/files";



export default function Files() {
  const {
    setMenu,
    setSelected,
  } = useFinder();
  const nodes = useFiles((state) => state.nodes);

  return (
    <div
      className="h-full overflow-hidden flex flex-col bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-3xl p-6 select-none relative"
      onContextMenu={(e) => {
        e.preventDefault();
        setSelected([]);
        setMenu({ left: e.clientX, top: e.clientY, open: true });
      }}
    >
      <Header />
      <div className="flex-1 overflow-y-auto custom-scrollbar mt-4 pr-2">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-4 content-start">
          <ParentDirectory />
          {nodes.map((inode) => (
            <Inode key={inode.mnemonic} inode={inode} />
          ))}
          <DragOverlay />
        </div>
      </div>
      <Parents />
    </div >
  );
}
