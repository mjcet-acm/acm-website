import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'
import { Instagram, Linkedin, Github, Mail, MapPin } from 'lucide-react'

export async function Footer() {
  const footerData = await getCachedGlobal('footer', 1)()
  const navItems = footerData?.navItems || []

  return (
    <footer className="mt-auto border-t border-border bg-card text-card-foreground">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Chapter Bio & Affiliation */}
          <div className="space-y-4 md:col-span-2">
            <Link className="inline-block" href="/">
              <Logo />
            </Link>
            <p className="max-w-md text-sm text-muted-foreground leading-relaxed">
              MJCET ACM Student Chapter is the premier computing and technological student body at
              Muffakham Jah College of Engineering & Technology, fostering innovation, peer learning, and
              hands-on engineering.
            </p>
            <p className="text-xs text-muted-foreground/80">
              An officially recognized student chapter of the{' '}
              <a
                href="https://www.acm.org"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary"
              >
                Association for Computing Machinery (ACM)
              </a>
              .
            </p>
          </div>

          {/* Quick Navigation Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Navigation
            </h4>
            <nav className="flex flex-col space-y-2.5 text-sm">
              <Link href="/" className="text-muted-foreground transition-colors hover:text-primary">
                Home
              </Link>
              <Link href="/events" className="text-muted-foreground transition-colors hover:text-primary">
                Events & Workshops
              </Link>
              <Link href="/team" className="text-muted-foreground transition-colors hover:text-primary">
                Our Team
              </Link>
              <Link href="/contact" className="text-muted-foreground transition-colors hover:text-primary">
                Contact & Join Us
              </Link>
              {navItems.map(({ link }, i) => (
                <CMSLink key={i} {...link} className="text-muted-foreground hover:text-primary" />
              ))}
            </nav>
          </div>

          {/* Contact & Socials */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Connect With Us
            </h4>
            <div className="flex flex-col space-y-2.5 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <span className="text-xs leading-relaxed">
                  Mount Pleasant, 8-2-249 to 267, Road No. 3, Banjara Hills, Hyderabad, Telangana 500034
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <a href="mailto:acm@mjcet.ac.in" className="text-xs hover:text-primary">
                  acm@mjcet.ac.in
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 text-muted-foreground">
              <a
                href="https://linkedin.com/company/mjcetacm"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-border p-2 transition-colors hover:border-primary hover:text-primary"
                aria-label="MJCET ACM LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="https://instagram.com/mjcetacm"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-border p-2 transition-colors hover:border-primary hover:text-primary"
                aria-label="MJCET ACM Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://github.com/mjcet-acm"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-border p-2 transition-colors hover:border-primary hover:text-primary"
                aria-label="MJCET ACM GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} MJCET ACM Student Chapter. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <ThemeSelector />
          </div>
        </div>
      </div>
    </footer>
  )
}
