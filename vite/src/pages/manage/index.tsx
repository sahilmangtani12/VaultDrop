import useSession from "@/Session";
import { FinderWrapper } from "./Context";

import Files from "./Files";
import Info from "./Info";
import { Navigate } from "react-router";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";

export default function Manage() {
  const { status } = useSession();


  if (status !== "authenticated") {
    return <Navigate to="/signin" />;
  }

  return (
    <div className="pt-16 md:pt-20 px-4 md:px-8 h-screen w-full flex flex-col overflow-hidden max-w-7xl mx-auto">
      <FinderWrapper>
        <TopBar />
        <Sidebar />
        
        <div className="relative flex flex-row gap-6 flex-1 overflow-hidden pb-6">
          {/* Files Grid - Always takes full remaining width */}
          <div className="flex-1 h-full w-full relative overflow-hidden">
            <Files />
          </div>
          
          {/* Info Pane Overlay - Absolutely positioned on the right */}
          <div className="absolute right-0 top-0 h-full w-80 pr-1 pb-4 pointer-events-none z-10 hidden xl:block">
            <Info />
          </div>
        </div>
      </FinderWrapper>
    </div>
  );
}
