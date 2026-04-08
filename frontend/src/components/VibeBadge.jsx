export default function VibeBadge({ intensity }) {
  if (!intensity) return null;
  const labels = { chill: 'Chill', moderate: 'Moderate', intense: 'Intense', brutal: 'Brutal' };
  return (
    <span className={`badge badge-${intensity}`}>{labels[intensity] ?? intensity}</span>
  );
}
