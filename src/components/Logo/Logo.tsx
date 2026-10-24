import clsx from 'clsx'
import React from 'react'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

export const Logo: React.FC<Props> = (props) => {
  const { loading: loadingFromProps, priority: priorityFromProps, className } = props

  const loading = loadingFromProps || 'lazy'
  const priority = priorityFromProps || 'low'

  return (
    /* eslint-disable @next/next/no-img-element */
    <img
      alt="ACM Logo"
      width={44}
      height={44}
      loading={loading}
      fetchPriority={priority}
      decoding="async"
      className={clsx('h-10 w-auto object-contain select-none', className)}
      src="/acm-logo.png"
    />
  )
}
