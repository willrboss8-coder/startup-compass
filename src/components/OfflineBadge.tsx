export function OfflineBadge() {
  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 shadow-sm ring-1 ring-emerald-200/60">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Works offline
      </div>
    </div>
  );
}
