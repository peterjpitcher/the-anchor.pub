'use client'

import { cn } from '@/lib/utils'
import type { WizardFlowStep } from './types'

interface WizardProgressProps {
  currentStep: number
  steps: WizardFlowStep[]
}

const STEP_LABELS: Record<WizardFlowStep, string> = {
  date: 'Date',
  sunday_offer: 'Sunday?',
  party_size: 'Party',
  menu_selection: 'Menu',
  time: 'Time',
  details: 'Details',
  confirm: 'Confirm'
}

export function WizardProgress({ currentStep, steps }: WizardProgressProps) {
  const totalSteps = steps.length
  const stepLabels = steps.map((step) => STEP_LABELS[step] ?? step)
  const progressPercentage = totalSteps > 1 ? ((currentStep - 1) / (totalSteps - 1)) * 100 : 0
  
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Progress Bar */}
        <div className="relative">
          {/* Background Track */}
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-2 bg-gray-200 rounded-full"></div>
          </div>
          
          {/* Progress Fill */}
          <div className="absolute inset-0 flex items-center">
            <div 
              className="h-2 bg-anchor-green rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          
          {/* Step Indicators */}
          <div className="relative flex justify-between">
            {stepLabels.map((label, index) => {
              const stepNumber = index + 1
              const isActive = stepNumber === currentStep
              const isCompleted = stepNumber < currentStep
              
              return (
                <div 
                  key={stepNumber}
                  className="flex flex-col items-center"
                >
                  {/* Circle */}
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                      isActive && 'bg-anchor-green text-white ring-4 ring-anchor-green/20 scale-110',
                      isCompleted && 'bg-anchor-green text-white',
                      !isActive && !isCompleted && 'bg-white border-2 border-gray-300 text-gray-500'
                    )}
                  >
                    {isCompleted ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      stepNumber
                    )}
                  </div>
                  
                  {/* Label */}
                  <span
                    className={cn(
                      'mt-2 text-xs font-medium hidden md:block',
                      isActive && 'text-anchor-green',
                      isCompleted && 'text-anchor-green',
                      !isActive && !isCompleted && 'text-gray-500'
                    )}
                  >
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
        
        {/* Mobile Step Label */}
        <div className="mt-3 text-center md:hidden">
          <p className="text-sm font-medium text-gray-700">
            Step {Math.min(currentStep, totalSteps)} of {totalSteps}:{' '}
            {stepLabels[currentStep - 1] ?? stepLabels[stepLabels.length - 1] ?? ''}
          </p>
        </div>
      </div>
    </div>
  )
}
