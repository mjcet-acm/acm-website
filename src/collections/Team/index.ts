import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { revalidateDeleteTeam, revalidateTeam } from './hooks/revalidateTeam'

export const Team: CollectionConfig = {
  slug: 'team',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'tier', 'department', 'academicYear', 'order', '_status'],
  },
  versions: {
    drafts: true,
  },
  hooks: {
    afterChange: [revalidateTeam],
    afterDelete: [revalidateDeleteTeam],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'text',
      label: 'Designation / Role',
      admin: {
        placeholder: 'e.g., Chairperson, Vice-Chair, Technical Lead, Webmaster',
      },
      required: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'tier',
          type: 'select',
          required: true,
          defaultValue: 'teamMember',
          options: [
            { label: 'Governing Body', value: 'governingBody' },
            { label: 'Departmental Team', value: 'teamMember' },
          ],
          admin: {
            width: '50%',
          },
        },
        {
          name: 'department',
          type: 'select',
          options: [
            { label: 'Technical', value: 'technical' },
            { label: 'Design & Creative', value: 'design' },
            { label: 'PR & Media', value: 'prMedia' },
            { label: 'Operations & Logistics', value: 'operations' },
          ],
          admin: {
            width: '50%',
            condition: (_, { tier } = {}) => tier === 'teamMember',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'academicYear',
          type: 'text',
          label: 'Academic Year',
          defaultValue: '2026-2027',
          required: true,
          admin: {
            width: '50%',
            description: 'Format: YYYY-YYYY (e.g., 2026-2027). Used for historical filtering.',
          },
        },
        {
          name: 'order',
          type: 'number',
          label: 'Display Order (Ascending)',
          defaultValue: 10,
          admin: {
            width: '50%',
            description: 'Lower numbers display first (e.g. 1 for Chair, 2 for Vice Chair).',
          },
        },
      ],
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'socials',
      type: 'group',
      label: 'Social Profiles',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'linkedin',
              type: 'text',
              label: 'LinkedIn Profile URL',
              admin: {
                placeholder: 'https://linkedin.com/in/...',
                width: '50%',
              },
            },
            {
              name: 'github',
              type: 'text',
              label: 'GitHub Profile URL',
              admin: {
                placeholder: 'https://github.com/...',
                width: '50%',
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'twitter',
              type: 'text',
              label: 'X / Twitter Profile URL',
              admin: {
                placeholder: 'https://x.com/...',
                width: '50%',
              },
            },
            {
              name: 'portfolio',
              type: 'text',
              label: 'Portfolio / Personal Website',
              admin: {
                placeholder: 'https://...',
                width: '50%',
              },
            },
          ],
        },
      ],
    },
  ],
}
