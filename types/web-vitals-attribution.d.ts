// Next.js ships Google's web-vitals library twice: a plain build, which
// `useReportWebVitals` from next/web-vitals uses, and this one, which also says
// what caused each reading. It has no types of its own. Only the part
// app/web-vitals.tsx uses is declared: CLS, and the element that moved.
//
// The `experimental.webVitalsAttribution` setting in next.config.js does not
// switch this build on for `useReportWebVitals`. Next reads that setting only
// when its own analytics id is set, which it is not here, so the only way to
// learn what moved is to call this build directly.
declare module 'next/dist/compiled/web-vitals-attribution' {
  interface ShiftRect {
    x: number
    y: number
    width: number
    height: number
  }

  export interface CLSMetricWithAttribution {
    name: 'CLS'
    value: number
    rating: 'good' | 'needs-improvement' | 'poor'
    attribution: {
      /** A short selector for the element that moved furthest. Absent when nothing moved. */
      largestShiftTarget?: string
      largestShiftSource?: { previousRect: ShiftRect; currentRect: ShiftRect }
    }
  }

  export function onCLS(callback: (metric: CLSMetricWithAttribution) => void): void
}
