import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ProductCard from '@/components/shop/ProductCard'
import { categoryLabel, categoryColor, cn } from '@/lib/utils'
import type { Metadata } from 'next'

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const vendor = await prisma.vendor.findUnique({ where: { slug: params.slug } })
  if (!vendor) return { title: 'Vendor Not Found | MarketDay' }
  return {
    title: `${vendor.name} | MarketDay`,
    description: vendor.description,
  }
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
}

export default async function VendorDetailPage({ params }: Props) {
  const vendor = await prisma.vendor.findUnique({
    where: { slug: params.slug },
  })

  if (!vendor) notFound()

  const products = await prisma.product.findMany({
    where: { vendorId: vendor.id, isAvailable: true },
    include: { vendor: { select: { name: true, slug: true } } },
    orderBy: { name: 'asc' },
  })

  return (
    <section className="container-market py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-market-sage transition-colors">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <Link href="/vendors" className="hover:text-market-sage transition-colors">
          Vendors
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-market-soil font-medium">{vendor.name}</span>
      </nav>

      {/* Vendor header */}
      <div className="flex flex-col sm:flex-row items-start gap-6 mb-10">
        {/* Logo initials circle */}
        <div className="w-20 h-20 rounded-full bg-market-sage flex items-center justify-center shrink-0 overflow-hidden">
          {vendor.logoUrl ? (
            <img
              src={vendor.logoUrl}
              alt={`${vendor.name} logo`}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <span className="text-white text-2xl font-bold font-display select-none">
              {getInitials(vendor.name)}
            </span>
          )}
        </div>

        <div className="flex-1">
          <h1 className="font-display text-3xl font-bold text-market-soil mb-2">
            {vendor.name}
          </h1>
          <span
            className={cn(
              'inline-block text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full mb-4',
              categoryColor(vendor.category)
            )}
          >
            {categoryLabel(vendor.category)}
          </span>
          <p className="text-muted-foreground leading-relaxed max-w-2xl">
            {vendor.description}
          </p>
        </div>
      </div>

      {/* Products section */}
      <div className="mb-10">
        <h2 className="font-display text-xl font-semibold text-market-soil mb-6">
          Products Available This Season
        </h2>

        {products.length === 0 ? (
          <div className="text-center py-12 card-market">
            <p className="text-muted-foreground">
              No products available from this vendor at the moment. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Back link */}
      <Link
        href="/vendors"
        className="inline-flex items-center gap-1 text-sm font-medium text-market-sage hover:text-market-sage-dk transition-colors"
      >
        &larr; All Vendors
      </Link>
    </section>
  )
}
