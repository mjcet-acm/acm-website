import React from 'react'
import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { Media } from '@/components/Media'
import type { Team as TeamMember } from '@/payload-types'
import { Linkedin, Github, Twitter, Globe, User } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Our Team & Leadership | MJCET ACM Student Chapter',
  description:
    'Meet the Governing Body and Departmental Team Leads driving the MJCET ACM Student Chapter.',
}

export default async function TeamPage() {
  const payload = await getPayload({ config: configPromise })

  const { docs: allMembers } = await payload.find({
    collection: 'team',
    depth: 1,
    limit: 200,
    sort: 'order',
    where: {
      _status: {
        equals: 'published',
      },
    },
  })

  // Separate Governing Body vs Departmental Team
  const governingBody = allMembers.filter((m) => m.tier === 'governingBody')
  const departmentalMembers = allMembers.filter((m) => m.tier === 'teamMember')

  // Group departmental members by department
  const departments = [
    { key: 'technical', label: 'Technical Department' },
    { key: 'design', label: 'Design & Creative Department' },
    { key: 'prMedia', label: 'PR & Media Department' },
    { key: 'operations', label: 'Operations & Logistics Department' },
  ]

  const MemberCard = ({ member, isGoverning = false }: { member: TeamMember; isGoverning?: boolean }) => {
    const { name, role, photo, socials } = member

    return (
      <div
        className={`group flex flex-col items-center text-center rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-lg ${
          isGoverning ? 'sm:p-8' : ''
        }`}
      >
        {/* Photo Container */}
        <div
          className={`relative mb-5 overflow-hidden rounded-full border-2 border-primary/20 bg-muted transition-transform duration-300 group-hover:scale-105 ${
            isGoverning ? 'h-36 w-36 sm:h-44 sm:w-44' : 'h-28 w-28 sm:h-32 sm:w-32'
          }`}
        >
          {photo && typeof photo === 'object' ? (
            <Media resource={photo} fill className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
              <User className={isGoverning ? 'h-16 w-16' : 'h-12 w-12'} />
            </div>
          )}
        </div>

        {/* Member Details */}
        <h3 className={`font-bold text-foreground tracking-tight ${isGoverning ? 'text-xl sm:text-2xl mb-1' : 'text-lg mb-0.5'}`}>
          {name}
        </h3>
        <p className={`text-primary font-medium mb-4 ${isGoverning ? 'text-base' : 'text-sm'}`}>
          {role}
        </p>

        {/* Social Links */}
        {socials && (
          <div className="mt-auto flex items-center gap-3 pt-2 text-muted-foreground">
            {socials.linkedin && (
              <a
                href={socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-primary"
                aria-label={`${name}'s LinkedIn`}
              >
                <Linkedin className="h-4 w-4" />
              </a>
            )}
            {socials.github && (
              <a
                href={socials.github}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-primary"
                aria-label={`${name}'s GitHub`}
              >
                <Github className="h-4 w-4" />
              </a>
            )}
            {socials.twitter && (
              <a
                href={socials.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-primary"
                aria-label={`${name}'s X`}
              >
                <Twitter className="h-4 w-4" />
              </a>
            )}
            {socials.portfolio && (
              <a
                href={socials.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-primary"
                aria-label={`${name}'s Website`}
              >
                <Globe className="h-4 w-4" />
              </a>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="mx-auto max-w-3xl text-center mb-20">
          <span className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            Leadership & Committees
          </span>
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Meet the Team
          </h1>
          <p className="text-lg text-muted-foreground">
            The passionate students and faculty advisors spearheading initiatives, technical workshops,
            and hackathons at the MJCET ACM Student Chapter.
          </p>
        </div>

        {/* Governing Body Section */}
        {governingBody.length > 0 && (
          <section className="mb-24">
            <div className="mx-auto mb-12 text-center max-w-2xl">
              <h2 className="text-3xl font-extrabold tracking-tight mb-2">Governing Body</h2>
              <p className="text-muted-foreground text-sm">
                Executive officers overseeing chapter governance, strategy, and student community operations.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              {governingBody.map((member) => (
                <MemberCard key={member.id} member={member as TeamMember} isGoverning={true} />
              ))}
            </div>
          </section>
        )}

        {/* Departmental Teams Section */}
        {departmentalMembers.length > 0 && (
          <section>
            <div className="mx-auto mb-16 text-center max-w-2xl">
              <h2 className="text-3xl font-extrabold tracking-tight mb-2">Departmental Teams</h2>
              <p className="text-muted-foreground text-sm">
                Core leads and organizers driving our technical domains, creative branding, and operations.
              </p>
            </div>

            <div className="space-y-16">
              {departments.map((dept) => {
                const deptMembers = departmentalMembers.filter((m) => m.department === dept.key)
                if (deptMembers.length === 0) return null

                return (
                  <div key={dept.key} className="space-y-8">
                    <div className="border-b pb-3">
                      <h3 className="text-xl font-bold tracking-tight text-foreground">
                        {dept.label}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                      {deptMembers.map((member) => (
                        <MemberCard key={member.id} member={member as TeamMember} />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Empty State */}
        {allMembers.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-16 text-center">
            <p className="text-muted-foreground text-lg">
              Team roster is currently being updated for the current academic session. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
