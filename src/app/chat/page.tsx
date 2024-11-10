import { Avatar } from '@/components/avatar'
import { Badge } from '@/components/badge'
import { Divider } from '@/components/divider'
import { Heading, Subheading } from '@/components/heading'
import { Select } from '@/components/select'
import { Stat } from '@/components/stat'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table'
import { getRecentOrders } from '@/data'

export default async function Home() {
  let orders = await getRecentOrders()
  return (
    <>
      <Heading>AI Chat</Heading>
    </>
  )
}