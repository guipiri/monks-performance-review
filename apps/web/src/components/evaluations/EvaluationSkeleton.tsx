export function EvaluationSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs animate-pulse space-y-4"
        >
          <div className="flex justify-between items-start">
            <div className="flex gap-3 items-center">
              <div className="w-12 h-12 rounded-full bg-neutral-200" />
              <div className="space-y-2">
                <div className="w-40 h-4 bg-neutral-200 rounded-sm" />
                <div className="w-24 h-3 bg-neutral-200 rounded-sm" />
              </div>
            </div>
            <div className="w-20 h-8 bg-neutral-200 rounded-lg" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
            <div className="h-4 bg-neutral-100 rounded-sm" />
            <div className="h-4 bg-neutral-100 rounded-sm" />
            <div className="h-4 bg-neutral-100 rounded-sm" />
          </div>
        </div>
      ))}
    </div>
  );
}
