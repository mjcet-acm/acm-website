import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidatePath } from 'next/cache'

export const revalidateEvent: CollectionAfterChangeHook = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const path = `/events/${doc.slug}`
      payload.logger.info(`Revalidating event at path: ${path}`)
      revalidatePath(path)
      revalidatePath('/events')
      revalidatePath('/')
    }

    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      const oldPath = `/events/${previousDoc.slug}`
      payload.logger.info(`Revalidating old event at path: ${oldPath}`)
      revalidatePath(oldPath)
      revalidatePath('/events')
      revalidatePath('/')
    }
  }
  return doc
}

export const revalidateDeleteEvent: CollectionAfterDeleteHook = ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate) {
    const path = `/events/${doc?.slug}`
    revalidatePath(path)
    revalidatePath('/events')
    revalidatePath('/')
  }
  return doc
}
