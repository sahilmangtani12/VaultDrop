import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react";
import { useState } from "react";
import { ChevronsDown, User, UserPlus } from "react-feather";
import useFinder from "../Context";
import { InodeMembers, UserResponse } from "@/lib/api/types";

export default function AddMember(
  { hidden,
    inode
  }: {
    inode: InodeMembers,
    hidden?: boolean
  }
) {

  const [selected, setSelected] = useState<UserResponse | null>(null);
  const [query, setQuery] = useState('');
  const { members, mnemonic } = inode;
  const memberIds = new Set(members.map((member) => member.sub));

  const q = query.toLowerCase().replace(/\s/g, '');

  const { users, addMember } = useFinder();



  const addable = Object.values(users ?? {})
    .filter((user) => user.keys.find((k) => k.enabled))
    .filter((user) => !memberIds.has(user.sub))
    .filter((user) => {
      const e = user.email.toLowerCase().replace(/\s/g, '');
      const s = user.sub.toLowerCase().replace(/\s/g, '');
      return !q.length || e.includes(q) || s.includes(q);
    });
  const display = (o: UserResponse | null) => {
    if (!o) {
      return '';
    }
    return `${o.email}`;
  }


  if (hidden) {
    return null;
  }
  return (
    <div className="flex items-center mt-2">
      <Combobox value={selected} onChange={setSelected}>
        <div className="grow flex my-1 glass rounded-xl overflow-hidden">
          <ComboboxInput
            className="w-full pl-3 py-1.5 bg-transparent text-white/70 text-xs focus:outline-none placeholder-white/20"
            displayValue={display}
            onChange={(e) => setQuery(e.target.value)}
          />
          <ComboboxButton className="px-2 py-1">
            <ChevronsDown size={16} className="text-white/30" aria-hidden="true" />
          </ComboboxButton>
        </div>
        <ComboboxOptions
          transition
          anchor="bottom"
          className="divide-y divide-white/[0.04] glass-strong rounded-xl mt-1 z-[90] min-w-[200px]"
        >
          {addable.map((user) => (
            <ComboboxOption
              value={user}
              className={({ active }) => `py-2 px-3 text-xs cursor-pointer ${active ? 'bg-white/[0.08]' : ''}`}
              key={user.sub}
            >
              <User className="inline-block text-white/40 mr-1" size={12} />
              <span className="text-white/70 font-medium">
                {user.email}
              </span>
              <span className="text-white/20 px-2 text-[10px]">
                (id:
                {' '}
                {user.sub}
                )
              </span>
            </ComboboxOption>
          ))}
        </ComboboxOptions>
      </Combobox>
      <div className="pl-2">
        <button
          type="button"
          disabled={!selected}
          className="whitespace-nowrap glass-strong py-1.5 px-3 text-white/80 text-xs font-medium rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/[0.12] transition-all duration-200"
          onClick={() => {
            addMember(mnemonic, selected!.sub)
            setSelected(null);
          }}
        >
          <UserPlus className="inline-block mr-1.5" size={14} />
          Add
        </button>
      </div>
    </div >
  );
}
