import { Metadata } from 'next'

export const metadata: Metadata = {
    title: {
        template: '%s | Private Hire at The Anchor',
        default: 'Private Hire | The Anchor Stanwell Moor',
    },
}

export default function PrivateHireLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="bg-anchor-bg min-h-screen">
            {children}
        </div>
    )
}
