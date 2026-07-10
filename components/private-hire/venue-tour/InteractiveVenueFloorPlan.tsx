'use client'

import { useEffect, useId, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  MapPin,
  Users,
} from 'lucide-react'
import { useInView } from 'react-intersection-observer'
import {
  Button,
  Modal,
  ModalBody,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/components/ui'
import {
  trackVenueTourEnquiryClicked,
  trackVenueTourPhotoOpened,
  trackVenueTourSpaceSelected,
  trackVenueTourViewed,
} from '@/lib/gtm-events'
import { cn } from '@/lib/utils'
import {
  getPrivateHireEnquiryHref,
  getVenueTourSpace,
  VENUE_TOUR_PHOTOS,
  VENUE_TOUR_SPACE_SELECTED_EVENT,
  VENUE_TOUR_SPACE_SESSION_KEY,
  VENUE_TOUR_SPACES,
  type VenueTourEventType,
  type VenueTourPhoto,
  type VenueTourSpaceId,
} from './venue-tour-data'

export interface InteractiveVenueFloorPlanProps {
  source?: string
  initialSpaceId?: VenueTourSpaceId
  eventType?: VenueTourEventType
  className?: string
}

function currentPagePath() {
  return typeof window === 'undefined' ? '' : window.location.pathname
}

export function InteractiveVenueFloorPlan({
  source = 'venue_tour',
  initialSpaceId,
  eventType,
  className,
}: InteractiveVenueFloorPlanProps) {
  const instanceId = useId().replace(/:/g, '')
  const detailsId = `venue-space-details-${instanceId}`
  const modalId = `venue-photo-${instanceId}`
  const defaultSpace = getVenueTourSpace(initialSpaceId)
  const [selectedSpaceId, setSelectedSpaceId] = useState<VenueTourSpaceId>(defaultSpace.id)
  const [selectedPhoto, setSelectedPhoto] = useState<VenueTourPhoto | null>(null)
  const { ref: tourRef, inView } = useInView({ triggerOnce: true, threshold: 0.25 })

  const selectedSpace = getVenueTourSpace(selectedSpaceId)
  const enquiryHref = getPrivateHireEnquiryHref(selectedSpace.id, eventType)

  useEffect(() => {
    if (!initialSpaceId) return
    setSelectedSpaceId(initialSpaceId)
  }, [initialSpaceId])

  useEffect(() => {
    window.sessionStorage.setItem(VENUE_TOUR_SPACE_SESSION_KEY, selectedSpaceId)
  }, [selectedSpaceId])

  useEffect(() => {
    if (!inView) return
    trackVenueTourViewed({
      sourcePage: currentPagePath(),
      sourceComponent: source,
    })
  }, [inView, source])

  const selectSpace = (spaceId: VenueTourSpaceId) => {
    const space = getVenueTourSpace(spaceId)
    setSelectedSpaceId(space.id)
    window.dispatchEvent(new CustomEvent(VENUE_TOUR_SPACE_SELECTED_EVENT, {
      detail: { spaceId: space.id },
    }))
    trackVenueTourSpaceSelected({
      sourcePage: currentPagePath(),
      sourceComponent: source,
      spaceId: space.id,
      spaceName: space.name,
    })
  }

  const openPhoto = (photo: VenueTourPhoto) => {
    const attributedSpace = photo.spaceId ? getVenueTourSpace(photo.spaceId) : undefined
    setSelectedPhoto(photo)
    trackVenueTourPhotoOpened({
      sourcePage: currentPagePath(),
      sourceComponent: source,
      photoId: photo.id,
      photoName: photo.title,
      spaceId: attributedSpace?.id,
      spaceName: attributedSpace?.name,
    })
  }

  const showAdjacentPhoto = (offset: number) => {
    if (!selectedPhoto) return

    const currentIndex = VENUE_TOUR_PHOTOS.findIndex((photo) => photo.id === selectedPhoto.id)
    const nextIndex = (currentIndex + offset + VENUE_TOUR_PHOTOS.length) % VENUE_TOUR_PHOTOS.length
    openPhoto(VENUE_TOUR_PHOTOS[nextIndex])
  }

  return (
    <div ref={tourRef} className={className} data-venue-tour="interactive">
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {selectedSpace.name} selected. {selectedSpace.capacity}.
      </p>

      <div className="mb-5 flex flex-col gap-3 rounded-md border border-line bg-surface px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-muted">
          Tap or click a marker to explore. Photos are positioned over the part of the pub they show.
        </p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold text-ink">
          <span className="inline-flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-anchor-gold-dark text-xs text-white shadow-md">
              1
            </span>
            Hire space
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-anchor-green text-white shadow-md">
              <Camera className="h-4 w-4" aria-hidden />
            </span>
            Photo viewpoint
          </span>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.75fr)] lg:gap-8">
        <div>
          <div className="relative overflow-hidden rounded-md border border-line-strong bg-surface shadow-lg">
            <Image
              src="/images/private-hire/venue-floor-plan.webp"
              alt="Illustrated floor plan of The Anchor showing the outside drinking area, dining room, main bar, pool table area and car park"
              width={1448}
              height={1086}
              className="h-auto w-full"
              sizes="(max-width: 1023px) calc(100vw - 2rem), 68vw"
            />

            {VENUE_TOUR_SPACES.map((space) => {
              const isSelected = selectedSpace.id === space.id

              return (
                <button
                  key={space.id}
                  type="button"
                  aria-label={`Show ${space.name} hire details`}
                  aria-controls={detailsId}
                  aria-pressed={isSelected}
                  onClick={() => selectSpace(space.id)}
                  className={cn(
                    'absolute z-20 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[3px] border-white bg-anchor-gold-dark text-sm font-bold text-white shadow-lg transition duration-200 hover:scale-110 focus-visible:scale-110 sm:h-12 sm:w-12',
                    isSelected && 'scale-110 ring-4 ring-anchor-green/35'
                  )}
                  style={{ left: `${space.position.left}%`, top: `${space.position.top}%` }}
                >
                  {space.number}
                  <span
                    className={cn(
                      'pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-sm bg-anchor-green-deep px-2 py-1 text-[10px] font-semibold text-white shadow-md sm:text-xs',
                      !isSelected && 'sr-only'
                    )}
                  >
                    {space.name}
                  </span>
                </button>
              )
            })}

            {VENUE_TOUR_PHOTOS.map((photo) => (
              <button
                key={photo.id}
                type="button"
                aria-label={`Open photo: ${photo.title}`}
                aria-haspopup="dialog"
                onClick={() => openPhoto(photo)}
                className="absolute z-10 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-anchor-green text-white shadow-lg transition duration-200 hover:scale-110 hover:bg-anchor-green-dark focus-visible:scale-110 max-[360px]:h-6 max-[360px]:w-6 sm:h-11 sm:w-11 sm:border-[3px]"
                style={{ left: `${photo.position.left}%`, top: `${photo.position.top}%` }}
              >
                <Camera className="h-3.5 w-3.5 max-[360px]:h-3 max-[360px]:w-3 sm:h-5 sm:w-5" strokeWidth={2.25} aria-hidden />
              </button>
            ))}
          </div>

          <p className="mt-3 text-center text-xs text-ink-muted">
            Floor plan is an illustrative guide. Furniture and event layouts can change.
          </p>
        </div>

        <aside
          id={detailsId}
          className="overflow-hidden rounded-md border border-line bg-surface shadow-md lg:sticky lg:top-6"
        >
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-sunk">
            <Image
              key={selectedSpace.id}
              src={selectedSpace.image}
              alt={selectedSpace.imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 1023px) calc(100vw - 2rem), 380px"
            />
            <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-pill bg-anchor-gold-dark px-3 py-1.5 text-xs font-semibold text-white shadow-md">
              <MapPin className="h-4 w-4" aria-hidden />
              Private hire space
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="mb-5 flex flex-wrap gap-2" aria-label="Choose a private hire space">
              {VENUE_TOUR_SPACES.map((space) => {
                const isSelected = selectedSpace.id === space.id

                return (
                  <button
                    key={space.id}
                    type="button"
                    aria-label={`Choose ${space.name}`}
                    aria-pressed={isSelected}
                    onClick={() => selectSpace(space.id)}
                    className={cn(
                      'inline-flex min-h-11 items-center gap-2 rounded-pill border px-3 py-2 text-sm font-semibold transition-colors',
                      isSelected
                        ? 'border-anchor-green bg-anchor-green text-white'
                        : 'border-line-strong bg-surface text-ink hover:border-anchor-gold-dark hover:text-accent-text'
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-full text-xs',
                        isSelected ? 'bg-white/15' : 'bg-surface-sunk'
                      )}
                    >
                      {space.number}
                    </span>
                    {space.name}
                  </button>
                )
              })}
            </div>

            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent-text">
              Private hire space
            </p>
            <h3 className="font-display text-h3 text-ink-strong">{selectedSpace.name}</h3>

            <p className="mt-4 flex items-center gap-2 font-semibold text-ink">
              <Users className="h-5 w-5 shrink-0 text-accent-text" aria-hidden />
              {selectedSpace.capacity}
            </p>
            <p className="mt-4 leading-relaxed text-ink-muted">{selectedSpace.description}</p>

            <ul className="mt-5 space-y-3">
              {selectedSpace.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm text-ink">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-text" strokeWidth={2.5} aria-hidden />
                  {feature}
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-md bg-surface-sunk p-4">
              <p className="font-semibold text-ink-strong">Need the whole pub?</p>
              <p className="mt-1 text-sm text-ink-muted">
                Larger events and full-venue hire are available by enquiry.
              </p>
            </div>

            <Button asChild variant="primary" size="md" fullWidth className="mt-6">
              <Link
                href={enquiryHref}
                onClick={() => {
                  trackVenueTourEnquiryClicked({
                    sourcePage: currentPagePath(),
                    sourceComponent: source,
                    destination: enquiryHref,
                    spaceId: selectedSpace.id,
                    spaceName: selectedSpace.name,
                  })
                }}
              >
                Ask about this space
              </Link>
            </Button>
          </div>
        </aside>
      </div>

      <Modal
        id={modalId}
        open={Boolean(selectedPhoto)}
        onClose={() => setSelectedPhoto(null)}
        title={selectedPhoto?.title}
        description={selectedPhoto?.description}
        size="xl"
        backdrop="blur"
      >
        {selectedPhoto ? (
          <>
            <ModalHeader className="pr-12">
              <p className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent-text">
                <Camera className="h-4 w-4" aria-hidden />
                Photo viewpoint
              </p>
              <ModalTitle id={`${modalId}-title`} className="font-display text-h3">
                {selectedPhoto.title}
              </ModalTitle>
              <ModalDescription id={`${modalId}-description`} className="text-base">
                {selectedPhoto.description}
              </ModalDescription>
            </ModalHeader>

            <ModalBody className="px-0 py-0">
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface-sunk">
                <Image
                  key={selectedPhoto.id}
                  src={selectedPhoto.image}
                  alt={selectedPhoto.imageAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 900px) calc(100vw - 2rem), 896px"
                />
              </div>
            </ModalBody>

            <ModalFooter className="flex-col sm:flex-row sm:justify-between [&>button]:w-full sm:[&>button]:w-auto">
              <Button variant="ghost" size="sm" onClick={() => showAdjacentPhoto(-1)}>
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Previous view
              </Button>
              <Button variant="ghost" size="sm" onClick={() => showAdjacentPhoto(1)}>
                Next view
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </ModalFooter>
          </>
        ) : null}
      </Modal>
    </div>
  )
}
