export default function Badge({ children, color = '#D4AF37' }) {
  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: `${color}22`, color, border: `1px solid ${color}44` }}
    >
      {children}
    </span>
  );
}
