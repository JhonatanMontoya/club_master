export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className="w-full">
      {label && <label className="block text-gray-text text-sm mb-2">{label}</label>}
      <input
        className={`w-full bg-black-secondary border border-gold/20 rounded-xl px-4 py-3 text-white placeholder-gray-text/50 focus:outline-none focus:border-gold transition-colors ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
