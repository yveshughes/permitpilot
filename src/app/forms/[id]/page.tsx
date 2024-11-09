import { Badge } from '@/components/badge'
import { Button } from '@/components/button'
import { Heading, Subheading } from '@/components/heading'
import { Link } from '@/components/link'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table'
import { getForm } from '@/data-forms'
import { ChevronLeftIcon } from '@heroicons/react/16/solid'
import { BuildingLibraryIcon, DocumentTextIcon, GlobeAmericasIcon } from '@heroicons/react/24/outline'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  let form = await getForm(params.id)
  return {
    title: form?.name,
  }
}

function getBadgeColor(status: string) {
  switch (status) {
    case 'required':
      return 'red'
    case 'conditional':
      return 'amber'
    default:
      return 'zinc'
  }
}

function getJurisdictionIcon(jurisdiction: string) {
  switch (jurisdiction) {
    case 'federal':
      return <BuildingLibraryIcon className="h-5 w-5" />
    case 'state':
      return <GlobeAmericasIcon className="h-5 w-5" />
    case 'local':
      return <DocumentTextIcon className="h-5 w-5" />
    default:
      return null
  }
}

export default async function Form({ params }: { params: { id: string } }) {
  let form = await getForm(params.id)

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
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
            {getJurisdictionIcon(form.jurisdiction)}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <Heading>{form.name}</Heading>
              <Badge color={getBadgeColor(form.status)}>{form.status}</Badge>
            </div>
            <div className="mt-2 text-sm/6 text-zinc-500">
              {form.governingBody}
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <Button href={form.resourceUrl} target="_blank" rel="noopener noreferrer">
            View Resource
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-6">
        <div className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
          <Subheading className="mb-4">
            Details
          </Subheading>
          <dl className="grid gap-4">
            <div>
              <dt className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Description</dt>
              <dd className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{form.description}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Category</dt>
              <dd className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {form.category.charAt(0).toUpperCase() + form.category.slice(1)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Jurisdiction</dt>
              <dd className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {form.jurisdiction.charAt(0).toUpperCase() + form.jurisdiction.slice(1)}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-8">
        <div className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
          <Subheading className="mb-4">
            Requirements
          </Subheading>
          <div className="prose prose-zinc dark:prose-invert">
            <p>{form.description}</p>
            <p>
              For more information and to access required forms, please visit the{' '}
              <Link href={form.resourceUrl} target="_blank" rel="noopener noreferrer">
                official resource page
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  )
}