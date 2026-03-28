import { InodeMembers, Member, Permission } from "@/lib/api/types";
import useFinder from "../Context";
import { Folder, Trash2, User } from "react-feather";
import { Switch } from "@/util";

const getPermission = (permission: number) => {
  switch (permission) {
    case Permission.READ:
      return "Read";
    case Permission.WRITE:
      return "Read & Write";
    default:
      return "None";
  }
}



export default function MemberItem({
  inode,
  member,
  readOnly,
  isParent,
}: {
  inode: InodeMembers,
  member: Member,
  readOnly: boolean,
  isParent: boolean,
}) {
  const { users, setAccess } = useFinder();
  if (!users || !users[member.sub]) {
    return null;
  }

  const { email } = users[member.sub];
  const enabled = member.permission === Permission.WRITE;

  const toggle = async () => {
    if (readOnly || isParent) {
      return;
    }
    if (member.permission === Permission.WRITE) {
      await setAccess(inode.mnemonic, member.sub, Permission.READ);
    }
    if (member.permission === Permission.READ) {
      await setAccess(inode.mnemonic, member.sub, Permission.WRITE);
    }
  }

  const remove = async () => {
    if (readOnly || isParent) {
      return;
    }
    await setAccess(inode.mnemonic, member.sub, Permission.NONE);
  }




  const getEdit = () => {
    if (readOnly || isParent) {
      return <div className="text-white/25 whitespace-nowrap text-[10px]">
        {getPermission(member.permission)}
      </div>;
    }
    return (
      <div className="flex shrink-0 items-center gap-1.5">
        <div className="flex flex-col items-center">
          <Switch enabled={enabled} onChange={toggle} />
          <div className="text-white/25 text-[10px] whitespace-nowrap pt-0.5">
            Can edit
          </div>
        </div>
        <button
          type="button"
          onClick={remove}
          aria-label="Delete Member"
          className="bg-red/10 text-red px-1.5 py-1 rounded-lg hover:bg-red/20 transition-colors duration-200"
        >
          <Trash2 size={14} />
        </button>
      </div>
    );
  }

  const getParent = () => {
    if (!isParent) {
      return (
        <div className="flex items-center text-[10px] text-white/20">
          direct access
        </div>
      )
    }
    return (
      <div className="flex items-center text-[10px] text-white/20">
        from
        <Folder size={12} className="fill-white/10 mx-1 text-white/30" />
        {inode.name}
      </div>
    );
  };


  return (
    <div className={`flex items-center px-2.5 py-1.5 space-x-2 text-xs ${(isParent) ? "bg-white/[0.02]" : ""}`}>
      <div className="pr-1 shrink-0 text-white/30">
        <User size={14} />
      </div>
      <div className="font-medium grow">
        <a href={`mailto:${email}`} className="text-white/60 hover:text-white/80 text-xs transition-colors">
          {email}
        </a>
        {getParent()}
      </div>
      {getEdit()}
    </div>
  );

}
