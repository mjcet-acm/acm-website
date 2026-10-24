import React from 'react'
import Link from 'next/link'
import { Media } from '@/components/Media'
import { formatEventDate } from '@/utilities/formatDateTime'
import type { Event } from '@/payload-types'
import { Calendar, MapPin, ArrowRight } from 'lucide-react'

export const EventCard: React.FC<{ event: Event }> = ({ event }) => {
  const { title, slug, bannerImage, eventType, startDate, venue, summary } = event

  const typeLabels: Record<string, string> = {
    workshop: 'Workshop',
    hackathon: 'Hackathon',
    contest: 'Coding Contest',
    webinar: 'Tech Talk / Webinar',
    symposium: 'Symposium',
  }

  const isPast = new Date(startDate).getTime() < Date.now()

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
      <Link href={`/events/${slug}`} className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
        {bannerImage && typeof bannerImage === 'object' && (
          <Media
            resource={bannerImage}
            fill
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="rounded-full bg-primary/90 px-3 py-1 text-xs font-semibold text-primary-foreground backdrop-blur-md">
            {typeLabels[eventType] || eventType}
          </span>
          {isPast && (
            <span className="rounded-full bg-muted/90 px-2.5 py-1 text-xs font-medium text-muted-foreground backdrop-blur-md">
              Past
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex flex-col gap-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span>{formatEventDate(startDate)}</span>
          </div>
          {venue && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="truncate">{venue}</span>
            </div>
          )}
        </div>

        <h3 className="mb-2 text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
          <Link href={`/events/${slug}`}>{title}</Link>
        </h3>

        {summary && (
          <p className="mb-6 line-clamp-3 text-sm text-muted-foreground">
            {summary}
          </p>
        )}

        <div className="mt-auto pt-4 border-t border-border/50">
          <Link
            href={`/events/${slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:underline"
          >
            <span>{isPast ? 'View Event Details' : 'Register & View Details'}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </article>
  )
}
