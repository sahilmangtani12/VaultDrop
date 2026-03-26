
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';

import { FilePlus } from 'react-feather';
import { useDropzone } from 'react-dropzone';
import useTransfers from "@/lib/hooks/transfers";

export default function UploadDialog({ show, cwd, onClose }:
  { show: boolean, cwd: string | null, onClose: () => void }) {

  const upload = useTransfers((state) => state.upload);


  const onFiles = (files: File[]) => {
    if (!cwd) {
      console.error("No current working directory");
      return;
    }
    files.forEach((file) => {
      upload({ file, directory: cwd });
    });
    onClose();
  }



  const {
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({
    onDrop: onFiles,
    multiple: true,
  });




  const getIcon = () => {
    if (isDragActive) {
      return <FilePlus size={64} className="text-green" />;
    }
    return <FilePlus size={64} className="text-white/40" />;
  };


  return (
    <Dialog
      open={show}
      onClose={onClose}
      transition
      className="fixed inset-0 z-[100] flex w-screen items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition duration-300 ease-out data-closed:opacity-0"
    >
      <DialogPanel
        className="w-full max-w-4xl p-6 overflow-hidden text-left glass-strong rounded-2xl"
      >
        <DialogTitle
          as="h2"
          className="text-xl font-bold text-white/90 leading-6 mb-4"
        >
          Upload a File
        </DialogTitle>
        <div>
          <div {...getRootProps()} className="glass rounded-2xl p-6 cursor-pointer hover:bg-white/[0.08] transition-all duration-300">
            <input {...getInputProps()} />
            <div className="flex justify-center mt-6">
              {getIcon()}
            </div>
            <div className="py-4 flex justify-center">
              <button
                type="button"
                className="glass-strong rounded-xl px-6 py-3 text-white font-medium text-sm hover:bg-white/[0.12] transition-all duration-300"
              >
                Select files to upload
              </button>
            </div>
            <div className="text-center text-white/25 text-xs">
              Drag and drop your files here or click to select.
            </div>
          </div>
        </div>
        <div className="text-end mt-4">
          <button
            type="button"
            className="glass rounded-xl px-4 py-2 text-white/60 text-sm font-medium hover:bg-white/[0.08] transition-all duration-200"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </DialogPanel>
    </Dialog>
  );
}
