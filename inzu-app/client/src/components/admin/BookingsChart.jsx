const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function BookingsChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-300 text-sm">
        No bookings data yet
      </div>
    );
  }

  const max     = Math.max(...data.map((d) => d.count), 1);
  const barW    = Math.floor(100 / data.length);

  return (
    <div className="w-full">
      {/* Bars */}
      <div className="flex items-end gap-1.5 h-32 mb-2">
        {data.map((d, i) => {
          const heightPct = Math.round((d.count / max) * 100);
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
              {/* Tooltip */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded pointer-events-none whitespace-nowrap">
                {d.count} booking{d.count !== 1 ? 's' : ''}
              </div>
              <div className="w-full flex items-end justify-center h-24">
                <div
                  className="w-full bg-green-500 rounded-t-md transition-all hover:bg-green-600"
                  style={{ height: `${Math.max(heightPct, 4)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* X labels */}
      <div className="flex gap-1.5">
        {data.map((d, i) => (
          <div key={i} className="flex-1 text-center text-xs text-gray-400">
            {MONTH_NAMES[(d._id.month - 1) % 12]}
          </div>
        ))}
      </div>
    </div>
  );
}
