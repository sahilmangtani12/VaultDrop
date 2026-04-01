import { Bytes } from "@/util";
import useTransfers from "@/lib/hooks/transfers";
import type { Download } from "@/lib/hooks/transfers";
import { Download as DownloadIcon, X } from "react-feather";
import FileName from "../manage/inode/Filename";


export default function DownloadTransfer({ data }: { data: Download }) {
  const { status, mnemonics } = data;
  const displayName = mnemonics.length === 1 ? mnemonics[0] : `${mnemonics.length} items`;

  const clearTransfer = useTransfers((state) => state.clearTransfer);


  const getStatus = () => {
    const error = data.error;

    switch (status) {
      case "error":
        return (
          <div className="text-xs">
            <div className="font-mono py-1">
              {displayName}
            </div>
            <span className="bg-red text-white font-bold px-2 py-1 mx-2 rounded-full">Error</span>
            <span className="text-red text-xs">
              {error}
            </span>
          </div>
        );
      case "complete": {
        const file = data.result!;
        const url = URL.createObjectURL(file);

        return (
          <div className="text-xs text-left py-1 flex flex-col items-center gap-2">
            <div className="flex items-center">
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)] font-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-wider">Complete</span>
            </div>
            <div className="font-mono flex flex-col items-center gap-1 w-full">
              <a href={url} download={file.name} className="text-white bg-blue-500 hover:bg-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)] px-3 py-1.5 rounded-lg flex items-center justify-center gap-2 font-bold transition-all duration-200 w-fit">
                <span>Save</span>
                <div className="max-w-[140px]">
                  <FileName fileName={file.name} />
                </div>
              </a>
              <span className="text-white/40 text-[10px] font-mono font-extrabold mt-1">
                {displayName}
              </span>
            </div>
          </div>
        );
      }
      case "downloading":
        return (
          <div className="flex flex-col items-center justify-center gap-1">
            <span className="text-white/70">Downloading</span>
            <span className="text-blue-400 font-mono font-extrabold truncate max-w-[180px]">
              {displayName}
            </span>
          </div>
        );
      default:
        return `Transfer ${status}: ${displayName}`;
    }
  }

  const getProgress = () => {
    const { current, size, status } = data;
    if (!current || !size || status !== "downloading") {
      return null;
    }


    const percent = Math.round((1000 * current) / size) / 10;
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
          <Bytes value={size} />
        </div>
      </div>
    );


  }


  return (
    <div className="flex items-center py-3 border-b border-white/[0.05] last:border-none">
      <div className="text-[10px] font-bold text-blue-400 px-2 flex flex-col items-center justify-center shrink-0 w-16">
        <DownloadIcon className="mb-1" size={20} />
        <span className="uppercase tracking-wider">Pull</span>
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
