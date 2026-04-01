
import { InodeMembers, InodeType } from "@/lib/api/types";

import Draggable from "./Draggable";
import Droppable from "./Droppable";

import Icon from "./Icon";
import FileName from "./Filename";
import { useState } from "react";
import useFinder from "../Context";
import useFiles from "@/lib/hooks/files";
import useSession from "@/Session";
import { Star } from "react-feather";
export default function Inode({ inode }: { inode: InodeMembers }) {
  const { isAdmin, user } = useSession();
  const {
    setMenu,
    selected,
    setSelected,
    list,
  } = useFinder();
  const searchStatus = useFiles((state) => state.searchStatus);
  const parents = useFiles((state) => state.parents);

  const isMember = [inode, ...parents].some((node) => {
    return node.members.some((member) => member.sub === user?.sub);
  });
  const isSearch = ["complete", "loading"].includes(searchStatus);

  return (
    <div
      className="h-fit w-32 select-none"
      key={inode.mnemonic}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.shiftKey || e.metaKey) {
          const newSelected = [...selected].filter((mnemonic) => mnemonic !== inode.mnemonic);
          if (selected.length === newSelected.length) {
            newSelected.push(inode.mnemonic);
          }
          setSelected(newSelected);
          return;
        }
        setSelected([inode.mnemonic]);
      }}
      onDoubleClick={() => {
        if (!isMember && !isAdmin && !isSearch) {
          return;
        }
        list(inode.mnemonic);
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!selected.includes(inode.mnemonic)) {
          setSelected([inode.mnemonic]);
        }
        setMenu({ left: e.clientX, top: e.clientY, open: true });
      }}
    >
      <InodeInner
        inode={inode}
        selected={selected?.includes(inode.mnemonic)}
        disabled={!isMember && !isSearch}
      />
    </div>
  );


}


function InodeInner({
  inode,
  selected,
  disabled,
}: {
  inode: InodeMembers,
  selected: boolean,
  disabled: boolean,
}) {
  const { rename } = useFinder();
  const [name, setName] = useState<string | null>(null);
  const { type, mnemonic } = inode;

  const dragId = `drag-${mnemonic}`;
  const dropId = `drop-${mnemonic}`;

  const getName = () => {
    if (!name) {
      return (
        <FileName fileName={inode.name} />
      );
    }
    return (
      <input
        autoFocus
        className="w-full h-full bg-white/[0.06] border border-white/10 rounded px-1 text-white/80 text-xs focus:outline-none focus:ring-1 focus:ring-white/20"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onFocus={(e) => {
          const idx = name.lastIndexOf(".") || name.length;
          e.target.setSelectionRange(0, idx);
        }}
        onKeyUp={(e) => {
          e.stopPropagation()
          if (e.key === "Enter") {
            if (name === inode.name) {
              setName(null);
              return;
            }
            rename(mnemonic, name);
            setName(null);
          }
        }}
        onKeyDown={(e) => { e.stopPropagation() }}
        onBlur={(e) => {
          e.stopPropagation();
          if (name === inode.name) {
            setName(null);
            return;
          }
          rename(mnemonic, name);
          setName(null);
        }}
      />
    );
  }


  if (type === InodeType.FILE) {
    return (
      <Draggable id={dragId}>
        <div
          className={`flex h-[110px] w-full flex-col p-2 rounded-xl text-white/70 items-center justify-start transition-all duration-200 ${(disabled) ? "opacity-50" : "hover:bg-white/5 hover:scale-105"}`}>
          <div className="relative">
            <div className={`m-1 p-2 rounded-xl transition-colors duration-200 ${(selected) ? "bg-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]" : ""}`}>
              <Icon inode={inode} />
            </div>
            {inode.tag === "starred" && (
              <div className="absolute top-1 right-1 text-yellow-400 drop-shadow-md">
                <Star size={14} className="fill-yellow-400" />
              </div>
            )}
          </div>
          <div
            onDoubleClick={(e) => {
              e.stopPropagation();
              setName(inode.name);
            }}
            className={`max-w-[80px] w-[80px] px-1 py-0.5 mt-0 rounded text-center font-medium transition-colors duration-200 ${(selected && !name) ? "text-white bg-blue-500/80 shadow-sm" : ""}`}>
            {getName()}
          </div>
        </div>
      </Draggable>
    );
  }

  if (type === InodeType.DIRECTORY) {
    return (
      <Draggable id={dragId}>
        <Droppable id={dropId}>
          <div
            className={`flex h-[110px] w-full flex-col p-2 rounded-xl text-white/70 items-center justify-start transition-all duration-200 ${(disabled) ? "opacity-50" : "hover:bg-white/5 hover:scale-105"}`}>
            <div className="relative">
              <div className={`m-1 p-2 rounded-xl transition-colors duration-200 ${(selected) ? "bg-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]" : ""}`}>
                <Icon inode={inode} />
              </div>
              {inode.tag === "starred" && (
                <div className="absolute top-1 right-1 text-yellow-400 drop-shadow-md">
                  <Star size={14} className="fill-yellow-400" />
                </div>
              )}
            </div>
            <div
              onDoubleClick={(e) => {
                e.stopPropagation();
                setName(inode.name);
              }}
              className={`max-w-[80px] w-[80px] px-1 py-0.5 mt-0 rounded text-center font-medium transition-colors duration-200 ${(selected) ? "text-white bg-blue-500/80 shadow-sm" : ""}`}>
              {getName()}
            </div>
          </div>
        </Droppable>
      </Draggable>
    );
  }

  if (type === InodeType.TRASH || type === InodeType.HOME) {
    return (
      <Droppable id={dropId}>
        <div
          className={`flex h-fit flex-col rounded-xl text-white/60 items-center ${(disabled) ? "opacity-50" : ""}`}>
          <div className={`m-1 relative rounded-lg ${(selected) ? "bg-white/[0.08]" : ""}`}>
            <Icon inode={inode} />
          </div>
          <div className={`max-w-[80px] w-[80px] px-1 mt-0 rounded text-center ${(selected) ? "text-white bg-white/[0.15]" : ""}`}>
            {inode.name}
          </div>
        </div>
      </Droppable >
    );
  }

  return (
    <div
      className="flex h-fit flex-col rounded-xl text-white/40 items-center">
      <div className={`m-1 relative rounded-lg ${(selected) ? "bg-white/[0.08]" : ""}`}>
        <Icon inode={inode} />
      </div>
      <div className={`max-w-[80px] w-[80px] px-1 mt-0 rounded text-center ${(selected) ? "text-white bg-white/[0.15]" : ""}`}>
        <FileName fileName={inode.name} />
      </div>
    </div>
  );
}
