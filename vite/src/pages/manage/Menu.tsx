
import { AlertOctagon, Copy, Download, FolderPlus, Trash2, Star } from "react-feather";
import useFinder from "./Context";
import { useEffect, useRef } from "react";
import useTransfers from "@/lib/hooks/transfers";
import useSession from "@/Session";
import useFiles from "@/lib/hooks/files";

export default function OptionsMenu() {
  const { key } = useSession();
  const {
    menu,
    setMenu,
    selected,
    addFolder,
    remove,
    destroy,
    duplicate,
    toggleStar,
    actions,
  } = useFinder();
  const ref = useRef<HTMLDivElement>(null);
  const download = useTransfers((state => state.download));
  const nodes = useFiles((state) => state.nodes);
  
  const isAllStarred = selected.length > 0 && selected.every(mnemonic => {
    const node = nodes.find(n => n.mnemonic === mnemonic);
    return node?.tag === "starred";
  });

  const position = {
    left: menu.left,
    top: menu.top,
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const node = event.target as Node;
      const elem = ref.current;
      if (elem && !elem.contains(node)) {
        setMenu({ top: 0, left: 0, open: false });
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [setMenu]);


  if (!menu.open) {
    return null;
  }


  return (
    <div ref={ref}>
      <div
        className="w-52 z-10 absolute glass-strong rounded-xl p-1 text-sm text-white/80 transition duration-100 ease-out data-closed:scale-95 data-closed:opacity-0"
        style={position}>
        <div>
          <button
            onClick={() => {
              addFolder();
              setMenu({ top: 0, left: 0, open: false });
            }}
            className="group flex w-full items-center gap-2 rounded-lg py-1.5 px-3 hover:bg-white/[0.08] transition-colors duration-200">
            <FolderPlus size={16} className="text-white/50" />
            New Folder
          </button>
        </div>
        <div>
          <button
            onClick={() => {
              toggleStar();
              setMenu({ top: 0, left: 0, open: false });
            }}
            disabled={selected.length === 0}
            className="group flex w-full items-center gap-2 rounded-lg py-1.5 px-3 hover:bg-white/[0.08] transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed">
            <Star size={16} className={isAllStarred ? "text-yellow-400 fill-yellow-400" : "text-white/50"} />
            {isAllStarred ? "Unstar" : "Star"}
          </button>
        </div>
        <div>
          <button
            onClick={() => {
              download(selected, key!);
              setMenu({ top: 0, left: 0, open: false });
            }}
            disabled={!actions.has("download") || !key}
            className="group flex w-full items-center gap-2 rounded-lg py-1.5 px-3 hover:bg-white/[0.08] transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed">
            <Download size={16} className="text-white/50" />
            Download
          </button>
        </div>
        <div>
          <button
            onClick={() => {
              duplicate();
              setMenu({ top: 0, left: 0, open: false });
            }}
            disabled={!actions.has("duplicate")}
            className="group flex w-full items-center gap-2 rounded-lg py-1.5 px-3 hover:bg-white/[0.08] transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed">
            <Copy size={16} className="text-white/50" />
            Duplicate
          </button>
        </div>
        <div className="my-1 h-px bg-white/[0.06]" />
        <div>
          {actions.has("destroy") ? (
            <button
              type="button"
              disabled={!actions.has("destroy")}
              onClick={() => {
                destroy()
                setMenu({ top: 0, left: 0, open: false });
              }}
              className="group flex w-full items-center text-red gap-2 rounded-lg py-1.5 px-3 hover:bg-red/10 transition-colors duration-200 disabled:opacity-30"
            >
              <Trash2 size={16} />
              Delete forever
              <AlertOctagon className="stroke-3" size={14} />
            </button>
          ) : (
            <button
              type="button"
              disabled={!actions.has("remove")}
              onClick={() => {
                remove()
                setMenu({ top: 0, left: 0, open: false });
              }}
              className="group flex w-full items-center text-red gap-2 rounded-lg py-1.5 px-3 hover:bg-red/10 transition-colors duration-200 disabled:opacity-30"
            >
              <Trash2 size={16} />
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

