'use client'

export function SkeletonCard({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl p-5 animate-pulse" style={{ backgroundColor: '#FFF', border: '1px solid #EAEDE6' }}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full" style={{ backgroundColor: '#EAEDE6' }} />
            <div className="flex-1 space-y-2">
              <div className="h-4 rounded-lg w-1/3" style={{ backgroundColor: '#EAEDE6' }} />
              <div className="h-3 rounded-lg w-1/2" style={{ backgroundColor: '#F7F9FA' }} />
            </div>
            <div className="h-6 w-16 rounded-full" style={{ backgroundColor: '#EAEDE6' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonStats({ count = 4 }: { count?: number }) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-${count} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl p-6 animate-pulse" style={{ backgroundColor: '#FFF' }}>
          <div className="h-3 rounded w-20 mb-3" style={{ backgroundColor: '#EAEDE6' }} />
          <div className="h-8 rounded w-16" style={{ backgroundColor: '#EAEDE6' }} />
        </div>
      ))}
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-2xl overflow-hidden animate-pulse" style={{ backgroundColor: '#FFF', border: '1px solid #EAEDE6' }}>
      <div className="p-4" style={{ backgroundColor: '#1E2333' }}>
        <div className="flex gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="h-4 rounded flex-1" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 flex gap-4" style={{ borderBottom: '1px solid #EAEDE6' }}>
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-3 rounded flex-1" style={{ backgroundColor: '#F7F9FA' }} />
          ))}
        </div>
      ))}
    </div>
  )
}
