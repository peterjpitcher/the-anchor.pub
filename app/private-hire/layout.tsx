/**
 * No title template here on purpose.
 *
 * This layout used to set '%s | Private Hire at The Anchor', which stacked on
 * top of the root layout's '%s | The Anchor'. Pages then hard-coded the brand
 * as well, so a landmark page rendered as:
 *
 *   "Christening & Celebration Venue Near Our Lady of the Rosary RC Church
 *    | The Anchor | Private Hire at The Anchor"   (111 characters)
 *
 * Search results show roughly the first 60. The whole useful half of that
 * title never reached a searcher. The root template owns the brand.
 */
export default function PrivateHireLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="bg-canvas min-h-screen">
            {children}
        </div>
    )
}
