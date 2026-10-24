import React from 'react'
import Link from 'next/link'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { EventCard } from '@/components/EventCard'
import type { Event } from '@/payload-types'
import { ArrowRight, CalendarDays } from 'lucide-react'

export async function UpcomingEventsSpotlight() {
  const payload = await getPayload({ config: configPromise })

  const { docs: events } = await payload.find({
    collection: 'events',
    depth: 2,
    limit: 3,
    sort: 'startDate',
    where: {
      and: [
        { _status: { equals: 'published' } },
        { startDate: { greater_than_equal: new Date().toISOString() } },
      ],
    },
  })

  if (events.length === 0) return null

  return (
    <section className="py-16 md:py-20 border-t border-border bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <CalendarDays className="h-4 w-4" />
              <span>Upcoming Spotlight</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Next on our Agenda
            </h2>
          </div>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:underline"
          >
            <span>View All Chapter Events</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event as Event} />
          ))}
        </div>
      </div>
    </section>
  )
}
