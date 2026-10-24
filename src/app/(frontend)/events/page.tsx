import React from 'react'
import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { EventCard } from '@/components/EventCard'
import type { Event } from '@/payload-types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Events & Workshops | MJCET ACM Student Chapter',
  description:
    'Explore upcoming workshops, hackathons, coding contests, and guest lectures hosted by the MJCET ACM Student Chapter.',
}

export default async function EventsPage() {
  const payload = await getPayload({ config: configPromise })

  const { docs: events } = await payload.find({
    collection: 'events',
    depth: 2,
    limit: 100,
    sort: 'startDate',
    where: {
      _status: {
        equals: 'published',
      },
    },
  })

  const now = new Date().getTime()
  const upcomingEvents = events.filter((e) => new Date(e.startDate).getTime() >= now)
  const pastEvents = events
    .filter((e) => new Date(e.startDate).getTime() < now)
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())

  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <span className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            Chapter Gatherings & Contests
          </span>
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Events & Workshops
          </h1>
          <p className="text-lg text-muted-foreground">
            Hands-on technical workshops, competitive programming contests, and flagship hackathons
            organized by the MJCET ACM Student Chapter.
          </p>
        </div>

        {/* Upcoming Events */}
        <section className="mb-20">
          <div className="mb-8 flex items-center justify-between border-b pb-4">
            <h2 className="text-2xl font-bold tracking-tight">Upcoming Events</h2>
            <span className="text-sm font-medium text-muted-foreground">
              {upcomingEvents.length} {upcomingEvents.length === 1 ? 'event' : 'events'}
            </span>
          </div>

          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event as Event} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-12 text-center">
              <p className="text-muted-foreground">
                No upcoming events scheduled right now. Check back soon or stay tuned to our social channels!
              </p>
            </div>
          )}
        </section>

        {/* Past Events Archive */}
        {pastEvents.length > 0 && (
          <section>
            <div className="mb-8 flex items-center justify-between border-b pb-4">
              <h2 className="text-2xl font-bold tracking-tight">Past Events Archive</h2>
              <span className="text-sm font-medium text-muted-foreground">
                {pastEvents.length} {pastEvents.length === 1 ? 'event' : 'events'}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {pastEvents.map((event) => (
                <EventCard key={event.id} event={event as Event} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
