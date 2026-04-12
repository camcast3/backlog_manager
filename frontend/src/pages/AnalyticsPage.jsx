import { useState, useEffect } from 'react';
import { analyticsApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const STATUS_COLORS = {
  want_to_play: '#3b82f6',
  playing: '#22c55e',
  completed: '#6b7280',
  dropped: '#ef4444',
  on_hold: '#f59e0b',
};

const VIBE_COLORS = {
  chill: '#3b82f6',
  moderate: '#7c3aed',
  intense: '#ec4899',
  brutal: '#ef4444',
};

const STATUS_LABELS = {
  want_to_play: 'Want to Play',
  playing: 'Playing',
  completed: 'Completed',
  dropped: 'Dropped',
  on_hold: 'On Hold',
};

function useCssColors() {
  const [colors, setColors] = useState({ accent: '#7c3aed', muted: '#94a3b8' });
  useEffect(() => {
    const style = getComputedStyle(document.documentElement);
    setColors({
      accent: style.getPropertyValue('--accent').trim() || '#7c3aed',
      muted: style.getPropertyValue('--text-muted').trim() || '#94a3b8',
    });
  }, []);
  return colors;
}

function EmptyState({ message }) {
  return (
    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
      {message || 'No data yet'}
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '0.5rem 0.75rem',
      fontSize: '0.8rem',
    }}>
      {label && <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || 'var(--text)' }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    health: null,
    statusDist: [],
    trends: [],
    genres: [],
    platforms: [],
    vibes: [],
  });
  const css = useCssColors();

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [health, statusDist, trends, genres, platforms, vibes] = await Promise.all([
        analyticsApi.backlogHealth(),
        analyticsApi.statusDist(),
        analyticsApi.completionTrends(),
        analyticsApi.genreBreakdown(),
        analyticsApi.platformDist(),
        analyticsApi.vibeMap(),
      ]);
      setData({ health, statusDist, trends, genres, platforms, vibes });
    } catch (err) {
      toast(err.message, 'warning');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="spinner" />;

  const { health, statusDist, trends, genres, platforms, vibes } = data;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
      </div>

      {/* Backlog Health Card */}
      {health && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem' }}>Backlog Health</h2>
          <div className="grid-4">
            <div className="stat-card">
              <div className="stat-value">{Number(health.remaining)}</div>
              <div className="stat-label">Remaining</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--accent-light)' }}>
                {health.monthly_completion_rate}/mo
              </div>
              <div className="stat-label">Completion Rate</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--warning)' }}>
                {health.estimated_months != null ? `${health.estimated_months}mo` : '∞'}
              </div>
              <div className="stat-label">Est. to Clear</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{health.estimated_hours}h</div>
              <div className="stat-label">Est. Hours</div>
            </div>
          </div>
        </div>
      )}

      {/* Status Distribution + Completion Timeline */}
      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem' }}>Status Distribution</h3>
          {statusDist.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={statusDist.map(d => ({ ...d, name: STATUS_LABELS[d.status] || d.status, count: Number(d.count) }))}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {statusDist.map((d, i) => (
                    <Cell key={i} fill={STATUS_COLORS[d.status] || css.accent} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '0.8rem', color: css.muted }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyState message="No backlog items yet" />}
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem' }}>Completion Timeline</h3>
          {trends.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={trends.map(d => ({ ...d, count: Number(d.count) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: css.muted, fontSize: 11 }}
                  tickFormatter={(v) => v.slice(5)}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: css.muted, fontSize: 11 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Completed"
                  stroke={css.accent}
                  fill={css.accent}
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : <EmptyState message="No completions recorded yet" />}
        </div>
      </div>

      {/* Genre Breakdown + Platform Distribution */}
      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem' }}>Genre Breakdown</h3>
          {genres.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={genres.map(d => ({ ...d, count: Number(d.count) }))} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fill: css.muted, fontSize: 11 }}
                />
                <YAxis
                  type="category"
                  dataKey="genre"
                  width={100}
                  tick={{ fill: css.muted, fontSize: 11 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Games" fill={css.accent} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState message="No genre data yet" />}
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem' }}>Platform Distribution</h3>
          {platforms.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={platforms.map(d => ({ ...d, count: Number(d.count) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="platform"
                  tick={{ fill: css.muted, fontSize: 11 }}
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: css.muted, fontSize: 11 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Games" fill={css.accent} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState message="No platform data yet" />}
        </div>
      </div>

      {/* Vibe Intensity Map */}
      <div className="card" style={{ maxWidth: 500 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem' }}>Vibe Intensity Map</h3>
        {vibes.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={vibes.map(d => ({
                  ...d,
                  name: d.vibe_intensity,
                  count: Number(d.count),
                }))}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                paddingAngle={3}
              >
                {vibes.map((d, i) => (
                  <Cell key={i} fill={VIBE_COLORS[d.vibe_intensity] || css.accent} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '0.8rem', color: css.muted }} />
            </PieChart>
          </ResponsiveContainer>
        ) : <EmptyState message="No vibe data yet" />}
      </div>
    </div>
  );
}
