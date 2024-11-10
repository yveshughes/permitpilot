import { Avatar } from '@/components/avatar'
import { Badge } from '@/components/badge'
import { Divider } from '@/components/divider'
import { Heading, Subheading } from '@/components/heading'
import { Select } from '@/components/select'
import { Stat } from '@/components/stat'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table'
import { getForms } from '@/data-forms'

// This would normally come from your backend/database
const getFormProgress = async () => {
  const forms = await getForms()
  return forms.map(form => ({
    ...form,
    progress: Math.floor(Math.random() * 100), // Replace with actual progress data
    lastUpdated: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
  }))
}

export default async function Home() {
  const formProgress = await getFormProgress()
  
  // Calculate stats
  const totalForms = formProgress.length
  const completedForms = formProgress.filter(form => form.progress === 100).length
  const averageProgress = Math.floor(
    formProgress.reduce((acc, form) => acc + form.progress, 0) / totalForms
  )
  const requiredForms = formProgress.filter(form => form.status === 'required').length

  return (
    <>
      <Heading>Good afternoon, Erica</Heading>

      <div className="mt-8 flex items-end justify-between">
        <Subheading>Overview</Subheading>
        <div>
          <Select name="period">
            <option value="last_week">Last week</option>
            <option value="last_two">Last two weeks</option>
            <option value="last_month">Last month</option>
            <option value="last_quarter">Last quarter</option>
          </Select>
        </div>
      </div>

      <div className="mt-4 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
        <Stat 
          title="Total Forms" 
          value={totalForms.toString()} 
          change={`${completedForms} completed`} 
        />
        <Stat 
          title="Average Progress" 
          value={`${averageProgress}%`} 
          change="+5.2%" 
        />
        <Stat 
          title="Required Forms" 
          value={requiredForms.toString()} 
          change={`${Math.floor(requiredForms / totalForms * 100)}% of total`} 
        />
        <Stat 
          title="Days Until Deadline" 
          value="45" 
          change="-2 days" 
        />
      </div>

      <Subheading className="mt-14">Form Progress</Subheading>
      
      <Table className="mt-4 [--gutter:theme(spacing.6)] lg:[--gutter:theme(spacing.10)]">
        <TableHead>
          <TableRow>
            <TableHeader>Form Name</TableHeader>
            <TableHeader>Category</TableHeader>
            <TableHeader>Status</TableHeader>
            <TableHeader>Progress</TableHeader>
            <TableHeader>Last Updated</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {formProgress.map((form) => (
            <TableRow key={form.id} href={`/forms/${form.id}`}>
              <TableCell className="font-medium">{form.name}</TableCell>
              <TableCell className="text-zinc-500">
                {form.category.charAt(0).toUpperCase() + form.category.slice(1)}
              </TableCell>
              <TableCell>
                <Badge 
                  color={form.status === 'required' ? 'red' : 
                         form.status === 'optional' ? 'lime' : 'amber'}
                >
                  {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 rounded-full bg-zinc-100">
                    <div 
                      className={`h-full rounded-full ${
                        form.progress === 100 ? 'bg-green-500' :
                        form.progress >= 70 ? 'bg-lime-500' :
                        form.progress >= 30 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${form.progress}%` }}
                    />
                  </div>
                  <span className="text-sm text-zinc-600">{form.progress}%</span>
                </div>
              </TableCell>
              <TableCell className="text-zinc-500">{form.lastUpdated}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}