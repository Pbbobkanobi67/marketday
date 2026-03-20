import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatPrice, categoryLabel, categoryColor, vendorTypeLabel, cn } from '@/lib/utils'
import { ArrowLeft, Store } from 'lucide-react'
import type { Metadata } from 'next'
import { AddToCartButton } from './AddToCartButton'

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { vendor: { select: { name: true } } },
  })
  if (!product) return { title: 'Product Not Found | Backroads Market' }
  return {
    title: `${product.name} | ${product.vendor.name} | Backroads Market`,
    description: product.description,
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      vendor: {
        select: {
          name: true,
          slug: true,
          vendorType: true,
          description: true,
          boothImageUrl: true,
          logoUrl: true,
        },
      },
    },
  })

  if (!product) notFound()

  const vendor = product.vendor
  const soldOut = !product.isAvailable

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
        <Link href={`/vendors/${vendor.slug}`} className="hover:text-market-sage transition-colors">
          {vendor.name}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-market-soil font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Product image */}
        <div className="relative aspect-square rounded-xl bg-market-warm flex items-center justify-center overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <span className="font-display text-7xl font-bold text-market-stone select-none">
              {product.name.charAt(0)}
            </span>
          )}

          {soldOut && (
            <span className="absolute top-4 right-4 text-sm font-semibold uppercase tracking-wide px-3 py-1 rounded-full bg-red-100 text-red-800">
              Sold Out
            </span>
          )}

          <span
            className={cn(
              'absolute top-4 left-4 text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full',
              categoryColor(product.category)
            )}
          >
            {categoryLabel(product.category)}
          </span>
        </div>

        {/* Product info */}
        <div className="flex flex-col gap-5">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-market-soil leading-tight">
              {product.name}
            </h1>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="price text-2xl">
              {formatPrice(product.price)}
            </span>
            <span className="text-sm text-muted-foreground">/ {product.unit}</span>
          </div>

          {product.quantity > 0 && !soldOut && (
            <p className="text-sm text-muted-foreground">
              {product.quantity} in stock
            </p>
          )}

          <p className="text-muted-foreground leading-relaxed">
            {product.description}
          </p>

          {/* Add to cart */}
          {!soldOut && (
            <AddToCartButton
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                unit: product.unit,
                imageUrl: product.imageUrl,
                vendorName: vendor.name,
              }}
            />
          )}

          {/* Vendor card */}
          <Link
            href={`/vendors/${vendor.slug}`}
            className="card-market p-4 flex items-center gap-4 hover:shadow-md transition-shadow mt-2"
          >
            <div className="w-12 h-12 rounded-full bg-market-sage flex items-center justify-center shrink-0 overflow-hidden">
              {vendor.boothImageUrl || vendor.logoUrl ? (
                <img
                  src={(vendor.boothImageUrl || vendor.logoUrl)!}
                  alt={vendor.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <Store className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-market-soil truncate">{vendor.name}</p>
              <p className="text-xs text-muted-foreground">{vendorTypeLabel(vendor.vendorType)}</p>
            </div>
            <span className="text-xs text-market-sage font-medium shrink-0">View vendor &rarr;</span>
          </Link>
        </div>
      </div>

      {/* Back link */}
      <div className="mt-10">
        <Link
          href={`/vendors/${vendor.slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-market-sage hover:text-market-sage-dk transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {vendor.name}
        </Link>
      </div>
    </section>
  )
}
