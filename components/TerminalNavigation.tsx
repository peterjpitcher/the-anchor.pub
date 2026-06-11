import Link from 'next/link'
import { cn } from '@/lib/utils'

interface TerminalNavigationProps {
  currentTerminal?: string
  className?: string
}

const terminals = [
  { number: '2', href: '/near-heathrow/terminal-2' },
  { number: '3', href: '/near-heathrow/terminal-3' },
  { number: '4', href: '/near-heathrow/terminal-4' },
  { number: '5', href: '/near-heathrow/terminal-5' }
]

export function TerminalNavigation({ currentTerminal, className }: TerminalNavigationProps) {
  return (
    <div className={cn("flex flex-wrap justify-center gap-3", className)}>
      <span className="text-sm text-ink-muted">Other terminals:</span>
      {terminals.map((terminal) => (
        terminal.number !== currentTerminal && (
          <Link
            key={terminal.number}
            href={terminal.href}
            className="text-accent-text hover:text-ink-strong font-semibold transition-colors"
          >
            Terminal {terminal.number}
          </Link>
        )
      ))}
      <Link
        href="/near-heathrow"
        className="text-accent-text hover:text-ink-strong font-semibold transition-colors"
      >
        All Terminals
      </Link>
    </div>
  )
}