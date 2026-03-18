import type { ReactNode } from 'react'

type StatCardProps = {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
}

export default function StatCard({ title, value, subtitle, icon }: StatCardProps) {
  return (
    <div className="card-market p-5 flex items-start gap-4">
      {icon && (
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-market-sage/10 text-market-sage shrink-0">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
        <p className="font-display text-2xl font-bold text-market-soil mt-1 leading-none">
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1.5">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}
