'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { useState, useTransition } from 'react'
import { updateVendorProfile, changeVendorPassword } from './actions'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  businessDescription: z.string().optional(),
  contactPerson: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  website: z.string().optional(),
  instagramHandle: z.string().optional(),
  facebookHandle: z.string().optional(),
  vendorNotes: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

interface VendorProfileFormProps {
  vendor: {
    name: string
    description: string
    businessDescription: string | null
    contactPerson: string | null
    email: string | null
    phone: string | null
    website: string | null
    instagramHandle: string | null
    facebookHandle: string | null
    vendorNotes: string | null
  }
}

export function VendorProfileForm({ vendor }: VendorProfileFormProps) {
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [pwPending, setPwPending] = useState(false)
  const [pwMessage, setPwMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: standardSchemaResolver(profileSchema),
    defaultValues: {
      name: vendor.name,
      description: vendor.description,
      businessDescription: vendor.businessDescription || '',
      contactPerson: vendor.contactPerson || '',
      email: vendor.email || '',
      phone: vendor.phone || '',
      website: vendor.website || '',
      instagramHandle: vendor.instagramHandle || '',
      facebookHandle: vendor.facebookHandle || '',
      vendorNotes: vendor.vendorNotes || '',
    },
  })

  function onSubmit(data: ProfileFormValues) {
    setSaved(false)
    startTransition(async () => {
      await updateVendorProfile(data)
      setSaved(true)
    })
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setPwMessage({ type: 'error', text: 'Passwords do not match' })
      return
    }
    if (newPassword.length < 6) {
      setPwMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      return
    }

    setPwPending(true)
    setPwMessage(null)
    try {
      const result = await changeVendorPassword({
        currentPassword,
        newPassword,
      })
      if (result.error) {
        setPwMessage({ type: 'error', text: result.error })
      } else {
        setPwMessage({ type: 'success', text: 'Password changed successfully' })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch {
      setPwMessage({ type: 'error', text: 'Failed to change password' })
    } finally {
      setPwPending(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Business Name</Label>
          <Input
            id="name"
            {...register('name')}
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Short Description</Label>
          <Textarea
            id="description"
            rows={3}
            {...register('description')}
            aria-invalid={!!errors.description}
          />
          {errors.description && (
            <p className="text-sm text-destructive">{errors.description.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessDescription">Business Description</Label>
          <Textarea
            id="businessDescription"
            rows={4}
            placeholder="Tell your story..."
            {...register('businessDescription')}
          />
        </div>

        <Separator />

        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Contact Info
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contactPerson">Contact Person</Label>
            <Input id="contactPerson" {...register('contactPerson')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register('phone')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input id="website" {...register('website')} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="instagramHandle">Instagram</Label>
            <Input id="instagramHandle" placeholder="@handle" {...register('instagramHandle')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="facebookHandle">Facebook</Label>
            <Input id="facebookHandle" {...register('facebookHandle')} />
          </div>
        </div>

        <Separator />

        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Private Notes
        </h3>

        <div className="space-y-2">
          <Label htmlFor="vendorNotes">Your Notes</Label>
          <Textarea
            id="vendorNotes"
            rows={4}
            placeholder="Private notes for your own reference..."
            {...register('vendorNotes')}
          />
          <p className="text-xs text-muted-foreground">
            These notes are private and only visible to you.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Profile'}
          </Button>
          {saved && (
            <p className="text-sm text-green-600">Profile saved! Changes are now live.</p>
          )}
        </div>
      </form>

      <Separator />

      <div>
        <h2 className="text-lg font-semibold text-market-soil mb-4">Change Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-sm">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {pwMessage && (
            <p className={`text-sm ${pwMessage.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
              {pwMessage.text}
            </p>
          )}
          <Button type="submit" variant="outline" disabled={pwPending}>
            {pwPending ? 'Changing...' : 'Change Password'}
          </Button>
        </form>
      </div>
    </div>
  )
}
