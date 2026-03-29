

import { FileRejection, useDropzone } from 'react-dropzone';
import { FilePlus, X } from 'react-feather';

export default function Dropzone({
  children,
  onFile,
  onError,
  maxSize = Infinity,
  disabled = false,
  maxFiles = 1,
}: {
  children: React.ReactNode;
  onFile: (file: File) => void;
  onError: (error: string) => void;
  maxSize?: number;
  disabled?: boolean;
  maxFiles?: number;
}) {
  const onDrop = (files: File[]) => {
    if (files.length === 0) {
      return;
    }
    if (files.length > 1) {
      onError(`Only a single file is supported. Recieved ${files.length}`);
      return;
    }
    const [file] = files;
    onFile(file);
  };
  const onDropRejected = (rejections: FileRejection[]) => {
    if (rejections.length === 0) {
      return;
    }
    if (rejections.length > 1) {
      onError(`Only a single file is supported. Recieved ${rejections.length}`);
      return;
    }
    const [rejection] = rejections;
    const error = rejection.errors.map((e) => e.message).join('; ');
    onError(error);
  };

  const {
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({
    onDrop,
    maxSize,
    multiple: maxFiles > 1,
    disabled,
    maxFiles,
    onDropRejected,
  });

  const getContent = () => {
    if (isDragActive) {
      return (
        <div className="grow justify-center items-center flex flex-col text-green text-base">
          <FilePlus size={48} className="mb-2" />
          Drop File
        </div>
      );
    }
    return (
      <div className="grow justify-center items-center flex">
        {children}
      </div>
    );
  };
  if (disabled) {
    return (
      <div
        {...getRootProps()}
        className="glass w-full border-dashed border border-white/10 h-full flex-col flex rounded-2xl opacity-50"
      >
        <input {...getInputProps()} />
        <div className="flex grow justify-center items-center">
          <div className="relative">
            <FilePlus className="text-white/30" size={48} />
            <X className="absolute -inset-8 text-red/50" size={120} strokeWidth={1} />
          </div>
        </div>
        <div className="text-center text-white/30 text-xs py-2">
          Drag and drop is disabled.
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className="glass-card w-full border border-dashed border-white/10 hover:border-white/20 h-full flex-col flex rounded-2xl cursor-pointer transition-all duration-300"
    >
      <input {...getInputProps()} />
      {getContent()}
      <div className="text-center text-white/25 text-xs py-2">
        Drag and drop your file here or click to select.
      </div>
    </div>
  );
}
