'use client'

import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid'

interface StatProps {
  title: string
  value: string
  change?: string
}

export function Stat({ title, value, change }: StatProps) {
  let isPositive = change?.startsWith('+')
  let isNegative = change?.startsWith('-')

  return (
    <div className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
      <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</div>
      <div className="mt-3 flex items-end justify-between">
        <div className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          {value}
        </div>
        {change && (
          <div
            className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
              isPositive
                ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-400/20'
                : isNegative
                ? 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-400/20'
                : 'bg-zinc-50 text-zinc-700 ring-zinc-600/20 dark:bg-zinc-500/10 dark:text-zinc-400 dark:ring-zinc-400/20'
            }`}
          >
            {isPositive ? (
              <ArrowUpIcon className="size-3 stroke-2" />
            ) : isNegative ? (
              <ArrowDownIcon className="size-3 stroke-2" />
            ) : null}
            {change}
          </div>
        )}
      </div>
    </div>
  )
}