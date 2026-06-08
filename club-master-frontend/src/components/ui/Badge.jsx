const COLORS = {
  gold: '#D4AF37',
  green: '#4CAF50',
  red: '#ef4444',
  gray: '#9CA3AF',
  blue: '#2196F3',
};

export default function Badge({ children, color = 'gold' }) {
  const hex = COLORS[color] || color;
  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: `${hex}22`, color: hex, border: `1px solid ${hex}44` }}
    >
      {children}
    </span>
  );
}
