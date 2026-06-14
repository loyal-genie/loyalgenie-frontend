import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { business } from '@/lib/mock-data'

interface SettingsForm {
  name: string
  category: string
  email: string
  phone: string
  address: string
  city: string
}

export function VendorSettingsPage() {
  const { register, handleSubmit } = useForm<SettingsForm>({
    defaultValues: business,
  })

  function onSubmit(data: SettingsForm) {
    console.log('Settings saved', data)
  }

  return (
    <div className="p-6 lg:p-8 max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-v-text">Settings</h1>
        <p className="text-v-text-2 text-sm mt-1">Manage your business profile and preferences</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {[
            { id: 'name', label: 'Business name' },
            { id: 'category', label: 'Category' },
            { id: 'email', label: 'Email', type: 'email' },
            { id: 'phone', label: 'Phone' },
            { id: 'address', label: 'Address' },
            { id: 'city', label: 'City' },
          ].map((f) => (
            <div key={f.id} className="space-y-2">
              <Label htmlFor={f.id}>{f.label}</Label>
              <Input id={f.id} type={f.type ?? 'text'} {...register(f.id as keyof SettingsForm)} />
            </div>
          ))}
          <Button type="submit" variant="primary">Save Changes</Button>
        </form>
      </Card>
    </div>
  )
}
