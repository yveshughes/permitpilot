'use client'

import { Avatar } from '@/components/avatar'
import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from '@/components/dropdown'
import { Navbar, NavbarItem, NavbarSection, NavbarSpacer } from '@/components/navbar'
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarHeading,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
  SidebarSpacer,
} from '@/components/sidebar'
import { SidebarLayout } from '@/components/sidebar-layout'
import DueSoonForms from '@/components/due-soon-forms' // Add this import
import { getEvents } from '@/data'
// ... rest of imports remain the same ...

export function ApplicationLayout({
  events,
  children,
}: {
  events: Awaited<ReturnType<typeof getEvents>>
  children: React.ReactNode
}) {
  let pathname = usePathname()

  return (
    <SidebarLayout
      navbar={/* ... navbar content remains the same ... */}
      sidebar={
        <Sidebar>
          <SidebarHeader>
            {/* ... header content remains the same ... */}
          </SidebarHeader>

          <SidebarBody>
            <SidebarSection>
              {/* ... dashboard items remain the same ... */}
            </SidebarSection>

            <SidebarSection className="max-lg:hidden">
              <SidebarHeading>Recent Forms</SidebarHeading>
              {events.map((event) => (
                <SidebarItem key={event.id} href={event.url}>
                  {event.name}
                </SidebarItem>
              ))}
            </SidebarSection>

            <SidebarSection className="max-lg:hidden">
              <SidebarHeading>Due Soon</SidebarHeading>
              <div className="px-3">
                <DueSoonForms />
              </div>
            </SidebarSection>

            <SidebarSpacer />

            <SidebarSection>
              {/* ... support section remains the same ... */}
            </SidebarSection>
          </SidebarBody>

          <SidebarFooter className="max-lg:hidden">
            {/* ... footer content remains the same ... */}
          </SidebarFooter>
        </Sidebar>
      }
    >
      {children}
    </SidebarLayout>
  )
}