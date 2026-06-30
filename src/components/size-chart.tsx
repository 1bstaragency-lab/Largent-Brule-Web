interface SizeChartProps {
  sizes: Array<{
    size: string;
    length: number;
    chestWidth: number;
  }>;
  onClose: () => void;
}

export function SizeChart({ sizes, onClose }: SizeChartProps) {
  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-lg p-6 md:p-8 max-w-lg w-full animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-sm md:text-base font-semibold uppercase tracking-wider mb-6">SIZE GUIDE</h2>

        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-neutral-300">
                <th className="text-left px-3 py-2 text-xs font-semibold uppercase">Size</th>
                <th className="text-center px-3 py-2 text-xs font-semibold uppercase">Length</th>
                <th className="text-center px-3 py-2 text-xs font-semibold uppercase">Chest Width</th>
              </tr>
            </thead>
            <tbody>
              {sizes.map((s) => (
                <tr key={s.size} className="border-b border-neutral-200 hover:bg-neutral-50">
                  <td className="px-3 py-3 text-sm font-semibold">{s.size}</td>
                  <td className="px-3 py-3 text-sm text-center text-neutral-700">{s.length}"</td>
                  <td className="px-3 py-3 text-sm text-center text-neutral-700">{s.chestWidth}"</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-[10px] text-neutral-600 text-center mb-6">
          All measurements are approximate and taken from the center of the garment.
        </p>

        <button
          onClick={onClose}
          className="w-full h-10 bg-black text-white text-xs font-semibold uppercase tracking-wider rounded hover:bg-neutral-800 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
