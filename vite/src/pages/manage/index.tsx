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
    <div className="pt-2 px-6 h-screen flex overflow-hidden max-w-[1600px] mx-auto">
      <FinderWrapper>
        <Sidebar />
        
        <div className="flex-1 flex flex-col h-full overflow-hidden pl-6 py-4">
          <TopBar />
          
          <div className="relative flex flex-row gap-6 flex-1 overflow-hidden">
            {/* Files Grid - Always takes full remaining width */}
            <div className="flex-1 overflow-y-auto pr-2 pb-10 custom-scrollbar w-full">
              <Files />
            </div>
            
            {/* Info Pane Overlay - Absolutely positioned on the right */}
            <div className="absolute right-0 top-0 h-full w-80 pr-1 pb-10 pointer-events-none z-10">
              <Info />
            </div>
          </div>
        </div>
      </FinderWrapper>
    </div>
  );
}
