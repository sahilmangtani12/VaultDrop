'use client';

import { useState } from 'react';

import { Camera, File, Key } from 'react-feather';
import crypto from '@/lib/crypto';
import { Dropzone } from '@/util';
import ErrorDialog from '@/dialog/Error';
import WebcamDialog from '@/dialog/Webcam';
import useSession from '@/Session';

export default function LoadKey() {
  const [error, setError] = useState<string | null>(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const { saveKey } = useSession();


  const onFile = async (file: File) => {
    try {
      const text = await file.text();
      const key = await crypto.privateKey.fromPEM(text);
      await saveKey(key);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.toString());
        return;
      }
      setError('Failed to read private key file');
    }
  };

  const onScan = async (data: string) => {
    try {
      const key = await crypto.privateKey.fromJSON(data);
      await saveKey(key);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.toString());
        return;
      }
      setError('Failed to read private key from QR Code');
    }
  };


  return (
    <div className="py-8">
      <ErrorDialog message={error} onClose={() => setError(null)} />
      <WebcamDialog
        show={showWebcam}
        onSubmit={onScan}
        onError={(e: string) => setError(e)}
        onClose={() => setShowWebcam(false)}
      />
      <h2 className="text-xl font-bold text-white mb-4">
        Load your existing key
      </h2>
      <div className="lg:grid gap-4 grid-cols-2">
        <div className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center text-center min-h-[260px]">
          <img
            src="/images/vaultdrop-qr.svg"
            alt="QR Code"
            width={50}
            height={50}
            className="mb-3 opacity-50 invert"
          />
          <button
            className="glass-strong rounded-xl px-5 py-3 text-white font-medium text-sm inline-flex items-center hover:bg-white/[0.12] transition-all duration-300"
            type="button"
            onClick={() => setShowWebcam(true)}
          >
            <Camera className="mr-2 text-white/60" size={16} />
            Open camera
          </button>
          <p className="pt-4 text-white/30 text-xs leading-relaxed">
            Use your webcam to scan<br />your key from a QR Code
          </p>
        </div>
        <div className="min-h-[260px]">
          <Dropzone
            onFile={onFile}
            onError={(e: string) => setError(e)}
            maxSize={100 * 1024}
          >
            <div className="text-center">
              <div className="py-3 flex justify-center">
                <div className="relative">
                  <File className="text-white/30" size={52} />
                  <Key className="text-white/50 absolute inset-1 m-3 mt-5" strokeWidth={3} size={20} />
                </div>
              </div>
              <button
                type="button"
                className="glass-strong rounded-xl px-5 py-3 text-white font-medium text-sm inline-flex items-center hover:bg-white/[0.12] transition-all duration-300"
              >
                <File className="mr-2 text-white/60" size={16} />
                Open key file...
              </button>
              <p className="pt-3 text-white/30 text-xs">
                This file will <span className="text-white/50 font-medium">not</span> be uploaded.
              </p>
            </div>
          </Dropzone>
        </div>
      </div>
    </div>
  );
}
