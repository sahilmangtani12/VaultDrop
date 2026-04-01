import { DialogPanel, DialogTitle } from '@headlessui/react';
import { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import { Spinner } from '@/util';
import { X, Maximize } from 'react-feather';
import { DialogTransition } from './Transition';

const calculateScanRegion = (video: HTMLVideoElement) => {
  const smallestDimension = Math.min(video.videoWidth, video.videoHeight);
  const scanRegionSize = Math.round((3 / 4) * smallestDimension);
  return {
    x: Math.round((video.videoWidth - scanRegionSize) / 2),
    y: Math.round((video.videoHeight - scanRegionSize) / 2),
    width: scanRegionSize,
    height: scanRegionSize,
  };
};

export default function WebcamDialog({
  show,
  onSubmit,
  onError,
  onClose,
}: {
  show: boolean;
  onSubmit: (data: string) => void;
  onError: (error: string) => void;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let scanner: QrScanner | null = null;
    if (!show || !videoRef.current || !overlayRef.current) {
      return;
    }

    scanner = new QrScanner(
      videoRef.current,
      (result: QrScanner.ScanResult) => {
        onSubmit(result.data);
        onClose();
      },
      {
        returnDetailedScanResult: true,
        preferredCamera: 'environment',
        calculateScanRegion,
        maxScansPerSecond: 5,
        overlay: overlayRef.current,
        highlightScanRegion: true,
      }
    );

    const startScanner = async () => {
      try {
        setErrorMsg(null);
        setLoading(true);
        await scanner.start();
        setLoading(false);
      } catch (e) {
        setLoading(false);
        const msg = (e instanceof Error) ? e.message : 'Failed to start camera';
        setErrorMsg(msg);
        onError(msg);
      }
    };

    void startScanner();

    return () => {
      if (scanner) {
        scanner.destroy();
      }
    };
  }, [show]);

  return (
    <DialogTransition show={show} onClose={onClose}>
      <DialogPanel className="w-full max-w-lg p-0 overflow-hidden text-left align-middle glass-strong shadow-2xl transform rounded-[2rem] transition-all border border-white/10">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div>
            <DialogTitle as="h2" className="text-2xl font-black text-white tracking-tight">
              Scan QR Code
            </DialogTitle>
            <p className="text-sm text-white/40 mt-1">Position the code within the frame</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/5 text-white/20 hover:text-white transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="relative aspect-square w-full bg-black overflow-hidden flex items-center justify-center">
          {/* Main Video feed */}
          <video
            ref={videoRef}
            className="w-full h-full object-cover grayscale-[0.3] contrast-[1.1]"
            playsInline
            muted
          />

          {/* Scanning Overlay Framework */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* The actual scan guide frame */}
            <div
              ref={overlayRef}
              className="w-3/4 aspect-square rounded-2xl border-2 border-primary/50 relative shadow-[0_0_50px_rgba(79,70,229,0.2)]"
            >
              {/* Corner Accents */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-lg" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-lg" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-lg" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-lg" />
              
              {/* Scanning Beam Animation */}
              <div className="absolute left-0 right-0 h-0.5 bg-primary/40 shadow-[0_0_15px_rgba(79,70,229,0.8)] animate-pulse top-1/2" />
            </div>
            
            {/* Vignette effect outside the scan region */}
            <div className="absolute inset-0 bg-black/40 ring-inset ring-[60px] ring-black/40" />
          </div>

          {/* Loading/Error Backdrop */}
          {(loading || errorMsg) && (
            <div className="absolute inset-0 backdrop-blur-md bg-black/60 flex flex-col items-center justify-center gap-4 text-center p-8">
              {loading ? (
                <>
                  <Spinner loading={true} />
                  <span className="text-white/40 font-mono text-xs uppercase tracking-widest">Initializing Camera...</span>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-3xl bg-red-500/20 flex items-center justify-center text-red-500 mb-2">
                    <X size={32} />
                  </div>
                  <h3 className="text-white font-bold">Scanning Error</h3>
                  <p className="text-sm text-white/40 max-w-[200px]">{errorMsg}</p>
                  <button 
                    onClick={onClose}
                    className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm transition-all"
                  >
                    Go Back
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="p-8 bg-white/[0.02] flex items-center gap-4">
           <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
              <Maximize size={16} className="text-white/40" />
           </div>
           <p className="text-xs text-white/30 leading-relaxed">
             This secure scanner is powered by **WebCrypto**. Your keys never leave your device, even during scanning.
           </p>
        </div>
      </DialogPanel>
    </DialogTransition>
  );
}
