import { InodeMembers } from "@/lib/api/types";

import Icon from "./Icon";
import FileName from "./Filename";

export default function Node({
  inode,
  selected,
}: {
  inode: InodeMembers,
  selected?: boolean,
}) {
  return (
    <div
      className="flex h-fit flex-col rounded-xl text-white/60 items-center">
      <div className={`m-1 rounded-lg ${(selected) ? "bg-white/[0.08]" : ""}`}>
        <Icon inode={inode} />
      </div>
      <div className={`max-w-full px-1 rounded ${(selected) ? "text-white bg-white/[0.15]" : ""}`}>
        <FileName fileName={inode.name} />
      </div>
    </div>
  );

}
