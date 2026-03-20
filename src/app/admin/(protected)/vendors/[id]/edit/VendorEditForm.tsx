'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { useTransition } from 'react'
import Link from 'next/link'
import { generateSlug } from '@/lib/utils'
import { MARKET_CONFIG } from '@/config/market.config'
import { updateVendor } from '../../actions'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'

const vendorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  isActive: z.boolean(),
  contactPerson: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  website: z.string().optional(),
  instagramHandle: z.string().optional(),
  facebookHandle: z.string().optional(),
  vendorType: z.string().min(1, 'Vendor type is required'),
  businessDescription: z.string().optional(),
  onlineOrdersEnabled: z.boolean(),
  portalPassword: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
})

type VendorFormValues = z.infer<typeof vendorSchema>

interface VendorEditFormProps {
  vendor: {
    id: string
    name: string
    slug: string
    description: string
    category: string
    isActive: boolean
    contactPerson: string | null
    email: string | null
    phone: string | null
    website: string | null
    instagramHandle: string | null
    facebookHandle: string | null
    vendorType: string
    businessDescription: string | null
    onlineOrdersEnabled: boolean
    hashedPassword: string | null
  }
}

const selectClass = 'flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

export function VendorEditForm({ vendor }: VendorEditFormProps) {
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VendorFormValues>({
    resolver: standardSchemaResolver(vendorSchema),
    defaultValues: {
      name: vendor.name,
      slug: vendor.slug,
      description: vendor.description,
      category: vendor.category,
      isActive: vendor.isActive,
      contactPerson: vendor.contactPerson || '',
      email: vendor.email || '',
      phone: vendor.phone || '',
      website: vendor.website || '',
      instagramHandle: vendor.instagramHandle || '',
      facebookHandle: vendor.facebookHandle || '',
      vendorType: vendor.vendorType,
      businessDescription: vendor.businessDescription || '',
      onlineOrdersEnabled: vendor.onlineOrdersEnabled,
      portalPassword: '',
    },
  })

  const isActive = watch('isActive')
  const onlineOrdersEnabled = watch('onlineOrdersEnabled')

  function onNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value
    setValue('name', name)
    setValue('slug', generateSlug(name))
  }

  function onSubmit(data: VendorFormValues) {
    startTransition(async () => {
      await updateVendor(vendor.id, data)
    })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Vendor</h1>
        <p className="text-sm text-muted-foreground">
          Update the vendor profile for {vendor.name}.
        </p>
      </div>

      <Separator />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="e.g. Sunny Acres Farm"
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
            placeholder="sunny-acres-farm"
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
            placeholder="Tell customers about this vendor..."
            rows={4}
            {...register('description')}
            aria-invalid={!!errors.description}
          />
          {errors.description && (
            <p className="text-sm text-destructive">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <p className="text-sm text-destructive">
                {errors.category.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendorType">Vendor Type</Label>
            <select
              id="vendorType"
              className={selectClass}
              {...register('vendorType')}
              aria-invalid={!!errors.vendorType}
            >
              {MARKET_CONFIG.vendorTypes.map((vt) => (
                <option key={vt.value} value={vt.value}>
                  {vt.label}
                </option>
              ))}
            </select>
            {errors.vendorType && (
              <p className="text-sm text-destructive">
                {errors.vendorType.message}
              </p>
            )}
          </div>
        </div>

        <Separator />

        {/* Contact Info */}
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Contact Info</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contactPerson">Contact Person</Label>
            <Input id="contactPerson" placeholder="Full name" {...register('contactPerson')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="vendor@example.com" {...register('email')} />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" placeholder="(619) 555-0100" {...register('phone')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input id="website" placeholder="https://..." {...register('website')} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="instagramHandle">Instagram Handle</Label>
            <Input id="instagramHandle" placeholder="@handle" {...register('instagramHandle')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="facebookHandle">Facebook</Label>
            <Input id="facebookHandle" placeholder="Page name or URL" {...register('facebookHandle')} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessDescription">Business Description</Label>
          <Textarea
            id="businessDescription"
            placeholder="Longer description of the business, history, etc."
            rows={3}
            {...register('businessDescription')}
          />
        </div>

        <Separator />

        {/* Toggles */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Checkbox
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) =>
                setValue('isActive', checked === true)
              }
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              Active
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="onlineOrdersEnabled"
              checked={onlineOrdersEnabled}
              onCheckedChange={(checked) =>
                setValue('onlineOrdersEnabled', checked === true)
              }
            />
            <Label htmlFor="onlineOrdersEnabled" className="cursor-pointer">
              Online Orders Enabled
            </Label>
          </div>
        </div>

        <Separator />

        {/* Vendor Portal Access */}
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Vendor Portal Access</h3>

        <div className="space-y-2">
          <Label htmlFor="portalPassword">
            {vendor.hashedPassword ? 'Change Portal Password' : 'Set Portal Password'}
          </Label>
          <Input
            id="portalPassword"
            type="password"
            placeholder={vendor.hashedPassword ? 'Leave blank to keep current password' : 'Set a password to enable vendor portal login'}
            {...register('portalPassword')}
          />
          {errors.portalPassword && (
            <p className="text-sm text-destructive">{errors.portalPassword.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {vendor.hashedPassword
              ? 'Portal access is enabled. Leave blank to keep the current password.'
              : 'Set a password to enable this vendor to log in to the vendor portal.'}
          </p>
        </div>

        <Separator />

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button variant="outline" render={<Link href="/admin/vendors" />}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
