"use client";

import { useState } from "react";

import { UploadCloud } from "react-feather";
import UploadDialog from "@/dialog/Upload";
import useFiles from "@/lib/hooks/files";

export default function Upload() {
  const cwd = useFiles((state) => state.cwd);

  const [showUpload, setShowUpload] = useState<boolean>(false);
  const onCloseUpload = () => setShowUpload(false);



  return (
    <>
      <UploadDialog cwd={cwd} show={showUpload} onClose={onCloseUpload} />
      <button
        type="button"
        disabled={!cwd}
        aria-label="Upload"
        className="group relative overflow-hidden rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 px-5 py-2.5 inline-flex items-center text-white text-sm font-semibold shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
        onClick={() => setShowUpload(true)}
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
        <UploadCloud className="mr-2 relative z-10" size={18} />
        <span className="relative z-10">Upload</span>
      </button>
    </>
  );
}
