import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

interface CreateForm {
  name: string
  mechanic: string
  userCap: number
  endDate: string
}

export function VendorCampaignCreatePage() {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm<CreateForm>({
    defaultValues: { mechanic: 'shake', userCap: 500 },
  })

  function onSubmit() {
    navigate('/vendor/campaigns')
  }

  return (
    <div className="p-6 lg:p-8 max-w-xl space-y-6">
      <Link to="/vendor/campaigns" className="inline-flex items-center gap-1 text-sm text-v-purple hover:underline no-underline">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <div>
        <h1 className="text-2xl font-extrabold text-v-text">New Campaign</h1>
        <p className="text-v-text-2 text-sm mt-1">Set up a new loyalty mechanic in minutes</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Campaign name</Label>
            <Input id="name" placeholder="Weekend Shake & Win" {...register('name', { required: 'Name is required' })} />
            {errors.name && <p className="text-xs text-v-danger">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mechanic">Mechanic</Label>
            <select
              id="mechanic"
              className="flex h-11 w-full rounded-xl border border-v-border bg-white px-4 text-sm text-v-text focus:outline-none focus:ring-2 focus:ring-v-purple/30"
              {...register('mechanic')}
            >
              <option value="shake">Shake & Win</option>
              <option value="spin">Spin Wheel</option>
              <option value="stamp">Stamp Card</option>
              <option value="lottery">Lottery</option>
              <option value="scratch">Scratch Card</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="userCap">Player cap</Label>
            <Input id="userCap" type="number" {...register('userCap', { valueAsNumber: true, min: 10 })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End date</Label>
            <Input id="endDate" type="date" {...register('endDate', { required: true })} />
          </div>

          <Button type="submit" variant="primary" className="w-full">Create Campaign</Button>
        </form>
      </Card>
    </div>
  )
}
