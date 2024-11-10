import { Badge } from '@/components/badge'
import { Button } from '@/components/button'
import { Heading, Subheading } from '@/components/heading'
import { Link } from '@/components/link'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table'
import { ChevronLeftIcon } from '@heroicons/react/16/solid'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

interface FormField {
  description: string
}

interface FormSection {
  [key: string]: FormField
}

interface FormData {
  name: string
  description: string
  status: 'Active' | 'Inactive'
  lastUpdated: string
  sections: {
    [key: string]: FormSection
  }
}

interface FormsDataType {
  [key: string]: FormData
}

const formsData: FormsDataType = {
  'ss-4': {
    name: 'SS-4 Form',
    description: 'Application for Employer Identification Number',
    status: 'Active',
    lastUpdated: 'May 15, 2023',
    sections: {
      business_identification: {
        legal_name: { description: 'Legal name of entity' },
        trade_name: { description: 'Trade name if different' }
      },
      contact_information: {
        address: { description: 'Mailing address' },
        phone: { description: 'Business phone number' }
      }
    }
  },
  'fbn': {
    name: 'Fictitious Business Name Statement',
    description: 'Register a business name',
    status: 'Active',
    lastUpdated: 'June 1, 2023',
    sections: {
      business_info: {
        business_name: { description: 'Fictitious Business Name' },
        address: { description: 'Business Address' }
      },
      owner_info: {
        owner_name: { description: "Owner's full name" },
        owner_address: { description: "Owner's address" }
      }
    }
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const form = formsData[params.id as keyof typeof formsData]

  return {
    title: form?.name,
  }
}

export default function FormPage({ params }: { params: { id: string } }) {
  const id = params.id as keyof typeof formsData
  const form = formsData[id]

  if (!form) {
    notFound()
  }

  return (
    <>
      <div className="max-lg:hidden">
        <Link href="/forms" className="inline-flex items-center gap-2 text-sm/6 text-zinc-500 dark:text-zinc-400">
          <ChevronLeftIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />
          Forms
        </Link>
      </div>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Heading>{form.name}</Heading>
            <Badge color={form.status === 'Active' ? 'lime' : 'zinc'}>{form.status}</Badge>
          </div>
          <div className="mt-2 text-sm/6 text-zinc-500">
            {form.description} <span aria-hidden="true">·</span> Last updated: {form.lastUpdated}
          </div>
        </div>
        <div className="flex gap-4">
          <Button outline>Edit</Button>
          <Button>Submit</Button>
        </div>
      </div>
      <form className="mt-8">
        {Object.entries(form.sections).map(([sectionKey, section]) => (
          <div key={sectionKey} className="mb-8">
            <Subheading className="mb-4">{sectionKey.replace('_', ' ').toUpperCase()}</Subheading>
            <Table className="[--gutter:theme(spacing.6)] lg:[--gutter:theme(spacing.10)]">
              <TableBody>
                {Object.entries(section).map(([fieldKey, field]) => (
                  <TableRow key={fieldKey}>
                    <TableCell className="font-medium">{field.description}</TableCell>
                    <TableCell>
                      <input
                        type="text"
                        id={fieldKey}
                        name={fieldKey}
                        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
                        placeholder={field.description}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ))}
      </form>
    </>
  )
}