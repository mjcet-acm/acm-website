import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { defaultLexical } from '@/fields/defaultLexical'
import { revalidateDeleteEvent, revalidateEvent } from './hooks/revalidateEvent'

export const Events: CollectionConfig = {
  slug: 'events',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'eventType', 'startDate', '_status'],
  },
  versions: {
    drafts: true,
  },
  hooks: {
    afterChange: [revalidateEvent],
    afterDelete: [revalidateDeleteEvent],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField(),
    {
      type: 'row',
      fields: [
        {
          name: 'eventType',
          type: 'select',
          required: true,
          defaultValue: 'workshop',
          options: [
            { label: 'Workshop', value: 'workshop' },
            { label: 'Hackathon', value: 'hackathon' },
            { label: 'Coding Contest', value: 'contest' },
            { label: 'Tech Talk / Webinar', value: 'webinar' },
            { label: 'Flagship Symposium', value: 'symposium' },
          ],
          admin: {
            width: '50%',
          },
        },
        {
          name: 'locationType',
          type: 'select',
          defaultValue: 'in-person',
          options: [
            { label: 'In-Person', value: 'in-person' },
            { label: 'Online', value: 'online' },
            { label: 'Hybrid', value: 'hybrid' },
          ],
          admin: {
            width: '50%',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'startDate',
          type: 'date',
          required: true,
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
            width: '50%',
          },
        },
        {
          name: 'endDate',
          type: 'date',
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
            width: '50%',
          },
        },
      ],
    },
    {
      name: 'venue',
      type: 'text',
      label: 'Venue / Platform',
      admin: {
        placeholder: 'e.g., Ghulam Ahmed Hall, MJCET / Google Meet',
      },
    },
    {
      name: 'bannerImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'summary',
      type: 'textarea',
      label: 'Short Summary (Card Preview)',
      required: true,
    },
    {
      name: 'content',
      type: 'richText',
      editor: defaultLexical,
      label: 'Event Details & Agenda',
    },
    {
      name: 'registrationForm',
      type: 'relationship',
      relationTo: 'forms',
      label: 'Native Registration Form (Built with Form Builder)',
      admin: {
        position: 'sidebar',
        description: 'Select a form created in Form Builder to enable direct on-site registration.',
      },
    },
  ],
}
