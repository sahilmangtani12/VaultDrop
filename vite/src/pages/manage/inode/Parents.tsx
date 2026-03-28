
import { ChevronRight, Folder } from "react-feather";
import Droppable from "./Droppable";
import useFiles from "@/lib/hooks/files";

export default function Parents() {
  const parents = useFiles((state) => state.parents);
  const list = useFiles((state) => state.list);

  const reverse = [...parents].reverse();

  if (parents.length === 0) {
    return null;
  }

  return (
    <div className="flex justify-start flex-wrap border-t py-1 border-white/[0.06]">
      {reverse.map((inode) => (
        <Droppable id={`parent-${inode.mnemonic}`} key={inode.mnemonic}>
          <div
            className="flex rounded-lg flex-row px-3 text-xs font-semibold text-white/50 items-center hover:bg-white/[0.06] cursor-pointer transition-colors duration-200"
            onClick={() => void list(inode.mnemonic).catch(console.error)}
          >
            <ChevronRight className="mr-2 text-white/20" size={16} strokeWidth={1} />
            <Folder
              className="text-white/30 fill-white/10 mr-1"
              size={16} strokeWidth={1} />
            {inode.name}
          </div>
        </Droppable>
      ))
      }
    </div >
  );
}
