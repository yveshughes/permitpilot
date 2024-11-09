import React from 'react'

interface StatProps {
  title: string
  value: string | number
  change?: string | number
}

export function Stat({ title, value, change }: StatProps) {
  return (
    <div className="stat">
      <h3>{title}</h3>
      <p>{value}</p>
      {change && <span>{change}</span>}
    </div>
  )
}