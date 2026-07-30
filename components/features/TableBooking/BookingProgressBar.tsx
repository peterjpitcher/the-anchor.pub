'use client'

import { Check } from 'lucide-react'
import { STEP_LABELS, STEP_ORDER } from '@/lib/table-booking/journey'

// Numbered step indicator (spec §9): 28px circles, pending sunk/muted, active
// gold/white, done green/white check, joined by 2px hairline bars. Labels
// Outfit 600 text-sm; pending-step labels hide at 640px and below (numbers
// always show).
export function BookingProgressBar({
  currentStep,
  totalSteps
}: {
  currentStep: number
  totalSteps: number
}) {
  const steps = STEP_ORDER.map((stepKey, index) => ({
    key: stepKey,
    label: STEP_LABELS[stepKey],
    number: index + 1
  }))

  return (
    <div
      className="mb-2"
      role="progressbar"
      aria-label="Booking progress"
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-valuenow={currentStep}
      aria-valuetext={`Step ${currentStep} of ${totalSteps}: ${STEP_LABELS[STEP_ORDER[currentStep - 1]]}`}
    >
      <ol className="flex items-center" role="list">
        {steps.map((step, index) => {
          const isComplete = step.number < currentStep
          const isCurrent = step.number === currentStep
          const isPending = step.number > currentStep

          return (
            <li
              key={step.key}
              aria-current={isCurrent ? 'step' : undefined}
              className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
            >
              <div className="flex min-w-0 flex-col items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-pill text-sm font-semibold font-sans ${
                    isCurrent
                      ? 'bg-anchor-gold-dark text-white'
                      : isComplete
                      ? 'bg-anchor-green text-white'
                      : 'bg-surface-sunk text-ink-muted'
                  }`}
                >
                  {isComplete ? <Check aria-hidden="true" className="h-4 w-4" /> : step.number}
                </span>
                <span
                  className={`text-sm font-semibold font-sans leading-tight ${
                    isCurrent ? 'text-ink-strong' : 'text-ink-muted'
                  } ${isPending ? 'hidden sm:block' : ''}`}
                >
                  {step.label}
                  {isCurrent ? (
                    <span className="sr-only"> (current step, {currentStep} of {totalSteps})</span>
                  ) : null}
                </span>
              </div>
              {index < steps.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={`mx-2 h-0.5 flex-1 ${isComplete ? 'bg-anchor-green' : 'bg-line-strong'}`}
                />
              ) : null}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
