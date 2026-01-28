'use client'

import { useEffect, useRef, useState } from 'react'
import {
  trackOpenTableModalClose,
  trackOpenTableModalOpen,
  trackOpenTableWidgetLoadFailed,
  trackOpenTableWidgetLoaded,
  trackOpenTableWidgetSubmit
} from '@/lib/gtm-events'

const OPENTABLE_WIDGET_SRC =
  'https://www.opentable.co.uk/widget/reservation/loader?rid=443973&type=standard&theme=tall&color=4&dark=true&iframe=false&domain=couk&lang=en-GB&newtab=false&ot_source=Restaurant%20website&cfe=true'

const OPEN_TABLE_MODAL_OPEN_TYPES = new Set([
  'OT_OPEN_MODAL',
  '@@restef/APP_READY',
  'APP_READY',
  'MODAL_VISIBLE'
])

const OPEN_TABLE_MODAL_CLOSE_TYPES = new Set([
  '@@restef/APP_HIDDEN',
  'APP_HIDDEN',
  '@@restef/APP_CLOSED',
  'APP_CLOSED'
])

const OPEN_TABLE_MESSAGE_TYPES = new Set([
  ...OPEN_TABLE_MODAL_OPEN_TYPES,
  ...OPEN_TABLE_MODAL_CLOSE_TYPES
])

interface OpenTableWidgetProps {
  source?: string
}

export function OpenTableWidget({ source = 'book_table_widget' }: OpenTableWidgetProps) {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const [loadState, setLoadState] = useState<'loading' | 'loaded' | 'failed'>('loading')
  const hasTrackedLoaded = useRef(false)
  const hasTrackedFailed = useRef(false)
  const modalOpenRef = useRef(false)

  useEffect(() => {
    const mountNode = mountRef.current
    if (!mountNode) return

    const dedupe = () => {
      const containers = Array.from(
        mountNode.querySelectorAll<HTMLDivElement>('div[id^="ot-widget-container"]')
      )

      const loaderScripts = Array.from(
        mountNode.querySelectorAll<HTMLScriptElement>(`script[src="${OPENTABLE_WIDGET_SRC}"]`)
      )

      if (loaderScripts.length > 1) {
        const keep = loaderScripts.at(-1)
        for (const loaderScript of loaderScripts) {
          if (loaderScript !== keep) {
            loaderScript.remove()
          }
        }
      }

      if (containers.length <= 1) return

      const keep = containers.at(-1)
      for (const container of containers) {
        if (container !== keep) {
          container.remove()
        }
      }
    }

    const detectWidget = () => {
      dedupe()
      const picker = mountNode.querySelector('.ot-dtp-picker, [data-test="reservation-widget-standard"]')
      if (picker) {
        setLoadState('loaded')
      }
    }

    dedupe()
    detectWidget()

    if (!mountNode.querySelector(`script[src="${OPENTABLE_WIDGET_SRC}"]`)) {
      setLoadState('loading')
      const script = document.createElement('script')
      script.src = OPENTABLE_WIDGET_SRC
      script.async = false
      script.type = 'text/javascript'
      script.onerror = () => setLoadState('failed')
      mountNode.appendChild(script)
    } else {
      detectWidget()
      setLoadState(current => (current === 'loaded' ? current : 'loading'))
    }

    const observer = new MutationObserver(() => {
      detectWidget()
    })
    observer.observe(mountNode, { childList: true, subtree: true })

    const intervalId = window.setInterval(detectWidget, 250)
    const timeoutId = window.setTimeout(() => {
      detectWidget()
      setLoadState(current => (current === 'loaded' ? current : 'failed'))
    }, 6000)

    return () => {
      observer.disconnect()
      window.clearInterval(intervalId)
      window.clearTimeout(timeoutId)
    }
  }, [])

  useEffect(() => {
    if (loadState === 'loaded' && !hasTrackedLoaded.current) {
      hasTrackedLoaded.current = true
      trackOpenTableWidgetLoaded({ source })
    }

    if (loadState === 'failed' && !hasTrackedFailed.current) {
      hasTrackedFailed.current = true
      trackOpenTableWidgetLoadFailed({ source })
    }
  }, [loadState, source])

  useEffect(() => {
    const mountNode = mountRef.current
    if (!mountNode) return

    const handleSubmit = (event: Event) => {
      if (!(event.target instanceof HTMLFormElement)) return
      trackOpenTableWidgetSubmit({ source })
    }

    mountNode.addEventListener('submit', handleSubmit)

    return () => {
      mountNode.removeEventListener('submit', handleSubmit)
    }
  }, [source])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') return
      const messageType = (event.data as { type?: unknown }).type
      if (typeof messageType !== 'string') return
      if (!OPEN_TABLE_MESSAGE_TYPES.has(messageType)) return

      const origin = event.origin ?? ''
      const isOpenTableOrigin = /(^https?:\/\/)?([a-z0-9-]+\.)?opentable\./i.test(origin)
      const isSameOrigin = origin === window.location.origin

      if (!isOpenTableOrigin && !isSameOrigin && origin !== 'null') return

      if (OPEN_TABLE_MODAL_OPEN_TYPES.has(messageType)) {
        if (!modalOpenRef.current) {
          modalOpenRef.current = true
          trackOpenTableModalOpen({ source, messageType })
        }
        return
      }

      if (OPEN_TABLE_MODAL_CLOSE_TYPES.has(messageType) && modalOpenRef.current) {
        modalOpenRef.current = false
        trackOpenTableModalClose({ source, messageType })
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [source])

  return (
    <div className="ot-widget-surface">
      {loadState === 'loading' && (
        <div className="py-8 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-anchor-green" />
          <p className="mt-3 text-sm text-gray-600">Loading booking widget…</p>
        </div>
      )}

      {loadState === 'failed' && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">Having trouble loading the booking widget.</p>
          <p className="mt-1">
            Please call us on{' '}
            <a href="tel:+441753682707" className="font-semibold underline">
              01753 682707
            </a>{' '}
            and we&apos;ll get you booked in.
          </p>
        </div>
      )}

      <div ref={mountRef} className="flex justify-center" />
      <noscript>
        <p className="text-sm text-gray-700">
          JavaScript is required to load the booking widget. Please call us on{' '}
          <a href="tel:+441753682707" className="text-anchor-green font-semibold underline">
            01753 682707
          </a>{' '}
          to book.
        </p>
      </noscript>
    </div>
  )
}
