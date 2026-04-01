'use client';

import { Spinner } from "@/util";
import { X, Search, Folder } from "react-feather";
import { useState, useEffect } from "react";
import useFiles from "@/lib/hooks/files";


export default function Header() {
  const [query, setQuery] = useState<string>("");
  const parents = useFiles((state) => state.parents);

  const searchStatus = useFiles((state) => state.searchStatus);
  const searchQuery = useFiles((state) => state.query);
  const fetchResults = useFiles((state) => state.fetchResults);
  const search = useFiles((state) => state.search);
  const list = useFiles((state) => state.list);

  const inode = parents.at(0);
  useEffect(() => {
    if (searchStatus !== "loading") {
      return;
    }
    const interval = setInterval(() => {
      fetchResults().catch(console.error);
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [searchStatus, fetchResults]);

  useEffect(() => {
    if (searchStatus === "complete") {
      setQuery("");
    }
  }, [searchStatus]);


  if (searchStatus === "idle" && inode) {
    return (
      <div className="flex flex-row border-b py-1.5 mb-3 justify-between border-white/[0.06]">
        <div
          className="flex rounded-lg flex-row px-3 text-xs font-semibold text-white/60 items-center hover:bg-white/[0.06] cursor-pointer transition-colors duration-200"
        >
          <Folder
            className="text-white/30 fill-white/10 mr-1.5"
            size={20} strokeWidth={1} />
          {inode.name}
        </div>

        <div>
          <form onSubmit={(e) => {
            search(query).catch(console.error);
            e.preventDefault();
          }}>
            <div className="flex items-center gap-1.5 border border-white/5 rounded-full bg-black/20 focus-within:bg-black/40 transition-colors group">
              <div className="relative flex items-center">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={14} className="text-white/40 group-focus-within:text-white/70 transition-colors" />
                </div>
                <input
                  type="text"
                  className="block w-48 sm:w-64 pl-9 pr-8 py-1.5 border-0 bg-transparent rounded-full text-xs text-white placeholder-white/40 focus:outline-none transition-all"
                  placeholder="Search in your drive..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button
                  hidden={!query}
                  onClick={() => { setQuery(""); list(null).catch(console.error); }}
                  className="absolute text-white/40 right-2 hover:text-white hover:bg-white/10 p-0.5 rounded-full transition-colors"
                  type="reset"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          </form>
        </div>

      </div>);
  }

  if (searchStatus === "loading") {
    return (
      <div className="flex flex-row border-b py-1.5 mb-3 justify-between border-white/[0.06] items-center">
        <div className="text-xs">
          <span className="text-orange px-2 font-semibold">
            Searching
          </span>
          <span className="text-white/30">for</span>
          <span className="text-white/60 font-mono px-2">
            &quot;{searchQuery}&quot;
          </span>
        </div>
        <Spinner small loading={true} white />
        <button
          className="glass rounded-lg px-2 py-1 text-xs text-white/50 inline-flex items-center gap-1 hover:bg-white/[0.06] transition-colors duration-200"
          type="button"
          onClick={() => { list(null).catch(console.error); }}
        >
          <X size={12} />
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-row border-b py-1.5 mb-3 justify-between border-white/[0.06] items-center">
      <div className="text-xs">
        <span className="text-orange px-2 font-semibold">
          Showing results
        </span>
        <span className="text-white/30">for search</span>
        <span className="text-white/60 font-mono px-2">
          &quot;{searchQuery}&quot;
        </span>
      </div>
      <button
        className="glass rounded-lg px-2 py-1 text-xs text-white/50 inline-flex items-center gap-1 hover:bg-white/[0.06] transition-colors duration-200"
        type="button"
        onClick={() => { list(null).catch(console.error); }}
      >
        <X size={12} />
        Clear
      </button>
    </div>
  );
}
