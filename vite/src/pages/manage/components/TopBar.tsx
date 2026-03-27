import { Search } from 'react-feather';
import Upload from '../Upload';

export default function TopBar() {
  return (
    <div className="flex w-full items-center justify-between pb-6 select-none">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold tracking-tight text-white mb-0.5 shadow-sm">
          Files
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-white/40 group-focus-within:text-white/70 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-64 pl-9 pr-3 py-2 border-0 bg-white/5 backdrop-blur-md rounded-full text-sm text-white placeholder-white/40 focus:ring-1 focus:ring-white/20 focus:bg-white/10 transition-all outline-none"
            placeholder="Search in your drive..."
          />
        </div>
        <Upload />
      </div>
    </div>
  );
}
