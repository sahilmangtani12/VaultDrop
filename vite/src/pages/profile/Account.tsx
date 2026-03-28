import {
  User, Key
} from 'react-feather';
import { LocalDate } from '@/util';

import LocalKey from './LocalKey';
import useSession from '@/Session';
import crypto from '@/lib/crypto';



export default function Account() {
  const { user, isAdmin, token, refreshToken } = useSession();
  if (!user) {
    return null;
  }
  let exp = null;
  if (token) {
    const payload = crypto.jwt.decode(token);
    if (payload && payload.exp) {
      exp = payload.exp * 1000; // Convert to milliseconds
    }
  }

  const {
    sub, email, scope,
  } = user;
  const scopes = scope.split(' ');

  return (
    <div className="space-y-3">
      <div className="glass rounded-xl p-4 flex flex-row flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center text-white/80 font-semibold text-sm">
          <User className="text-white/40 mr-2.5" size={18} />
          Account
        </div>
        <div className="text-sm">
          <a className="text-white/70 hover:text-white/90 transition-colors" href={`mailto:${email}`}>
            {email}
          </a>
          <span className="text-white/20 px-2 text-xs">
            (id: {sub})
          </span>
        </div>
        <div className="px-2.5 py-0.5 bg-white/[0.08] rounded-full text-white/70 font-semibold text-xs">
          {(isAdmin) ? 'Admin' : 'User'}
        </div>
        <div className="text-xs">
          <span className="text-white/30">Session expires: </span>
          <span className="text-white/50"><LocalDate value={exp} showTime /></span>
        </div>
        <button
          type="button"
          onClick={() => { refreshToken(); }}
          className="glass rounded-lg px-3 py-1.5 text-white/70 text-xs font-medium hover:bg-white/[0.08] transition-all duration-200"
        >
          Refresh Token
        </button>
        <div className="text-xs text-white/30">
          Scopes:
          {scopes.map((s) => (
            <span
              key={s}
              className="bg-white/[0.04] border border-white/[0.06] text-white/40 font-mono rounded-full px-2 py-0.5 mx-1 text-[10px]"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="glass rounded-xl p-4 flex flex-row flex-wrap items-center gap-3">
        <div className="inline-flex items-center text-white/80 font-semibold text-sm">
          <Key className="text-white/40 mr-2.5" size={18} />
          RSA Private Key
        </div>
        <LocalKey />
      </div>
    </div>
  );
}
