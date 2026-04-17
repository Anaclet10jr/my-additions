const COLOR_MAP = {
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-400'   },
  green:  { bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-400'  },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-400' },
  amber:  { bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-400'  },
  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-400' },
  red:    { bg: 'bg-red-50',    text: 'text-red-700',    dot: 'bg-red-400'    },
};

export default function AdminStatCard({ label, value, color = 'green' }) {
  const c = COLOR_MAP[color] || COLOR_MAP.green;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${c.dot}`} />
        <p className="text-xs text-gray-500 font-medium">{label}</p>
      </div>
      <p className={`text-2xl font-bold ${c.text}`}>{value}</p>
    </div>
  );
}
