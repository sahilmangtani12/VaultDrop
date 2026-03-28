
import api from "@/lib/api";
import { FileKeys, InodeMembers, InodeType } from "@/lib/api/types";
import { useState, useEffect, useMemo } from "react";
import { Bytes, LocalDate } from "@/util";
import ListItem from "./ListItem";
import Icon from "../inode/Icon";
import FileName from "../inode/Filename";

const getKind = (type: number) => {
  switch (type) {
    case InodeType.DIRECTORY:
      return "Folder";
    case InodeType.FILE:
      return "File";
    case InodeType.TRASH:
      return "Bin";
    case InodeType.UPLOAD:
      return "Upload";
    default:
      return "Unknown";
  }
};


function FileInfo({ inode }: { inode: InodeMembers }) {
  const { data } = inode;
  if (!data) {
    return null;
  }
  const size = parseInt(data.size as string, 10);
  const { uid, fileName, filePath } = data;

  return (
    <>
      <ListItem label="Size">
        <Bytes value={size} />
        {' '}
        (
        <Bytes binary value={size} />
        )
      </ListItem>
      <ListItem label="Storage ID">
        <span className="font-mono text-xs text-white/40">
          {uid}
        </span>
      </ListItem>

      <ListItem hidden={fileName === inode.name} label="Original Name">
        <FileName fileName={fileName} />
      </ListItem>
      <ListItem hidden={!filePath} label="Original Path">
        <FileName fileName={filePath ?? ""} />
      </ListItem>
    </>
  )

}




export default function InodeInfo({ inode }: { inode: InodeMembers }) {
  const [files, setFiles] = useState<FileKeys[]>([]);
  const { name, type, mnemonic } = inode;
  const isDir = type === InodeType.DIRECTORY || type === InodeType.TRASH;

  useEffect(() => {
    const list = async () => {
      if (!isDir) {
        return;
      }
      const { data } = await api.fs.listFiles(inode.mnemonic);
      if (!data) {
        return;
      }
      setFiles(data);
    };
    list().catch(console.error);
  }, [inode, isDir]);


  const totalSize = useMemo(() => {
    return files.reduce((acc, file) => acc + parseInt(file.data.size as string, 10), 0);
  }, [files]);


  return (
    <div className="px-3">
      <dl className="divide-y divide-white/[0.04]">
        <div className="grid gap-4 grid-cols-3 py-2 items-center">
          <dt
            className="text-sm font-medium leading-6 flex justify-center"
          >
            <Icon inode={inode} />
          </dt>
          <dd className="col-span-2 leading-6">
            <h3 className="text-sm font-semibold leading-6 text-white/70">
              {getKind(type)}
            </h3>
            <FileName fileName={name} />
          </dd>
        </div>
        <ListItem label="ID">
          <span className="font-mono text-xs text-white/40">
            {mnemonic}
          </span>
        </ListItem>


        <ListItem hidden={!isDir} label="Files">
          {files.length}
        </ListItem>
        <ListItem hidden={!isDir} label="Total Size">
          <Bytes value={totalSize} />
          {' '}
          (
          <Bytes binary value={totalSize} />
          )
        </ListItem>
        <FileInfo inode={inode} />
        <ListItem label="Created">
          <span className="text-xs text-white/40">
            <LocalDate showTime value={inode.createdAt} />
          </span>
        </ListItem>
        <ListItem label="Last Modified">
          <span className="text-xs text-white/40">
            <LocalDate showTime value={inode.updatedAt} />
          </span>
        </ListItem>
      </dl>
    </div>
  );

}
