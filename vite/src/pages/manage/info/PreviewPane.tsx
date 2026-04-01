import { useEffect, useState } from "react";
import useTransfers, { Download as DownloadType } from "@/lib/hooks/transfers";
import { InodeMembers } from "@/lib/api/types";
import { Loader } from "react-feather";
import useSession from "@/Session";

export default function PreviewPane({ inode }: { inode: InodeMembers }) {
  const [src, setSrc] = useState<string | null>(null);
  
  const { key: vaultKey } = useSession();
  const transfers = useTransfers((state) => state.transfers);
  const previewAction = useTransfers((state) => state.preview);

  const extension = inode.name.split('.').pop()?.toLowerCase() || '';
  const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(extension);
  const isVideo = ['mp4', 'webm', 'ogg'].includes(extension);
  const isAudio = ['mp3', 'wav', 'm4a'].includes(extension);
  const isPdf = ['pdf'].includes(extension);
  const isText = ['txt', 'csv', 'md', 'json'].includes(extension);

  const isPreviewable = isImage || isVideo || isAudio || isPdf || isText;
  
  const size = inode.data?.size ? parseInt(inode.data.size as string, 10) : 0;
  const isTooLarge = size > 50 * 1024 * 1024; // 50MB restriction

  useEffect(() => {
    if (!isPreviewable || isTooLarge || !vaultKey) return;

    // Check if there is already a completed or active preview download
    const existing = transfers.find(t => t.type === 'download' && t.isPreview && t.mnemonics[0] === inode.mnemonic) as DownloadType | undefined;
    
    if (existing?.status === 'complete' && existing.result) {
       // Convert extracted native File into an ObjectURL for direct media rendering
       const url = URL.createObjectURL(existing.result);
       setSrc(url);
       
       // Force cleanup of the blob when unmounting to preserve RAM
       return () => URL.revokeObjectURL(url);
    }

    if (!existing) {
       // Trigger the silent OPFS extraction background job
       previewAction(inode.mnemonic, vaultKey);
    }
  }, [inode.mnemonic, isPreviewable, isTooLarge, vaultKey, transfers, previewAction]);

  if (!isPreviewable) return null;
  
  if (isTooLarge) {
    return (
       <div className="flex items-center justify-center p-6 glass-strong rounded-xl border border-white/5 text-white/50 text-sm italic text-center mt-6">
         Live Preview unavailable <br/> File is larger than 50MB
       </div>
    );
  }

  if (!src) {
     return (
       <div className="flex flex-col items-center justify-center p-8 glass-strong rounded-xl border border-white/5 mt-6">
          <Loader className="animate-spin text-white/40 mb-3" size={24} />
          <span className="text-white/50 text-xs">Decrypting Preview...</span>
       </div>
     )
  }

  return (
    <div className="mt-6 rounded-xl overflow-hidden glass-strong relative border border-white/10 shrink-0 w-full flex items-center justify-center bg-black/40">
      {isImage && <img src={src} alt={inode.name} className="w-full max-h-64 object-contain" />}
      {isVideo && <video src={src} controls autoPlay muted className="w-full max-h-64" />}
      {isAudio && <audio src={src} controls className="w-full h-12 outline-none" />}
      {(isPdf || isText) && <iframe src={src} className="w-full h-64 bg-white/90" title={inode.name} />}
    </div>
  );
}
