import React, { cache } from 'react'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { FormBlock } from '@/blocks/Form/Component'
import { formatEventDate } from '@/utilities/formatDateTime'
import { getGoogleCalendarUrl } from '@/utilities/calendar'
import { Calendar, MapPin, Clock, ExternalLink } from 'lucide-react'
import type { Event } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PayloadRedirects } from '@/components/PayloadRedirects'

type Args = {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const events = await payload.find({
    collection: 'events',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  return events.docs.map(({ slug }) => ({ slug }))
}

const queryEventBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'events',
    depth: 2,
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return (result.docs?.[0] as Event) || null
})

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug } = await paramsPromise
  const event = await queryEventBySlug({ slug })

  if (!event) return { title: 'Event Not Found | MJCET ACM' }

  return {
    title: `${event.title} | MJCET ACM Student Chapter`,
    description: event.summary,
    openGraph: {
      title: event.title,
      description: event.summary,
    },
  }
}

export default async function EventDetailPage({ params: paramsPromise }: Args) {
  const { slug } = await paramsPromise
  const { isEnabled: draft } = await draftMode()
  const url = `/events/${slug}`
  const event = await queryEventBySlug({ slug })

  if (!event) return <PayloadRedirects url={url} />

  const { title, bannerImage, eventType, startDate, endDate, locationType, venue, summary, content, registrationForm } = event
  const isPast = new Date(startDate).getTime() < Date.now()

  const googleCalendarUrl = getGoogleCalendarUrl({
    title,
    description: summary,
    venue: venue || 'MJCET, Hyderabad',
    startDate,
    endDate,
  })

  // JSON-LD structured data for Google Search (schema.org/Event)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: title,
    startDate: new Date(startDate).toISOString(),
    endDate: endDate ? new Date(endDate).toISOString() : new Date(startDate).toISOString(),
    eventAttendanceMode:
      locationType === 'online'
        ? 'https://schema.org/OnlineEventAttendanceMode'
        : locationType === 'hybrid'
        ? 'https://schema.org/MixedEventAttendanceMode'
        : 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: {
      '@type': 'Place',
      name: venue || 'Muffakham Jah College of Engineering and Technology',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Hyderabad',
        addressRegion: 'Telangana',
        addressCountry: 'IN',
      },
    },
    image: typeof bannerImage === 'object' && bannerImage?.url ? [`${getServerSideURL()}${bannerImage.url}`] : undefined,
    description: summary,
    organizer: {
      '@type': 'Organization',
      name: 'MJCET ACM Student Chapter',
      url: getServerSideURL(),
    },
  }

  return (
    <article className="py-12 md:py-20">
      <PayloadRedirects disableNotFound url={url} />
      {draft && <LivePreviewListener />}

      {/* Schema.org JSON-LD microdata for global search standards */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container mx-auto px-4 max-w-4xl">
        {/* Banner Image */}
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border bg-muted mb-8 shadow-md">
          {bannerImage && typeof bannerImage === 'object' && (
            <Media resource={bannerImage} fill className="h-full w-full object-cover" />
          )}
        </div>

        {/* Badges & Meta */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase">
            {eventType}
          </span>
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground capitalize">
            {locationType}
          </span>
          {isPast && (
            <span className="rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1 text-xs font-medium">
              Event Concluded
            </span>
          )}
        </div>

        <h1 className="mb-6 text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          {title}
        </h1>

        {/* Date, Time, Venue & Calendar Card */}
        <div className="mb-10 grid grid-cols-1 gap-4 rounded-xl border border-border bg-card p-6 sm:grid-cols-2">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Calendar className="h-4 w-4 text-primary shrink-0" />
              <span className="font-medium">{formatEventDate(startDate)}</span>
            </div>
            {endDate && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 text-primary shrink-0" />
                <span>Ends: {formatEventDate(endDate)}</span>
              </div>
            )}
            {venue && (
              <div className="flex items-center gap-2 text-sm text-foreground">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span>{venue}</span>
              </div>
            )}
          </div>

          <div className="flex items-center sm:justify-end">
            {!isPast && (
              <a
                href={googleCalendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
              >
                <Calendar className="h-4 w-4" />
                <span>Add to Google Calendar</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Summary */}
        {summary && (
          <div className="mb-8 rounded-lg bg-muted/50 p-5 text-base italic text-muted-foreground border-l-4 border-primary">
            {summary}
          </div>
        )}

        {/* Rich Text Agenda/Content */}
        {content && (
          <div className="prose dark:prose-invert max-w-none mb-14">
            <RichText data={content} />
          </div>
        )}

        {/* Native Registration Form */}
        {registrationForm && typeof registrationForm === 'object' && !isPast && (
          <div className="mt-12 rounded-2xl border border-primary/20 bg-card p-8 shadow-sm">
            <div className="mb-6 border-b pb-4">
              <h2 className="text-2xl font-bold tracking-tight">Register for this Event</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Fill out the form below to reserve your seat. Submissions are processed directly by MJCET ACM.
              </p>
            </div>
            <FormBlock
              form={registrationForm as any}
              enableIntro={false}
            />
          </div>
        )}
      </div>
    </article>
  )
}
