
import {
  Trash2, Terminal,
} from 'react-feather';
import { LocalDate } from '@/util';
import { TokenResponse } from '@/lib/api/types';


export default function Token({ data, onRemove }: { data: TokenResponse, onRemove: () => void }) {
  const {
    value, exp, scopes, expired
  } = data;

  const getExpired = () => {
    if (!exp) {
      return null;
    }
    if (expired) {
      return (
        <span className="bg-red/20 text-red rounded-full px-2 py-0.5 text-xs font-semibold">
          Expired {expired}
        </span>
      );
    }
    return (
      <span className="text-xs text-white/30">
        Expires: <LocalDate value={exp} />
      </span>

    );
  };

  return (
    <div className="glass rounded-xl p-3 mb-2 flex flex-wrap items-center gap-3">
      <div className="inline-flex items-center text-white/80 font-semibold text-sm">
        <Terminal className="text-white/40 mr-2" size={16} />
        API Token
      </div>
      <div className="font-mono text-xs text-white/40 grow whitespace-nowrap">
        {value}
      </div>
      <div>
        {getExpired()}
      </div>
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
      <div className="grow flex justify-end">
        <button
          type="button"
          className="px-2.5 py-1.5 bg-red/10 hover:bg-red/20 text-red rounded-lg inline-flex items-center text-xs font-medium transition-colors duration-200"
          onClick={onRemove}
        >
          Delete
          <Trash2 className="ml-1.5" size={14} />
        </button>
      </div>
    </div>
  );
}
