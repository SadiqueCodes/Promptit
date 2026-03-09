export function LoadingState() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-slate-950 border border-slate-700 rounded-lg overflow-hidden">
          <div className="p-4 animate-pulse">
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-slate-800" />
              <div className="flex-1">
                <div className="h-4 bg-slate-800 rounded w-24 mb-2" />
                <div className="h-3 bg-slate-800 rounded w-16" />
              </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-[1fr_auto] gap-4">
              <div>
                <div className="h-5 bg-slate-800 rounded w-3/4 mb-2" />
                <div className="h-4 bg-slate-800 rounded w-full mb-1" />
                <div className="h-4 bg-slate-800 rounded w-5/6" />
              </div>
              <div className="w-40 h-24 rounded-lg bg-slate-800" />
            </div>

            {/* Actions */}
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-800">
              <div className="h-6 bg-slate-800 rounded w-16" />
              <div className="h-6 bg-slate-800 rounded w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
