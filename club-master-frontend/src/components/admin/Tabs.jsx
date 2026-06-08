export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {tabs.map(({ id, label, count }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`px-4 py-2 rounded-xl text-sm transition-all ${
            active === id
              ? 'gold-gradient text-black font-semibold'
              : 'border border-gold/20 text-gray-text hover:text-white'
          }`}
        >
          {label}{count != null ? ` (${count})` : ''}
        </button>
      ))}
    </div>
  );
}
