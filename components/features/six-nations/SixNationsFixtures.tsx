'use client'

import { useState } from 'react'
import { DateTime } from 'luxon'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/primitives/Button'
import { cn } from '@/lib/utils'
import { BookTableButton } from '@/components/BookTableButton'

interface Fixture {
    round: number
    date: string
    day: string
    kickoff: string
    home: string
    away: string
    ukBroadcaster: string
}

const fixtures: Fixture[] = [
    { round: 1, date: "2026-02-05", day: "Thursday", kickoff: "20:10", home: "France", away: "Ireland", ukBroadcaster: "ITV" },
    { round: 1, date: "2026-02-07", day: "Saturday", kickoff: "14:10", home: "Italy", away: "Scotland", ukBroadcaster: "BBC" },
    { round: 1, date: "2026-02-07", day: "Saturday", kickoff: "16:40", home: "England", away: "Wales", ukBroadcaster: "ITV" },

    { round: 2, date: "2026-02-14", day: "Saturday", kickoff: "14:10", home: "Ireland", away: "Italy", ukBroadcaster: "ITV" },
    { round: 2, date: "2026-02-14", day: "Saturday", kickoff: "16:40", home: "Scotland", away: "England", ukBroadcaster: "ITV" },
    { round: 2, date: "2026-02-15", day: "Sunday", kickoff: "15:10", home: "Wales", away: "France", ukBroadcaster: "BBC" },

    { round: 3, date: "2026-02-21", day: "Saturday", kickoff: "14:10", home: "England", away: "Ireland", ukBroadcaster: "ITV" },
    { round: 3, date: "2026-02-21", day: "Saturday", kickoff: "16:40", home: "Wales", away: "Scotland", ukBroadcaster: "BBC" },
    { round: 3, date: "2026-02-22", day: "Sunday", kickoff: "15:10", home: "France", away: "Italy", ukBroadcaster: "ITV" },

    { round: 4, date: "2026-03-06", day: "Friday", kickoff: "20:10", home: "Ireland", away: "Wales", ukBroadcaster: "ITV" },
    { round: 4, date: "2026-03-07", day: "Saturday", kickoff: "14:10", home: "Scotland", away: "France", ukBroadcaster: "BBC" },
    { round: 4, date: "2026-03-07", day: "Saturday", kickoff: "16:40", home: "Italy", away: "England", ukBroadcaster: "ITV" },

    { round: 5, date: "2026-03-14", day: "Saturday", kickoff: "14:10", home: "Ireland", away: "Scotland", ukBroadcaster: "ITV" },
    { round: 5, date: "2026-03-14", day: "Saturday", kickoff: "16:40", home: "Wales", away: "Italy", ukBroadcaster: "BBC" },
    { round: 5, date: "2026-03-14", day: "Saturday", kickoff: "20:10", home: "France", away: "England", ukBroadcaster: "ITV" }
]

const teams = ["England", "France", "Ireland", "Italy", "Scotland", "Wales"]

interface SixNationsFixturesProps {
    className?: string
}

