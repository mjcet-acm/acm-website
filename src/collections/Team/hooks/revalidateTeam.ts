import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidatePath } from 'next/cache'

export const revalidateTeam: CollectionAfterChangeHook = ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating team page`)
    revalidatePath('/team')
    revalidatePath('/')
  }
  return doc
}

export const revalidateDeleteTeam: CollectionAfterDeleteHook = ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate) {
    revalidatePath('/team')
    revalidatePath('/')
  }
  return doc
}
