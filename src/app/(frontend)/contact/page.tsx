import React from 'react'
import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { FormBlock } from '@/blocks/Form/Component'
import { Mail, MapPin, Building2, ExternalLink, MessageSquare } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Contact Us | MJCET ACM Student Chapter',
  description:
    'Get in touch with the ACM Student Chapter at Muffakham Jah College of Engineering and Technology (MJCET), Hyderabad.',
}

export default async function ContactPage() {
  const payload = await getPayload({ config: configPromise })

  // Look for a contact form in Payload CMS
  const { docs: forms } = await payload.find({
    collection: 'forms',
    depth: 1,
    limit: 1,
    where: {
      title: {
        contains: 'Contact',
      },
    },
  })

  const contactForm = forms[0] || null

  return (
    <div className="container py-12 md:py-16 max-w-5xl">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold uppercase tracking-wider">
          <MessageSquare className="w-3.5 h-3.5" />
          Get In Touch
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          Contact MJCET ACM Chapter
        </h1>
        <p className="mt-4 text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
          Have queries about upcoming events, student membership, workshops, or collaboration opportunities? Reach out to our leadership team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Contact Info Card */}
        <div className="md:col-span-5 flex flex-col gap-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold tracking-tight mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Chapter Headquarters
            </h2>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3 text-muted-foreground">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Muffakham Jah College of Engineering & Technology</p>
                  <p>Mount Pleasant, 8-2-249 to 267,</p>
                  <p>Road No. 3, Banjara Hills,</p>
                  <p>Hyderabad, Telangana 500034</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-muted-foreground pt-3 border-t">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Official Email</p>
                  <a
                    href="mailto:acm@mjcollege.ac.in"
                    className="text-foreground font-medium hover:text-primary transition-colors"
                  >
                    acm@mjcollege.ac.in
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Student Chapter Affiliation Card */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 text-sm">
            <h3 className="font-semibold text-foreground mb-2 flex items-center justify-between">
              ACM Global Affiliation
              <ExternalLink className="w-4 h-4 text-primary" />
            </h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              MJCET ACM is an officially chartered Student Chapter under the Association for Computing Machinery (ACM), the world&apos;s largest educational and scientific computing society.
            </p>
            <div className="mt-4 pt-3 border-t border-primary/10 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Chapter Type:</span>
              <span className="font-medium text-foreground">ACM Student Chapter</span>
            </div>
          </div>
        </div>

        {/* Form Column */}
        <div className="md:col-span-7">
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold tracking-tight mb-2">Send us a Message</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Our chapter officers will respond to your query as soon as possible.
            </p>

            {contactForm ? (
              <FormBlock form={contactForm as any} enableIntro={false} />
            ) : (
              <div className="py-8 text-center border rounded-xl border-dashed">
                <Mail className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground">Direct Email Inquiry</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  To reach our governing body directly, please send your email to{' '}
                  <a href="mailto:acm@mjcollege.ac.in" className="text-primary underline">
                    acm@mjcollege.ac.in
                  </a>
                  . You can also configure the Contact Form in the Payload CMS Admin panel.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
