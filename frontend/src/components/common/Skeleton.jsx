/**
 * Skeleton loading primitives — use these instead of blank white areas.
 *
 * <SkeletonBlock />              — generic block
 * <SkeletonText lines={3} />    — text lines
 * <SkeletonCard />               — white card with inner lines
 * <SkeletonStatCard />           — stat card (gray bg)
 * <SkeletonTableRow cols={5} />  — table row
 * <SkeletonProductCard />        — product grid card
 * <SkeletonQueryCard />          — inbox query card
 * <SkeletonTaskCard />           — task card
 */

const pulse = 'animate-pulse bg-gray-200 rounded';

export function SkeletonBlock({ className = '' }) {
  return <div className={`${pulse} ${className}`} />;
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`${pulse} h-3`}
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-white border border-gray-100 rounded-xl p-5 shadow-sm ${className}`}>
      <div className={`${pulse} h-4 w-1/3 mb-3`} />
      <div className={`${pulse} h-3 w-full mb-2`} />
      <div className={`${pulse} h-3 w-3/4`} />
    </div>
  );
}

export function SkeletonStatCard({ className = '' }) {
  return (
    <div className={`bg-gray-50 rounded-xl p-4 ${className}`}>
      <div className={`${pulse} h-3 w-24 mb-3`} />
      <div className={`${pulse} h-8 w-16`} />
    </div>
  );
}

export function SkeletonTableRow({ cols = 5, className = '' }) {
  return (
    <tr className={className}>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className={`${pulse} h-3 rounded`} style={{ width: i === 0 ? '120px' : '80px' }} />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonProductCard({ className = '' }) {
  return (
    <div className={`bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm ${className}`}>
      <div className={`${pulse} h-44 w-full rounded-none`} />
      <div className="p-3 space-y-2">
        <div className={`${pulse} h-3 w-3/4`} />
        <div className={`${pulse} h-3 w-1/2`} />
      </div>
    </div>
  );
}

export function SkeletonQueryCard({ className = '' }) {
  return (
    <div className={`bg-white border border-gray-100 rounded-xl p-4 shadow-sm ${className}`}>
      <div className="flex items-start gap-3">
        <div className={`${pulse} w-9 h-9 rounded-full flex-shrink-0`} />
        <div className="flex-1 space-y-2">
          <div className={`${pulse} h-3 w-1/3`} />
          <div className={`${pulse} h-3 w-1/2`} />
          <div className={`${pulse} h-3 w-2/3`} />
        </div>
        <div className={`${pulse} h-5 w-16 rounded-full`} />
      </div>
    </div>
  );
}

export function SkeletonTaskCard({ className = '' }) {
  return (
    <div className={`bg-white border border-gray-100 rounded-xl p-4 shadow-sm ${className}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className={`${pulse} h-4 w-1/3`} />
        <div className={`${pulse} h-5 w-20 rounded-full`} />
      </div>
      <div className={`${pulse} h-3 w-1/2 mb-2`} />
      <div className={`${pulse} h-3 w-2/3`} />
    </div>
  );
}

export function SkeletonPlanCard({ className = '' }) {
  return (
    <div className={`bg-white border border-gray-100 rounded-xl p-5 shadow-sm ${className}`}>
      <div className={`${pulse} h-4 w-1/4 mb-3`} />
      <div className={`${pulse} h-6 w-1/3 mb-4`} />
      <div className={`${pulse} h-3 w-full mb-2`} />
      <div className={`${pulse} h-3 w-3/4`} />
    </div>
  );
}