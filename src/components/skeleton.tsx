import {cn} from "../lib/cn"
import type {ComponentProps, ReactNode} from "react"

/**
 * A skeleton, not a spinner. A spinner says "something is happening"; a
 * skeleton says "this much is coming, and it will land here", which stops the
 * layout jumping when it does.
 *
 * `motion-reduce:animate-none` is not optional: a pulsing block is exactly the
 * kind of ambient motion prefers-reduced-motion exists to switch off.
 * `shimmer` swaps the pulse for a sweeping highlight (styles.css, also
 * switched off under reduced motion).
 */
function Skeleton({className, shimmer, ...props}: ComponentProps<"div"> & {shimmer?: boolean}) {
  return (
    <div
      data-slot="skeleton"
      data-shimmer={shimmer ? "" : undefined}
      aria-hidden
      className={cn("rounded-md bg-border/60 motion-reduce:animate-none", shimmer ? "ctech-shimmer" : "animate-pulse", className)}
      {...props}
    />
  )
}

/**
 * The one place a loading state speaks: `role="status"` with the label as
 * screen-reader-only text. The skeletons inside stay aria-hidden, so the wait
 * is announced once, not once per block.
 */
function LoadingRegion({label, className, children}: {label: string; className?: string; children?: ReactNode}) {
  return (
    <div data-slot="loading-region" role="status" aria-busy="true" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  )
}

/** `count` rows of `height` px, staggered: the shape of a list about to arrive. `className` is the real list's container class. */
function SkeletonList({label, count = 3, height = 56, className, shimmer}: {label: string; count?: number; height?: number; className?: string; shimmer?: boolean}) {
  return (
    <LoadingRegion label={label} className={className ?? "grid gap-2"}>
      {Array.from({length: count}, (_, i) => (
        <Skeleton key={i} shimmer={shimmer} className="w-full" style={{height, animationDelay: `${i * 90}ms`}} />
      ))}
    </LoadingRegion>
  )
}

/** A row of stat cards (label above value) so a summary bar keeps its height. */
function StatCardsSkeleton({label, count = 3, className, shimmer}: {label: string; count?: number; className?: string; shimmer?: boolean}) {
  return (
    <LoadingRegion label={label} className={cn("grid gap-3 sm:grid-cols-[repeat(auto-fit,minmax(10rem,1fr))]", className)}>
      {Array.from({length: count}, (_, i) => (
        <div key={i} className="grid gap-2 rounded-lg border border-border p-4">
          <Skeleton shimmer={shimmer} className="h-3 w-1/2" style={{animationDelay: `${i * 90}ms`}} />
          <Skeleton shimmer={shimmer} className="h-6 w-3/4" style={{animationDelay: `${i * 90}ms`}} />
        </div>
      ))}
    </LoadingRegion>
  )
}

export {LoadingRegion, Skeleton, SkeletonList, StatCardsSkeleton}
