'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { useTransition, useState } from 'react'
import { MARKET_CONFIG } from '@/config/market.config'
import { submitVendorApplication } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { CheckCircle2 } from 'lucide-react'

const applicationSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  contactPerson: z.string().min(1, 'Contact person is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  website: z.string().optional(),
  instagramHandle: z.string().optional(),
  facebookHandle: z.string().optional(),
  vendorType: z.string().min(1, 'Vendor type is required'),
  productsDescription: z.string().optional(),
  businessDescription: z.string().optional(),
})

type ApplicationFormValues = z.infer<typeof applicationSchema>

const selectClass = 'flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

export default function ApplyPage() {
  const [isPending, startTransition] = useTransition()
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplicationFormValues>({
    resolver: standardSchemaResolver(applicationSchema),
    defaultValues: {
      businessName: '',
      contactPerson: '',
      email: '',
      phone: '',
      website: '',
      instagramHandle: '',
      facebookHandle: '',
      vendorType: 'certified_farmer',
      productsDescription: '',
      businessDescription: '',
    },
  })

  function onSubmit(data: ApplicationFormValues) {
    startTransition(async () => {
      const result = await submitVendorApplication(data)
      if (result.success) {
        setSubmitted(true)
      }
    })
  }

  if (submitted) {
    return (
      <section className="container-market py-16">
        <div className="max-w-md mx-auto text-center">
          <CheckCircle2 className="w-16 h-16 text-market-sage mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-market-soil mb-3">
            Application Submitted!
          </h1>
          <p className="text-muted-foreground">
            Thank you for your interest in joining {MARKET_CONFIG.marketName}.
            Our team will review your application and get back to you soon.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="container-market py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-3xl font-bold text-market-soil mb-2">
          Become a Vendor
        </h1>
        <p className="text-muted-foreground mb-8">
          Interested in selling at {MARKET_CONFIG.marketName}? Fill out the application below
          and our team will be in touch.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                placeholder="Your farm or business name"
                {...register('businessName')}
                aria-invalid={!!errors.businessName}
              />
              {errors.businessName && (
                <p className="text-sm text-destructive">{errors.businessName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person *</Label>
              <Input
                id="contactPerson"
                placeholder="Full name"
                {...register('contactPerson')}
                aria-invalid={!!errors.contactPerson}
              />
              {errors.contactPerson && (
                <p className="text-sm text-destructive">{errors.contactPerson.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register('email')}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                placeholder="(619) 555-0100"
                {...register('phone')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendorType">Vendor Type *</Label>
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
              <p className="text-sm text-destructive">{errors.vendorType.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="productsDescription">What products will you sell?</Label>
            <Textarea
              id="productsDescription"
              placeholder="Describe the products you'd bring to the market..."
              rows={3}
              {...register('productsDescription')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessDescription">About Your Business</Label>
            <Textarea
              id="businessDescription"
              placeholder="Tell us about your business, how long you've been operating, etc."
              rows={3}
              {...register('businessDescription')}
            />
          </div>

          <Separator />

          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Online Presence (optional)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" placeholder="https://..." {...register('website')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagramHandle">Instagram</Label>
              <Input id="instagramHandle" placeholder="@handle" {...register('instagramHandle')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="facebookHandle">Facebook</Label>
            <Input id="facebookHandle" placeholder="Page name or URL" {...register('facebookHandle')} />
          </div>

          <Separator />

          <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
            {isPending ? 'Submitting...' : 'Submit Application'}
          </Button>
        </form>
      </div>
    </section>
  )
}
