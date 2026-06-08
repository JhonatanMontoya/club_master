export default function DataTable({ columns, data, onRowClick, emptyMessage = 'Sin registros' }) {
  if (!data?.length) {
    return <p className="text-gray-text text-center py-8">{emptyMessage}</p>;
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-gold/10">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-black-secondary text-gray-text text-left">
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 font-medium whitespace-nowrap">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={row.id ?? i}
              onClick={() => onRowClick?.(row)}
              className={`border-t border-gold/5 text-white ${onRowClick ? 'cursor-pointer hover:bg-white/5' : ''}`}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
