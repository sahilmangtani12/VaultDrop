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
            <div className="flex items-center gap-1.5">
              <div className="relative flex items-center">
                <input
                  type="text"
                  className="glass rounded-full px-3 py-1 text-xs text-white/80 placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-white/20"
                  placeholder="Search..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button
                  hidden={!query}
                  onClick={() => setQuery("")}
                  className="absolute text-white/30 right-2 hover:text-white/60 transition-colors"
                  type="reset">
                  <X size={14} />
                </button>
              </div>
              <button
                type="submit"
                className="glass rounded-lg px-2 py-1.5 text-white/50 hover:text-white/80 hover:bg-white/[0.06] transition-all duration-200 disabled:opacity-30"
                disabled={!query}
              >
                <Search size={14} />
              </button>
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
