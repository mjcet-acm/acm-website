'use client'

import React from 'react'
import type { Header as HeaderType } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { SearchIcon } from 'lucide-react'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []

  return (
    <nav className="flex gap-4 sm:gap-6 items-center text-sm font-medium">
      {navItems.length > 0 ? (
        navItems.map(({ link }, i) => <CMSLink key={i} {...link} appearance="link" />)
      ) : (
        <>
          <Link href="/events" className="text-foreground/80 hover:text-primary transition-colors">
            Events
          </Link>
          <Link href="/team" className="text-foreground/80 hover:text-primary transition-colors">
            Team
          </Link>
          <Link href="/contact" className="text-foreground/80 hover:text-primary transition-colors">
            Contact
          </Link>
        </>
      )}

      <Link href="/search" className="p-1 text-muted-foreground hover:text-primary transition-colors">
        <span className="sr-only">Search</span>
        <SearchIcon className="w-4 h-4" />
      </Link>
    </nav>
  )
}
