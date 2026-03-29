"use client";

import useTransfers, { Transfer as TransferType } from "@/lib/hooks/transfers";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { ChevronRight } from "react-feather";
import { useEffect, useRef } from "react";
import api from "@/lib/api";
import useFiles from "@/lib/hooks/files";
import transferWorker from "@/lib/transferWorker?worker";


import UploadTransfer from "./Upload";
import DownloadTransfer from "./Download";
import useSession from "@/Session";


function Transfer({ data }: { data: TransferType }) {
  const { type } = data;
  if (type === "upload") {
    return <UploadTransfer data={data} />;
  }
  if (type === "download") {
    return <DownloadTransfer data={data} />;
  }
  return null;
}

export default function Transfers() {
  const { status, token } = useSession();
  const workerRef = useRef<Worker | null>(null);
  const transfers = useTransfers((state) => state.transfers);
  const updateTransfer = useTransfers((state) => state.updateTransfer);
  const addTransfer = useTransfers((state) => state.addTransfer);
  const clearTransfers = useTransfers((state) => state.clearTransfers);
  const list = useFiles((state) => state.list);
  const cwd = useFiles((state) => state.cwd);


  const isActive = (transfer: TransferType) =>
    !["complete", "error", "interrupted"].includes(transfer.status);


  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }
    workerRef.current ??= new transferWorker();
    const worker = workerRef.current;
    worker.onmessage = async (e: MessageEvent<TransferType>) => {
      const transfer = e.data;
      if (!transfer) {
        return;
      }
      updateTransfer(transfer);
      if (transfer.type === "upload" && transfer.requiresList) {
        await list(cwd)
      }
    };
    worker.postMessage(token);
  }, [cwd, list, updateTransfer, status, token]);

  useEffect(() => {
    void (async () => {
      if (status !== "authenticated") {
        return;
      }

      await api.upload.cleanup();
      const { data: incomplete } = await api.upload.unfinished();
      if (!incomplete || incomplete.length === 0) {
        return;
      }
      clearTransfers();
      const newTransfers = incomplete
        .map((inode) => ({
          id: inode.id,
          type: "upload",
          status: "interrupted",
          inode,
        })) as TransferType[];
      newTransfers.forEach(addTransfer);
    })();
  }, [addTransfer, clearTransfers, status]);




  useEffect(() => {
    const worker = workerRef.current;
    const transfer = transfers.find(isActive);
    if (!transfer || !worker) {
      return;
    }
    worker.postMessage(transfer);
  }, [transfers, workerRef]);


  return (
    <div className="fixed bottom-4 right-2 sm:bottom-6 sm:right-6 p-2 w-[calc(100vw-1rem)] sm:w-[480px] z-40" hidden={transfers.length === 0}>
      <Disclosure defaultOpen={true}>
        <DisclosurePanel
          transition
          className="origin-bottom transition duration-200 ease-out data-closed:translate-y-3 data-closed:opacity-0 pb-2"
        >
          <div className="glass-strong rounded-xl p-3">
            {transfers.map((transfer) => (
              <Transfer key={transfer.id} data={transfer} />
            ))}
          </div>
        </DisclosurePanel>
        <div className="flex justify-end relative">
          <DisclosureButton className="group glass-strong inline-flex items-center text-white font-semibold rounded-full px-4 py-2.5 text-sm">
            <ChevronRight size={16} className="group-data-open:-rotate-90 transition-transform duration-200 mr-1" />
            Transfers
            <div className="absolute bg-orange text-white text-[10px] flex justify-center items-center w-5 h-5 rounded-full -top-1 -right-1 font-bold">
              {transfers.length}
            </div>
          </DisclosureButton>
        </div>
      </Disclosure>
    </div>
  );

}
