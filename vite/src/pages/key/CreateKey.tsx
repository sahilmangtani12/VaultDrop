'use client';

import { useState } from 'react';
import { Cpu, File, Lock } from 'react-feather';
import api from '@/lib/api';
import { Dropzone } from '@/util';
import crypto from '@/lib/crypto';
import ErrorDialog from '@/dialog/Error';
import CreateKeyDialog from '@/dialog/CreateKey';
import useSession from '@/Session';


export default function CreateKey() {
  const { user, update } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [showGenerate, setShowGenerate] = useState(false);

  if (!user) {
    return null;
  }


  const uploadKey = async (publicKey: JsonWebKey) => {
    await api.user.addKey({
      sub: user.sub,
      data: { ...publicKey },
      isRootKey: false,
    });
    await update();
  };

  const onFile = async (file: File) => {
    try {
      const text = await file.text();
      const publicKey = await crypto.publicKey.fromFile(text);
      const jwk = await crypto.publicKey.toJWK(publicKey);
      await uploadKey(jwk);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.toString());
        return;
      }
      setError('Failed to read public key file');
    }
  };

  return (
    <div className="w-full">
      <ErrorDialog message={error} onClose={() => setError(null)} />
      <CreateKeyDialog
        show={showGenerate}
        onClose={() => setShowGenerate(false)}
        onSubmit={(k) => void uploadKey(k)} />
      <h2 className="text-xl font-bold text-white mb-4">
        Add a new keypair
      </h2>
      <div className="lg:grid gap-4 grid-cols-2">
        <div className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center text-center min-h-[260px]">
          <button
            className="glass-strong rounded-xl px-6 py-3 text-white font-medium text-sm inline-flex items-center hover:bg-white/[0.12] transition-all duration-300"
            type="button"
            onClick={() => setShowGenerate(true)}
          >
            <Cpu className="mr-2.5 text-white/60" size={18} />
            Generate a keypair
          </button>
          <p className="pt-4 text-white/30 text-xs leading-relaxed">
            Securely generate your<br />crypto keys in the browser
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
                  <Lock className="text-white/50 absolute inset-1 m-3 mt-5" strokeWidth={3} size={20} />
                </div>
              </div>
              <button
                type="button"
                className="glass-strong rounded-xl px-5 py-3 text-white font-medium text-sm inline-flex items-center hover:bg-white/[0.12] transition-all duration-300"
              >
                <File className="mr-2 text-white/60" size={16} />
                Open public key file...
              </button>
              <p className="pt-3 text-white/30 text-xs">
                Add your own public key
              </p>
            </div>
          </Dropzone>
        </div>
      </div>
    </div>
  );
}
