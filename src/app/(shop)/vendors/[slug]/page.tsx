import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ProductCard from '@/components/shop/ProductCard'
import { categoryLabel, categoryColor, vendorTypeLabel, vendorTypeColor, formatMarketDate, cn } from '@/lib/utils'
import { Globe, Mail, Phone, Instagram, Facebook } from 'lucide-react'
import type { Metadata } from 'next'

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const vendor = await prisma.vendor.findUnique({ where: { slug: params.slug } })
  if (!vendor) return { title: 'Vendor Not Found | Backroads Market' }
  return {
    title: `${vendor.name} | Backroads Market`,
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

  const products = vendor.onlineOrdersEnabled
    ? await prisma.product.findMany({
        where: { vendorId: vendor.id, isAvailable: true },
        include: { vendor: { select: { name: true, slug: true } } },
        orderBy: { name: 'asc' },
      })
    : []

  // Get upcoming markets this vendor is assigned to
  const upcomingMarketVendors = await prisma.marketVendor.findMany({
    where: {
      vendorId: vendor.id,
      market: { status: 'UPCOMING', date: { gte: new Date() } },
    },
    include: { market: true },
    orderBy: { market: { date: 'asc' } },
    take: 5,
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
        {/* Logo / booth image */}
        <div className="w-20 h-20 rounded-full bg-market-sage flex items-center justify-center shrink-0 overflow-hidden">
          {vendor.boothImageUrl ? (
            <img
              src={vendor.boothImageUrl}
              alt={`${vendor.name}`}
              className="w-full h-full object-cover rounded-full"
            />
          ) : vendor.logoUrl ? (
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

          <div className="flex flex-wrap gap-2 mb-4">
            <span
              className={cn(
                'inline-block text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full',
                categoryColor(vendor.category)
              )}
            >
              {categoryLabel(vendor.category)}
            </span>
            <span
              className={cn(
                'inline-block text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full',
                vendorTypeColor(vendor.vendorType)
              )}
            >
              {vendorTypeLabel(vendor.vendorType)}
            </span>
          </div>

          <p className="text-muted-foreground leading-relaxed max-w-2xl">
            {vendor.description}
          </p>

          {vendor.businessDescription && (
            <p className="text-muted-foreground leading-relaxed max-w-2xl mt-3">
              {vendor.businessDescription}
            </p>
          )}
        </div>
      </div>

      {/* Contact & Social section */}
      {(vendor.contactPerson || vendor.email || vendor.phone || vendor.website || vendor.instagramHandle || vendor.facebookHandle) && (
        <div className="card-market p-5 mb-10">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Contact
          </h2>
          <div className="flex flex-wrap gap-4">
            {vendor.contactPerson && (
              <span className="text-sm text-market-soil">{vendor.contactPerson}</span>
            )}
            {vendor.email && (
              <a href={`mailto:${vendor.email}`} className="inline-flex items-center gap-1.5 text-sm text-market-sage hover:text-market-sage-dk transition-colors">
                <Mail className="w-3.5 h-3.5" />
                {vendor.email}
              </a>
            )}
            {vendor.phone && (
              <a href={`tel:${vendor.phone}`} className="inline-flex items-center gap-1.5 text-sm text-market-sage hover:text-market-sage-dk transition-colors">
                <Phone className="w-3.5 h-3.5" />
                {vendor.phone}
              </a>
            )}
            {vendor.website && (
              <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-market-sage hover:text-market-sage-dk transition-colors">
                <Globe className="w-3.5 h-3.5" />
                Website
              </a>
            )}
            {vendor.instagramHandle && (
              <a href={`https://instagram.com/${vendor.instagramHandle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-market-sage hover:text-market-sage-dk transition-colors">
                <Instagram className="w-3.5 h-3.5" />
                {vendor.instagramHandle}
              </a>
            )}
            {vendor.facebookHandle && (
              <span className="inline-flex items-center gap-1.5 text-sm text-market-sage">
                <Facebook className="w-3.5 h-3.5" />
                {vendor.facebookHandle}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Upcoming markets */}
      {upcomingMarketVendors.length > 0 && (
        <div className="card-market p-5 mb-10">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Upcoming Markets
          </h2>
          <div className="space-y-2">
            {upcomingMarketVendors.map((mv) => (
              <Link
                key={mv.id}
                href={`/market/${mv.market.id}`}
                className="block text-sm text-market-soil hover:text-market-sage transition-colors"
              >
                {formatMarketDate(mv.market.date)} &middot; {mv.market.openTime}&ndash;{mv.market.closeTime}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Product Gallery */}
      {(vendor.productImage1Url || vendor.productImage2Url || vendor.productImage3Url) && (
        <div className="mb-10">
          <h2 className="font-display text-xl font-semibold text-market-soil mb-4">
            Gallery
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[vendor.productImage1Url, vendor.productImage2Url, vendor.productImage3Url]
              .filter(Boolean)
              .map((url, i) => (
                <img
                  key={i}
                  src={url!}
                  alt={`${vendor.name} product ${i + 1}`}
                  className="rounded-lg object-cover w-full aspect-square"
                />
              ))}
          </div>
        </div>
      )}

      {/* Payment Methods */}
      {(vendor.venmoQrUrl || vendor.paypalQrUrl || vendor.zelleQrUrl) && (
        <div className="card-market p-5 mb-10">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Payment Methods
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {vendor.venmoQrUrl && (
              <div className="text-center">
                <img src={vendor.venmoQrUrl} alt="Venmo QR Code" className="rounded-lg w-full max-w-[160px] mx-auto" />
                <p className="text-xs text-muted-foreground mt-1">Venmo</p>
              </div>
            )}
            {vendor.paypalQrUrl && (
              <div className="text-center">
                <img src={vendor.paypalQrUrl} alt="PayPal QR Code" className="rounded-lg w-full max-w-[160px] mx-auto" />
                <p className="text-xs text-muted-foreground mt-1">PayPal</p>
              </div>
            )}
            {vendor.zelleQrUrl && (
              <div className="text-center">
                <img src={vendor.zelleQrUrl} alt="Zelle QR Code" className="rounded-lg w-full max-w-[160px] mx-auto" />
                <p className="text-xs text-muted-foreground mt-1">Zelle</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Products section */}
      {vendor.onlineOrdersEnabled ? (
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
      ) : (
        <div className="card-market p-8 text-center mb-10">
          <p className="text-muted-foreground">
            This vendor does not offer online ordering. Visit them at the market!
          </p>
        </div>
      )}

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
