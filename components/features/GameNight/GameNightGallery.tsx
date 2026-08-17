import { Container } from '@/components/ui'
import { Gallery } from '@/components/features/Gallery'
import { SectionViewTracker } from '@/components/tracking/SectionViewTracker'
import type { GameNightPhoto } from '@/lib/game-nights'

interface GameNightGalleryProps {
  photos: GameNightPhoto[]
  /** Lower-case game name, e.g. "quiz night". */
  gameName: string
  /** Config slug, used for the section_view id. */
  gameSlug: string
  /** Section heading. */
  title: string
  /** Optional supporting line under the heading. */
  intro?: string
}

/**
 * Photographs of the night, shown below the fold.
 *
 * These pages described the atmosphere in prose for years and never showed it.
 * The only images on them were the pub exterior and an AI-generated event poster,
 * so a visitor deciding whether to come had nothing to look at. This is the
 * section that answers "what is it actually like", and copy cannot do its job.
 *
 * Renders nothing when there are no photos, which is karaoke's normal state. An
 * empty gallery frame is worse than no gallery: it reads as a night nobody came to.
 *
 * The photos are 640px on the long edge, which is all that was supplied. That is
 * ample for square gallery tiles (they display around 400px) but it is why the
 * lightbox is the full extent of the zoom available.
 */
export function GameNightGallery({
  photos,
  gameName,
  gameSlug,
  title,
  intro
}: GameNightGalleryProps) {
  if (photos.length === 0) return null

  return (
    <SectionViewTracker sectionId={`${gameSlug.replace(/-/g, '_')}_gallery`}>
      <section className="py-section-y bg-surface-sunk">
        <Container>
          <div className="mx-auto mb-8 text-center">
            <h2 className="text-h3 text-ink-strong">{title}</h2>
            {intro && <p className="mt-3 text-ink-muted">{intro}</p>}
          </div>
          {/* eagerCount 0: this gallery is well below the fold, so nothing here
              should compete with the hero or the booking form for bandwidth. */}
          <Gallery
            images={photos}
            columns={3}
            gap="md"
            showCaptions
            showFilter={false}
            eagerCount={0}
          />
          <p className="mt-6 text-center text-sm text-ink-muted">
            Real photos from {gameName} at The Anchor. Tap any picture to see it bigger.
          </p>
        </Container>
      </section>
    </SectionViewTracker>
  )
}
