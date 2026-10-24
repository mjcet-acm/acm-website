import React from 'react'
import Link from 'next/link'
import { Terminal, Users, Sparkles, BookOpen, ArrowRight } from 'lucide-react'

export function AboutSection() {
  const highlights = [
    {
      icon: Terminal,
      title: 'Technical Hands-on Workshops',
      description: 'Practical, industry-aligned bootcamps covering Full-Stack, AI/ML, Cloud, and Competitive Coding.',
    },
    {
      icon: Sparkles,
      title: 'Hackathons & Contests',
      description: 'Challenging hackathons and algorithmic contests that encourage creative problem-solving.',
    },
    {
      icon: Users,
      title: 'Peer Mentorship & Community',
      description: 'A vibrant collective of student engineers across all years supporting each other’s growth.',
    },
    {
      icon: BookOpen,
      title: 'Global ACM Association',
      description: 'Chartered under the global Association for Computing Machinery, connecting students with global standards.',
    },
  ]

  return (
    <section className="py-20 md:py-28 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <span className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            About MJCET ACM
          </span>
          <h2 className="mb-4 text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
            Fostering Computing as a Science & Profession
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Chartered at Muffakham Jah College of Engineering and Technology, Hyderabad, our chapter serves
            as the flagship technical student community empowering future engineers, researchers, and creators.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-14">
          {highlights.map((item, idx) => {
            const Icon = item.icon
            return (
              <div
                key={idx}
                className="rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-md"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-foreground tracking-tight">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            )
          })}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-center">
          <Link
            href="/team"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
          >
            <span>Meet Our Leadership Team</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-all hover:bg-accent"
          >
            <span>Get in Touch / Join</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
