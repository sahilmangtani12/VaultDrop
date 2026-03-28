import api from "@/lib/api";
import { FileData, IntegrityCheckResult } from "@/lib/api/types";
import useSession from "@/Session";
import { Bytes } from "@/util";
import { useCallback, useEffect, useState } from "react";
import { Trash2 } from "react-feather";



function OrphanedFile({ data, onRemove }: {
  data: FileData,
  onRemove: (uid: string) => void
}
) {
  const { uid, hash, size, fileName } = data;
  const s = parseInt(size as string, 10);

  return (
    <div key={uid} className="glass rounded-lg p-2 text-xs">
      <div className="flex justify-between items-center gap-2">
        <span className="font-semibold text-white/70">{fileName}</span>
        <Bytes value={s} />
        <button
          type="button"
          onClick={() => onRemove(uid)}
          className="bg-red/10 hover:bg-red/20 text-red px-2 py-1 rounded text-[10px] transition-colors"
        >
          <Trash2 size={12} />
        </button>
      </div>
      <div className="text-white/20">
        <span className="font-mono text-[10px]">{hash}</span>
      </div>
    </div>
  )
}


function Integrity({ data }: { data: IntegrityCheckResult | null }) {
  if (!data) {
    return <div className="text-white/30 text-sm">Loading...</div>;
  }
  const { missing, unknown } = data;
  if (missing.length === 0 && unknown.length === 0) {
    return <div className="text-green font-semibold text-sm">All files are consistent.</div>;
  }
  if (missing.length > 0) {
    return (
      <div className="bg-red/10 border border-red/20 p-3 rounded-xl text-xs">
        <h4 className="font-bold text-sm text-red mb-1">Missing Files</h4>
        <p className="text-white/40 mb-2">The following files are referenced by inodes but missing from storage:</p>
        <ul className="list-none flex gap-2 flex-wrap text-white/60">
          {missing.map((m) => (
            <li className="font-mono bg-white/[0.04] px-2 py-0.5 rounded" key={m}>{m}</li>
          ))}
        </ul>
        <p className="font-bold text-red text-center text-sm mt-3">
          THIS IS A SERIOUS ISSUE AND SHOULD BE INVESTIGATED IMMEDIATELY.
        </p>
      </div>
    );
  }
  if (unknown.length > 0) {
    return (
      <div className="bg-orange/10 border border-orange/20 p-3 rounded-xl text-xs">
        <h4 className="font-bold text-sm text-orange mb-1">Unknown Buckets</h4>
        <p className="text-white/40 mb-2">The following buckets exist but are not referenced by any file data:</p>
        <ul className="list-none flex gap-2 flex-wrap text-white/60">
          {unknown.map((u) => (
            <li className="font-mono bg-white/[0.04] px-2 py-0.5 rounded" key={u}>{u}</li>
          ))}
        </ul>
        <p className="text-white/30 mt-2">These can be safely deleted from the storage backend.</p>
      </div>
    );
  }



  return (
    "OK"
  );

}



export default function FileData() {
  const { isAdmin } = useSession();
  const [orphans, setOrphans] = useState<FileData[]>([]);
  const [integrity, setIntegrity] = useState<IntegrityCheckResult | null>(null);

  const fetchOrphans = useCallback(async () => {
    if (!isAdmin) {
      return;
    }
    const { data, error } = await api.filedata.orphaned();
    if (error) {
      console.error(error);
      return;
    }
    setOrphans(data);
  }, [isAdmin]);

  const checkIntegrity = useCallback(async () => {
    if (!isAdmin) {
      return;
    }
    const { data, error } = await api.filedata.checkIntegrity();
    if (error) {
      console.error(error);
      return;
    }
    setIntegrity(data);
  }, [isAdmin]);

  const removeOrphan = useCallback(async (uid: string) => {
    const { error } = await api.filedata.remove(uid);
    if (error) {
      console.error(error);
      return;
    }
    fetchOrphans();
  }, [fetchOrphans]);

  const removeAllOrphans = useCallback(async () => {
    for (let i = 0; i < orphans.length; i += 1) {
      await removeOrphan(orphans[i].uid);
      if (i % 10 === 0) {
        await fetchOrphans();
      }
    }
    fetchOrphans();
  }, [orphans, removeOrphan, fetchOrphans]);


  useEffect(() => {
    fetchOrphans();
    checkIntegrity();
  }, [fetchOrphans, checkIntegrity]);

  if (!isAdmin) {
    return null;
  }


  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-sm font-semibold text-white/80">Orphaned Files</h3>
          <button
            type="button"
            onClick={removeAllOrphans}
            className="bg-red/10 hover:bg-red/20 text-red px-2 py-1 rounded text-[10px] font-medium transition-colors"
          >
            Remove All
          </button>
        </div>
        <p className="text-white/25 text-xs mb-3">These files are not linked to any inode and can be safely deleted.</p>
        <div className="flex flex-wrap gap-2">
          {orphans.map((o) => (
            <OrphanedFile key={o.uid} data={o} onRemove={removeOrphan} />
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-white/80 mb-2">Integrity Check</h3>
        <Integrity data={integrity} />
      </div>
    </div>
  );
}
