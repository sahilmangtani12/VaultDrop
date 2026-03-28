
import { Folder, Users } from "react-feather";
import useFiles from "@/lib/hooks/files";
import { InodeType } from "@/lib/api/types";
import useSession from "@/Session";

export default function SharedDirectory() {
  const { user } = useSession();

  const parents = useFiles((state) => state.parents);
  const shared = useFiles((state) => state.shared);
  const cwd = useFiles((state) => state.cwd);
  const cwdNode = parents[0];
  if (!cwd || cwdNode.type !== InodeType.HOME
    || cwdNode.name !== user?.email
  ) {
    return null;
  }


  return (
    <div
      onDoubleClick={() => void shared().catch(console.error)}
      className="w-32 flex h-fit flex-col rounded-xl text-white/50 items-center hover:bg-white/[0.06] cursor-pointer select-none transition-colors duration-200">
      <div className="m-1 rounded-lg" >
        <div className="relative">
          <Folder size={85} strokeWidth={0.5} className="fill-white/10 text-white/30" />
          <Users size={40} strokeWidth={2} className="absolute bottom-5 left-6 text-white/40" />
        </div>
      </div>
      <div className="max-w-full px-1 text-xs rounded-sm">
        Shared with Me
      </div>
    </div>
  );

}
