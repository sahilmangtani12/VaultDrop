import { Bytes } from "@/util";
import useTransfers from "@/lib/hooks/transfers";
import type { Upload } from "@/lib/hooks/transfers";
import { Trash2, Upload as UploadIcon, X } from "react-feather";
import FileName from "../manage/inode/Filename";


export default function UploadTransfer({ data }: { data: Upload }) {
  const { status } = data;

  const clearTransfer = useTransfers((state) => state.clearTransfer);
  const cancelTransfer = useTransfers((state) => state.cancelTransfer);


  const getStatus = () => {
    const inode = data.inode;
    const fileName = inode?.name ?? data.file?.name ?? "";
    const mnemonic = inode?.mnemonic;
    const error = data.error;

    switch (status) {
      case "error":
        return (
          <div className="text-xs">
            <div className="font-mono py-1">
              <FileName fileName={fileName} />
            </div>
            <span className="bg-red text-white font-bold px-2 py-1 mx-2 rounded-full">Error</span>
            <span className="text-red text-xs">
              {error}
            </span>
          </div>
        );
      case "interrupted":
        return (
          <div className="text-xs text-center py-2 flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="bg-orange/20 text-orange border border-orange/20 shadow-[0_0_10px_rgba(255,165,0,0.1)] font-bold px-2 py-1 rounded-full text-[10px] uppercase tracking-wider">Interrupted</span>
              <button
                type="button"
                className="bg-red/20 text-red hover:bg-red hover:text-white border border-red/20 font-bold p-1 rounded transition-colors duration-200"
                onClick={() => void cancelTransfer(data.id)}
              >
                <Trash2 size={12} />
              </button>
            </div>
            <div className="font-mono py-1 max-w-[140px]">
              <FileName fileName={fileName} />
            </div>
          </div>
        );
      case "complete":
        return (
          <div className="text-xs text-left py-1 flex flex-col items-center gap-2">
            <div className="flex items-center">
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)] font-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-wider">Complete</span>
            </div>
            <div className="font-mono flex flex-col items-center gap-1 w-full mt-1">
              <div className="max-w-[140px]">
                 <FileName fileName={fileName} />
              </div>
              <span className="text-white/40 text-[10px] font-mono font-extrabold">
                {mnemonic}
              </span>
            </div>
          </div>
        );
      case "uploading":
        return (
          <div className="flex flex-col items-center justify-center gap-1">
            <span className="text-white/70">
              Uploading <FileName fileName={fileName} hidden={!fileName} />
            </span>
            <span className="text-white/40 text-[10px]">as</span>
            <span className="text-blue-400 font-mono font-extrabold truncate max-w-[180px]">
              {mnemonic}
            </span>
          </div>
        );
      default:
        return `Transfer ${status}: ${fileName}`;
    }
  }

  const getProgress = () => {
    const inode = data.inode;
    const chunks = inode?.data.chunks;
    if (!chunks) {
      return null;
    }
    const total = parseInt(inode.data.size as string, 10);
    const current = parseInt(chunks.at(-1)?.end as string, 10) ?? 0;
    const percent = Math.round((1000 * current) / total) / 10;
    const width = `${Math.round(percent)}%`;
    return (
      <div className="flex items-center w-full mt-1">
        <div className="text-[10px] sm:text-xs font-mono font-bold text-white/80 px-1 w-12 sm:w-16 shrink-0 text-right mr-1">
          {percent.toFixed(1)}%
        </div>
        <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
          <div className="bg-blue-400 h-1.5 rounded-full" style={{ width }}>
          </div>
        </div>
        <div className="ml-2 font-mono text-[10px] sm:text-[11px] text-white/40 text-nowrap shrink-0 text-right">
          <Bytes value={current} />
          {" "}
          /
          {" "}
          <Bytes value={total} />
        </div>
      </div>
    );


  }


  return (
    <div className="flex items-center py-3 border-b border-white/[0.05] last:border-none">
      <div className="text-[10px] font-bold text-blue-400 px-2 flex flex-col items-center justify-center shrink-0 w-16">
        <UploadIcon className="mb-1" size={20} />
        <span className="uppercase tracking-wider">Push</span>
      </div>
      <div className="grow flex flex-col justify-center px-2 pr-4 min-w-0">
        <div className="text-xs text-center w-full">
          {getStatus()}
        </div>
        {getProgress()}
      </div>
      <div className="shrink-0 flex items-center pr-2">
        <button
          type="button"
          className="text-white/20 hover:text-white/60 hover:bg-white/5 p-1.5 rounded-full transition-colors"
          onClick={() => void clearTransfer(data.id)}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
