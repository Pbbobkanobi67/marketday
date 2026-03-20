import Link from 'next/link'
import { vendorTypeLabel, vendorTypeColor, cn } from '@/lib/utils'

type VendorCardProps = {
  vendor: {
    id: string
    name: string
    slug: string
    description: string
    category: string
    logoUrl: string | null
    vendorType?: string
  }
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
}

export default function VendorCard({ vendor }: VendorCardProps) {
  return (
    <Link
      href={`/vendors/${vendor.slug}`}
      className="card-market p-5 flex flex-col gap-3 transition-all duration-200 group hover:shadow-lg hover:-translate-y-0.5"
    >
      <div className="flex items-start gap-4">
        {/* Logo circle */}
        <div className="w-14 h-14 rounded-full bg-market-sage/15 flex items-center justify-center shrink-0 overflow-hidden">
          {vendor.logoUrl ? (
            <img
              src={vendor.logoUrl}
              alt={`${vendor.name} logo`}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <span className="font-display text-lg font-bold text-market-sage select-none">
              {getInitials(vendor.name)}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Vendor name */}
          <h3 className="font-display text-base font-semibold text-market-soil leading-tight group-hover:text-market-sage transition-colors">
            {vendor.name}
          </h3>

          {/* Badge */}
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {vendor.vendorType && (
              <span
                className={cn(
                  'inline-block text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full',
                  vendorTypeColor(vendor.vendorType)
                )}
              >
                {vendorTypeLabel(vendor.vendorType)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
        {vendor.description}
      </p>
    </Link>
  )
}
