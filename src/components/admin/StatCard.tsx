import type { ReactNode } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

type StatCardProps = {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  trend?: { direction: 'up' | 'down' | 'flat'; label: string }
}

export default function StatCard({ title, value, subtitle, icon, trend }: StatCardProps) {
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
        {trend && (
          <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${
            trend.direction === 'up' ? 'text-green-600' :
            trend.direction === 'down' ? 'text-red-600' :
            'text-muted-foreground'
          }`}>
            {trend.direction === 'up' && <TrendingUp className="size-3" />}
            {trend.direction === 'down' && <TrendingDown className="size-3" />}
            {trend.direction === 'flat' && <Minus className="size-3" />}
            {trend.label}
          </div>
        )}
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1.5">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}
