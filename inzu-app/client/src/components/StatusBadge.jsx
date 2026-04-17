export default function StatusBadge({ status, small = false }) {
  const base = small
    ? 'text-xs px-2 py-0.5 rounded-full font-medium'
    : 'text-xs px-2.5 py-1 rounded-full font-medium';

  if (status === 'available') {
    return (
      <span className={`${base} bg-green-100 text-green-700`}>
        Available
      </span>
    );
  }

  return (
    <span className={`${base} bg-red-100 text-red-700`}>
      Booked
    </span>
  );
}
