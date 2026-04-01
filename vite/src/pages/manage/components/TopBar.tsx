import Upload from '../Upload';

export default function TopBar() {
  return (
    <div className="flex w-full items-center justify-between pb-4 select-none">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold tracking-tight text-white mb-0.5 shadow-sm">
          Files
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        <Upload />
      </div>
    </div>
  );
}
