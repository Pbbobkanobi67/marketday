'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { useTransition } from 'react'
import Link from 'next/link'
import { generateSlug } from '@/lib/utils'
import { MARKET_CONFIG } from '@/config/market.config'
import { createVendorProduct } from '../actions'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'

const UNITS = [
  { value: 'each', label: 'Each' },
  { value: 'lb', label: 'Per Pound (lb)' },
  { value: 'bunch', label: 'Bunch' },
  { value: 'loaf', label: 'Loaf' },
  { value: 'jar', label: 'Jar' },
]

const selectClass = 'flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.string().min(1, 'Price is required'),
  unit: z.string().min(1, 'Unit is required'),
  category: z.string().min(1, 'Category is required'),
  isAvailable: z.boolean(),
})

type ProductFormValues = z.infer<typeof productSchema>

export default function VendorNewProductPage() {
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: standardSchemaResolver(productSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      price: '',
      unit: '',
      category: '',
      isAvailable: true,
    },
  })

  const isAvailable = watch('isAvailable')

  function onNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value
    setValue('name', name)
    setValue('slug', generateSlug(name))
  }

  function onSubmit(data: ProductFormValues) {
    const priceInCents = Math.round(parseFloat(data.price) * 100)
    startTransition(async () => {
      await createVendorProduct({
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: priceInCents,
        unit: data.unit,
        category: data.category,
        isAvailable: data.isAvailable,
      })
    })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Add Product</h1>
        <p className="text-sm text-muted-foreground">
          Create a new product listing.
        </p>
      </div>

      <Separator />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="e.g. Organic Heirloom Tomatoes"
            {...register('name')}
            onChange={onNameChange}
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            placeholder="organic-heirloom-tomatoes"
            {...register('slug')}
            aria-invalid={!!errors.slug}
          />
          {errors.slug && (
            <p className="text-sm text-destructive">{errors.slug.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe this product..."
            rows={4}
            {...register('description')}
            aria-invalid={!!errors.description}
          />
          {errors.description && (
            <p className="text-sm text-destructive">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price (USD)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...register('price')}
              aria-invalid={!!errors.price}
            />
            {errors.price && (
              <p className="text-sm text-destructive">{errors.price.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit">Unit</Label>
            <select
              id="unit"
              className={selectClass}
              {...register('unit')}
              aria-invalid={!!errors.unit}
            >
              <option value="">Select a unit</option>
              {UNITS.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
            {errors.unit && (
              <p className="text-sm text-destructive">{errors.unit.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            className={selectClass}
            {...register('category')}
            aria-invalid={!!errors.category}
          >
            <option value="">Select a category</option>
            {MARKET_CONFIG.categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-sm text-destructive">{errors.category.message}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="isAvailable"
            checked={isAvailable}
            onCheckedChange={(checked) =>
              setValue('isAvailable', checked === true)
            }
          />
          <Label htmlFor="isAvailable" className="cursor-pointer">
            Available for purchase
          </Label>
        </div>

        <Separator />

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Creating...' : 'Create Product'}
          </Button>
          <Button variant="outline" render={<Link href="/vendor/products" />}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