export function SixNationsFixtures({ className }: SixNationsFixturesProps) {
    const [selectedRound, setSelectedRound] = useState<number | 'all'>('all')
    const [selectedTeam, setSelectedTeam] = useState<string | null>(null)

    const filteredFixtures = fixtures.filter(fixture => {
        const matchesRound = selectedRound === 'all' || fixture.round === selectedRound
        const matchesTeam = selectedTeam
            ? (fixture.home === selectedTeam || fixture.away === selectedTeam)
            : true
        return matchesRound && matchesTeam
    })

    // Group by round for display when 'all' is selected
    const fixturesByRound = filteredFixtures.reduce((acc, fixture) => {
        if (!acc[fixture.round]) acc[fixture.round] = []
        acc[fixture.round].push(fixture)
        return acc
    }, {} as Record<number, Fixture[]>)

    const roundsToDisplay = selectedRound === 'all'
        ? [1, 2, 3, 4, 5].filter(r => fixturesByRound[r]?.length > 0)
        : [selectedRound]

    return (
        <div className={cn("space-y-8", className)}>
            {/* Filters */}
            <div className="flex flex-col gap-4">
                {/* Round Tabs */}
                <div className="flex flex-wrap gap-2 justify-center">
                    <Button
                        variant={selectedRound === 'all' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedRound('all')}
                        className="rounded-full"
                    >
                        All Rounds
                    </Button>
                    {[1, 2, 3, 4, 5].map((round) => (
                        <Button
                            key={round}
                            variant={selectedRound === round ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedRound(round)}
                            className="rounded-full"
                        >
                            Round {round}
                        </Button>
                    ))}
                </div>

                {/* Team Filter */}
                <div className="flex flex-wrap gap-2 justify-center">
                    <Button
                        variant={selectedTeam === null ? 'secondary' : 'outline'}
                        size="xs"
                        onClick={() => setSelectedTeam(null)}
                        className="text-xs"
                    >
                        All Teams
                    </Button>
                    {teams.map(team => (
                        <Button
                            key={team}
                            variant={selectedTeam === team ? 'secondary' : 'outline'}
                            size="xs"
                            onClick={() => setSelectedTeam(team)}
                            className="text-xs"
                        >
                            {team}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Fixtures List */}
            <div className="space-y-8">
                {roundsToDisplay.map((round) => (
                    <div key={round} className="space-y-4">
                        <div className="flex items-center gap-4">
                            <h3 className="text-2xl font-bold font-serif text-anchor-green">
                                Round {round}
                            </h3>
                            <div className="h-px bg-gray-200 flex-1" />
                            {round === 5 && (
                                <span className="px-3 py-1 bg-anchor-gold text-white text-xs font-bold uppercase rounded-full">
                                    Super Saturday
                                </span>
                            )}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {fixturesByRound[round]?.map((fixture, idx) => {
                                const isEngland = fixture.home === 'England' || fixture.away === 'England'
                                const isSuperSaturday = fixture.round === 5

                                return (
                                    <Card
                                        key={`${fixture.date}-${fixture.home}-${fixture.away}`}
                                        className={cn(
                                            "p-0 overflow-hidden border transition-all duration-200 hover:shadow-md",
                                            (isEngland || isSuperSaturday) ? "border-anchor-gold/30 ring-1 ring-anchor-gold/10" : "border-gray-200"
                                        )}
                                    >
                                        {/* Header */}
                                        <div className={cn(
                                            "px-4 py-2 text-xs font-bold uppercase tracking-wider flex justify-between items-center",
                                            (isEngland || isSuperSaturday) ? "bg-anchor-gold/10 text-anchor-gold-dark" : "bg-gray-50 text-gray-500"
                                        )}>
                                            <span>{DateTime.fromISO(fixture.date).toFormat("EEEE d MMM")}</span>
                                            <span>{fixture.kickoff}</span>
                                        </div>

                                        {/* Match */}
                                        <div className="p-5 text-center space-y-4">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className={cn(
                                                    "flex-1 font-bold text-lg",
                                                    fixture.home === 'England' ? "text-anchor-green" : "text-gray-800"
                                                )}>
                                                    {fixture.home}
                                                </span>
                                                <span className="text-gray-400 text-sm font-medium">vs</span>
                                                <span className={cn(
                                                    "flex-1 font-bold text-lg",
                                                    fixture.away === 'England' ? "text-anchor-green" : "text-gray-800"
                                                )}>
                                                    {fixture.away}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                                                <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium">
                                                    {fixture.ukBroadcaster}
                                                </span>
                                            </div>

                                            <BookTableButton
                                                source={`fixtures_round_${round}`}
                                                eventName={`${fixture.home} vs ${fixture.away} (Six Nations)`}
                                                variant={(isEngland || isSuperSaturday) ? "primary" : "outline"}
                                                size="sm"
                                                className="w-full"
                                            >
                                                Book Table
                                            </BookTableButton>
                                        </div>
                                    </Card>
                                )
                            })}
                        </div>
                    </div>
                ))}

                {roundsToDisplay.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No matches found for your selection.
                    </div>
                )}
            </div>

            <div className="text-center text-xs text-gray-500 italic">
                * TV listings subject to change. All times GMT.
            </div>
        </div>
    )
}
