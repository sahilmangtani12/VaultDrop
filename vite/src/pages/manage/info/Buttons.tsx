
import useFiles from "@/lib/hooks/files";
import useFinder from "../Context";
import useTransfers from "@/lib/hooks/transfers";
import useSession from "@/Session";
import { AlertOctagon, DownloadCloud, Trash2 } from "react-feather";




export default function Buttons() {
  const { user, key } = useSession();
  const { actions, selected, remove, destroy } = useFinder();
  const download = useTransfers((state => state.download));
  const nodes = useFiles((state) => state.nodes);
  const set = new Set(selected);
  const selectedNodes = nodes.filter((node) => set.has(node.mnemonic));


  if (selectedNodes.length === 0 || !user) {
    return null;
  }



  return (
    <div className="flex space-x-2 p-3">
      <button
        type="button"
        disabled={!actions.has("download") || !key}
        className="w-full p-2 text-white/80 glass-strong rounded-xl disabled:opacity-30 disabled:cursor-not-allowed inline-flex items-center justify-center text-sm font-medium hover:bg-white/[0.12] transition-all duration-200"
        onClick={() => download(selected, key!)}
      >
        <DownloadCloud className="mr-2 text-white/50" size={16} />
        Download
      </button>
      {actions.has("destroy") ? (
        <button
          type="button"
          disabled={!actions.has("destroy")}
          onClick={() => destroy()}
          className="w-full p-2 text-red bg-red/10 hover:bg-red/20 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed inline-flex items-center justify-center text-sm font-medium transition-all duration-200"
        >
          <Trash2 className="mr-2" size={16} />
          Delete forever
          <AlertOctagon className="ml-1 stroke-3" size={14} />
        </button>
      ) : (
        <button
          type="button"
          disabled={!actions.has("remove")}
          onClick={() => remove()}
          className="w-full p-2 text-red bg-red/10 hover:bg-red/20 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed inline-flex items-center justify-center text-sm font-medium transition-all duration-200"
        >
          <Trash2 className="mr-2" size={16} />
          Delete
        </button>
      )}
    </div>
  );
}
