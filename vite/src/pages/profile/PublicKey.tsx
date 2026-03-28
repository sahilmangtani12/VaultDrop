import { Trash2, Key } from 'react-feather';
import { Switch, LocalDate } from '@/util';

import type { PublicKey, UserResponse } from '@/lib/api/types';


export default function PublicKey({ publicKey, user, isAdmin, show, onRemove, onEnable }:
  {
    user: UserResponse,
    publicKey: PublicKey,
    show: boolean,
    isAdmin: boolean,
    onRemove: (hash: string) => void,
    onEnable: (enabled: boolean) => void
  }
) {
  const { sub, email } = user;
  const { hash, enabled, createdAt, isRootKey } = publicKey;
  const isEnabled = !!enabled || isRootKey;

  if (!show) {
    return null;
  }

  const getState = () => {
    if (isEnabled || isRootKey) {
      return <div className="px-2 font-semibold text-green text-xs">Active</div>;
    }
    return <div className="px-2 font-semibold text-white/30 text-xs">Disabled</div>;
  };

  const getIcon = () => {
    if (isRootKey) {
      return (
        <div className="inline-flex px-2.5 py-1 bg-white/[0.08] shrink-0 items-center text-white/80 rounded-full font-semibold text-xs">
          <Key className="mr-1.5" size={14} strokeWidth={3} />
          Root Key
        </div>
      );
    }
    return (
      <div className="inline-flex px-2.5 py-1 shrink-0 items-center text-white/50 font-semibold text-xs">
        <Key className="mr-1.5" size={14} strokeWidth={3} />
        Public Key
      </div>
    );
  };

  return (
    <div className="glass rounded-xl p-3 mb-2 flex items-center flex-wrap gap-3 text-xs">
      {getIcon()}
      <div>
        <a className="text-white/60 hover:text-white/80 font-medium transition-colors" href={`mailto:${email}`}>
          {email}
        </a>
      </div>
      <div className="text-white/20">
        (id: {sub})
      </div>
      <div className="text-white/20">
        <LocalDate value={createdAt} />
      </div>
      <div className="text-white/15 break-words font-mono text-[10px]">{hash}</div>
      <div className="flex flex-row items-center grow justify-end gap-2">
        <div className="flex flex-row items-center">
          <Switch show={isAdmin && !isRootKey} enabled={enabled !== null} onChange={() => onEnable(!isEnabled)} />
        </div>
        {getState()}
        <button
          type="button"
          hidden={!isAdmin}
          className="px-2 py-1.5 bg-red/10 hover:bg-red/20 text-red rounded-lg inline-flex items-center text-xs font-medium transition-colors duration-200"
          onClick={() => onRemove(hash)}
        >
          <Trash2 size={12} className="mr-1" />
          Delete
        </button>
      </div>
    </div>
  );
}
