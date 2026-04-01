
export default function FileName(
  { hidden, fileName }:
    {
      hidden?: boolean,
      fileName: string
    }) {
  if (hidden) {
    return null;
  }
  
  const lastDot = fileName.lastIndexOf(".");
  const n = fileName.length;

  // Render typical names normally if they are short enough
  if (lastDot <= 0 || n <= 18) {
    let textSize = "text-xs";
    if (n > 12) textSize = "text-[11px]";
    if (n > 25) textSize = "text-[10px]";

    return (
      <span className={"text-wrap text-center break-words leading-tight line-clamp-2 " + textSize} title={fileName}>
        {fileName}
      </span>
    );
  }

  // Flexbox middle-truncation for long items with extensions
  const base = fileName.substring(0, lastDot);
  const ext = fileName.substring(lastDot);
  
  return (
    <div className="flex w-full px-0.5 items-end justify-center group overflow-hidden leading-tight mt-0.5" title={fileName}>
        <span className="truncate tracking-tight shrink min-w-0" style={{ fontSize: n > 35 ? '10px' : '11px' }}>
          {base}
        </span>
        <span className="shrink-0 font-bold opacity-75 md:opacity-60 ml-[1px]" style={{ fontSize: n > 35 ? '10px' : '11px' }}>
          {ext}
        </span>
    </div>
  );
}
