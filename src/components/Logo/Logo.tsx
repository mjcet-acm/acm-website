import clsx from 'clsx'
import React from 'react'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

export const Logo: React.FC<Props> = ({ className }) => {
  return (
    <div className={clsx('flex items-center gap-3 select-none', className)}>
      {/* ACM Diamond Badge */}
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0085CA] shadow-sm shadow-[#0085CA]/20">
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 fill-white"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* ACM stylized geometric emblem */}
          <path d="M12 2L2 19.5h20L12 2zm0 4.2l6.2 10.8H5.8L12 6.2z" opacity="0.4" />
          <path d="M12 7.5L7 16.5h10L12 7.5zm0 3.2l2.6 4.3H9.4L12 10.7z" />
        </svg>
      </div>

      {/* Chapter Text */}
      <div className="flex flex-col text-left leading-none">
        <div className="flex items-center gap-1.5">
          <span className="text-base font-black tracking-tight text-foreground">
            MJCET
          </span>
          <span className="text-base font-black tracking-tight text-[#0085CA]">
            ACM
          </span>
        </div>
        <span className="mt-1 text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
          Student Chapter
        </span>
      </div>
    </div>
  )
}
