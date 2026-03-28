import { Scope, UserResponse } from "@/lib/api/types";
import { LocalDate } from "@/util";
import { Switch } from "@/util";
import { Trash2, User } from "react-feather";


export default function UserElem({ user, isAdmin, onRemove, onChange }: {
  user: UserResponse,
  isAdmin: boolean,
  onRemove: (sub: string) => void
  onChange: (sub: string, admin: boolean) => void
}) {

  if (!isAdmin) {
    return null;
  }
  const { sub, email, lastAuthAt } = user;
  const hasAdmin = user.scope.includes(Scope.ADMIN);

  const getState = () => {
    if (hasAdmin) {
      return <div className="px-2 font-semibold text-green text-xs">Admin</div>;
    }
    return <div className="px-2 font-semibold text-white/30 text-xs">User</div>;

  };

  return (
    <div className="glass rounded-xl p-3 mb-2 flex items-center justify-between flex-wrap gap-3">
      <div className="inline-flex items-center text-white/80 font-semibold text-sm">
        <User className="text-white/40 mr-2" size={16} />
        Account
      </div>
      <div className="text-sm">
        <a className="text-white/60 hover:text-white/80 font-medium transition-colors" href={`mailto:${email}`}>
          {email}
        </a>
        <span className="text-white/20 px-2 text-xs">
          (id: {sub})
        </span>
      </div>
      <div className="text-white/25 text-xs">
        last auth: <LocalDate value={lastAuthAt} showTime />
      </div>
      <div className="flex flex-row items-center grow justify-end gap-2">
        <div className="flex flex-row items-center">
          <Switch enabled={hasAdmin} onChange={() => onChange(sub, !hasAdmin)} />
        </div>
        {getState()}
      </div>
      <div>
        <button
          type="button"
          onClick={() => onRemove(sub)}
          className="px-2.5 py-1.5 bg-red/10 hover:bg-red/20 text-red rounded-lg inline-flex items-center text-xs font-medium transition-colors duration-200"
        >
          <Trash2 className="mr-1" size={14} />
          Delete
        </button>
      </div>
    </div>
  );

}
