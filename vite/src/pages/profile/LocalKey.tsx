'use client';


import useSession from '@/Session';
import crypto from '@/lib/crypto';
import { useEffect, useState } from 'react';
import {
  Key, XCircle,
} from 'react-feather';
import { Link } from 'react-router';

export default function LocalKey() {
  const { key, status, dropKey } = useSession();

  const [hash, setHash] = useState<string | null>(null);

  useEffect(() => {
    if (!key) {
      setHash(null);
      return;
    }
    crypto.privateKey.toHash(key)
      .then(setHash)
      .catch(console.error);
  }, [key]);




  if (status === 'loading') {
    return null;
  }

  if (status === "registered_without_key") {
    return (
      <div className="flex grow flex-row flex-wrap items-center gap-2">
        <div className="bg-red/20 text-red font-semibold rounded-full px-2.5 py-0.5 text-xs">
          {status}
        </div>
        <div className="text-sm text-white/50 inline-flex items-center">
          Go to the
          <Link
            className="text-white/70 hover:text-white/90 inline-flex items-center mx-1.5 transition-colors"
            to="/key"
          >
            <Key className="mr-1" size={14} />
            Key page
          </Link>
          to create a new key.
        </div>
      </div>
    );
  }

  if (status === 'registered') {
    return (
      <div className="flex grow flex-row flex-wrap items-center gap-2">
        <div className="bg-white/[0.06] text-white/40 font-semibold rounded-full px-2.5 py-0.5 text-xs">
          not loaded
        </div>
        <div className="text-sm text-white/50 inline-flex items-center">
          Go to the
          <Link
            className="text-white/70 hover:text-white/90 inline-flex items-center mx-1.5 transition-colors"
            to="/key"
          >
            <Key className="mr-1" size={14} />
            Key page
          </Link>
          to load a private key.
        </div>
      </div>
    );
  }
  if (status === 'registered_key_disabled') {
    return (
      <div className="flex grow flex-row flex-wrap items-center gap-2">
        <div className="bg-red/20 text-red font-semibold rounded-full px-2.5 py-0.5 text-xs">
          disabled
        </div>
        <div className="text-sm text-white/50 inline-flex items-center">
          Please contact the
          <Link
            className="text-white/70 hover:text-white/90 inline-flex items-center mx-1.5 transition-colors"
            to="/docs/contact"
          >
            <Key className="mr-1" size={14} />
            admin
          </Link>
          to enable your key.
        </div>
      </div>
    );
  }

  return (
    <div className="flex grow flex-row flex-wrap justify-between items-center gap-2">
      <div className="bg-green/20 text-green font-semibold rounded-full px-2.5 py-0.5 text-xs">
        loaded
      </div>
      <div className="text-xs text-white/50">
        <span>Fingerprint:</span>
        {' '}
        <span className="font-mono text-white/30">{hash}</span>
      </div>
      <div className="text-white/20 text-[10px]">
        Saved in browser local storage
      </div>
      <button
        type="button"
        className="glass rounded-lg px-3 py-1.5 text-white/70 text-xs font-medium hover:bg-white/[0.08] transition-all duration-200 inline-flex items-center"
        onClick={() => dropKey()}
      >
        <XCircle className="mr-1.5" size={14} />
        Unload
      </button>
    </div>
  );
}
