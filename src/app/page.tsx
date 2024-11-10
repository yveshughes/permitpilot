import { Badge } from '@/components/badge'
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
  
  // Calculate completion stats for each frequency
  const getCompletionStats = (forms) => {
    const completed = forms.filter(form => form.progress === 100).length
    const total = forms.length
    return { completed, total }
  }

  const allStats = getCompletionStats(formProgress)
  const onceStats = getCompletionStats(formProgress.filter(f => f.frequency === 'Once'))
  const annualStats = getCompletionStats(formProgress.filter(f => f.frequency === 'Annual'))
  const miscStats = getCompletionStats(formProgress.filter(f => f.frequency === 'Miscellaneous'))

  return (
    <>
      <Heading>Good afternoon, Erica</Heading>

      <div className="mt-8 flex items-end justify-between">
        <Subheading>Overview</Subheading>
        <div>
          <Select name="period">
            <option value="current_quarter">Current Quarter</option>
            <option value="next_quarter">Next Quarter</option>
            <option value="current_year">Current Year</option>
          </Select>
        </div>
      </div>

      <div className="mt-4 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
        <Stat 
          title="All Forms" 
          value={`${allStats.completed} of ${allStats.total}`}
          change="completed" 
        />
        <Stat 
          title="One-time Forms" 
          value={`${onceStats.completed} of ${onceStats.total}`}
          change="completed" 
        />
        <Stat 
          title="Annual Forms" 
          value={`${annualStats.completed} of ${annualStats.total}`}
          change="completed" 
        />
        <Stat 
          title="Miscellaneous Forms" 
          value={`${miscStats.completed} of ${miscStats.total}`}
          change="completed" 
        />
      </div>

      <Subheading className="mt-14">Form Progress</Subheading>
      
      <Table className="mt-4 [--gutter:theme(spacing.6)] lg:[--gutter:theme(spacing.10)]">
        <TableHead>
          <TableRow>
            <TableHeader>Form Name</TableHeader>
            <TableHeader>Category</TableHeader>
            <TableHeader>Frequency</TableHeader>
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
              <TableCell className="text-zinc-500">
                {form.frequency}
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