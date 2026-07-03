/**
 * Yumuşak animasyonlu ilerleme çubuğu.
 * @param {number} value 0-100 arası yüzde
 * @param {string} [label] isteğe bağlı üst etiket
 * @param {boolean} [showPercent] yüzdeyi göster
 */
export default function ProgressBar({ value = 0, label, showPercent = true, className = '' }) {
  const clamped = Math.max(0, Math.min(100, value))

  return (
    <div className={className}>
      {(label || showPercent) && (
        <div className="mb-1.5 flex items-center justify-between text-xs">
          {label && <span className="font-medium text-slate-400">{label}</span>}
          {showPercent && (
            <span className="font-semibold text-brand-300">%{clamped}</span>
          )}
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-[width] duration-500 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
