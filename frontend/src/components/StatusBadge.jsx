export default function StatusBadge({ status }) {
  const labels = {
    want_to_play: 'Want to Play',
    playing: 'Playing',
    completed: 'Completed',
    dropped: 'Dropped',
    on_hold: 'On Hold',
  };
  return (
    <span className={`badge badge-${status}`}>{labels[status] ?? status}</span>
  );
}
