export function SkeletonCard({ lines = 3, hasImage = false }) {
  return (
    <div className="card skeleton-card">
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        {hasImage && <div className="skeleton skeleton-image" />}
        <div style={{ flex: 1 }}>
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className="skeleton skeleton-line"
              style={{ width: i === 0 ? '60%' : i === lines - 1 ? '40%' : '80%' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 4, columns = 4 }) {
  return (
    <div className={`grid-${columns}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="stat-card">
          <div className="skeleton skeleton-value" />
          <div className="skeleton skeleton-label" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonList({ count = 5, hasImage = true }) {
  return (
    <div>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} lines={3} hasImage={hasImage} />
      ))}
    </div>
  );
}
