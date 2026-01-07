'use client'

import { useState, useEffect, useMemo } from 'react'
import { Icon } from '@/components/ui/Icon'
import { Alert } from '@/components/ui/feedback/Alert'
import { Badge } from '@/components/ui/primitives/Badge'
import type { MenuSelectionPayload, MenuSummary } from './types'
import { formatPrice } from '@/lib/utils'

interface GuestSelection {
  guest_name: string
  menu_item_id: string
}

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  included?: boolean
  dietary_info?: string[]
  allergens?: string[]
  is_available: boolean
}

interface MenuData {
  mains: MenuItem[]
  sides: MenuItem[]
}

interface SundayMenuSelectionProps {
  partySize: number
  date?: string
  existingSummary?: MenuSummary
  onChange: (payload: MenuSelectionPayload[], summary: MenuSummary) => void
  onValidityChange?: (isValid: boolean) => void
}

const toMenuItem = (item: any, options: { inferIncluded?: boolean } = {}): MenuItem => {
  const priceValue = Number(item?.price ?? 0)
  const price = Number.isFinite(priceValue) ? priceValue : 0
  const computedIncluded = options.inferIncluded
    ? item?.included ?? price === 0
    : item?.included

  return {
    id: item?.id != null ? String(item.id) : '',
    name: item?.name ?? '',
    description: item?.description ?? '',
    price,
    ...(typeof computedIncluded === 'boolean' ? { included: computedIncluded } : {}),
    dietary_info: Array.isArray(item?.dietary_info) ? item.dietary_info : [],
    allergens: Array.isArray(item?.allergens) ? item.allergens : [],
    is_available: item?.is_available ?? true
  }
}

export function SundayMenuSelection({
  partySize,
  date,
  existingSummary,
  onChange,
  onValidityChange
}: SundayMenuSelectionProps) {
  const [menuData, setMenuData] = useState<MenuData>({ mains: [], sides: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Initialize menu selections for each guest
  const [selections, setSelections] = useState<GuestSelection[]>(() =>
    Array.from({ length: partySize }, (_, i) => ({
      guest_name: `Guest ${i + 1}`,
      menu_item_id: ''
    }))
  )
  const [sideSelections, setSideSelections] = useState<{ menu_item_id: string; quantity: number }[]>([])

  useEffect(() => {
    setSelections(prev =>
      Array.from({ length: partySize }, (_, i) => ({
        guest_name: prev[i]?.guest_name || `Guest ${i + 1}`,
        menu_item_id: prev[i]?.menu_item_id || ''
      }))
    )
  }, [partySize])
  
  // Fetch menu from API
  useEffect(() => {
    // Don't proceed if no date is provided
    if (!date) {
      console.error('No date provided to menu selection component')
      setError('Please select a date first. Go back to the date selection step.')
      setLoading(false)
      return
    }

    // Validate date format (YYYY-MM-DD)
    const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateFormatRegex.test(date)) {
      console.error('Invalid date format:', date)
      setError('Invalid date format. Please go back and select a valid date.')
      setLoading(false)
      return
    }

    const fetchMenu = async () => {
      try {
        setLoading(true)
        console.log('Fetching Sunday lunch menu for date:', date)
        const response = await fetch(`/api/table-bookings/menu/sunday-lunch?date=${date}`)
        
        if (!response.ok) {
          throw new Error('Failed to load menu')
        }
        
        const payload = await response.json()
        console.log('Menu API Response:', payload)

        if (payload.error) {
          setError(payload.error)
          setMenuData({ mains: [], sides: [] })
        } else {
          const result = payload.data || payload.menu || payload
          setMenuData({
            mains: Array.isArray(result?.mains)
              ? result.mains.map((item: any) => toMenuItem(item))
              : [],
            sides: Array.isArray(result?.sides)
              ? result.sides.map((item: any) => toMenuItem(item, { inferIncluded: true }))
              : []
          })
        }
      } catch (err) {
        console.error('Failed to fetch menu:', err)
        setError('Unable to load menu. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchMenu()
  }, [date])

  useEffect(() => {
    const optionalSides = (menuData.sides || []).filter(side => !side.included)
    setSideSelections(prev =>
      optionalSides.map(side => {
        const existing = prev.find(item => item.menu_item_id === side.id)
        return {
          menu_item_id: side.id,
          quantity: existing?.quantity ?? 0
        }
      })
    )
  }, [menuData.sides])

  useEffect(() => {
    if (!existingSummary || menuData.mains.length === 0) {
      return
    }

    setSelections(prev =>
      Array.from({ length: partySize }, (_, index) => {
        const summaryGuest = existingSummary.guests[index]
        if (!summaryGuest) {
          return {
            guest_name: `Guest ${index + 1}`,
            menu_item_id: prev[index]?.menu_item_id || ''
          }
        }

        const matchedMain = menuData.mains.find(item => item.name === summaryGuest.mainName)
        return {
          guest_name: summaryGuest.guestName || `Guest ${index + 1}`,
          menu_item_id: matchedMain?.id || ''
        }
      })
    )

    setSideSelections(prev => {
      const base = menuData.sides
        .filter(side => !side.included)
        .map(side => {
          const existingExtra = existingSummary.extras.find(extra => extra.name === side.name)
          return {
            menu_item_id: side.id,
            quantity: existingExtra?.quantity ?? 0
          }
        })

      return base.length > 0 ? base : prev
    })
  }, [existingSummary, menuData.mains, menuData.sides, partySize])

  const updateSelection = (index: number, field: 'guest_name' | 'menu_item_id', value: string) => {
    setSelections(prev => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const optionalSides = menuData.sides.filter(side => !side.included)
  const includedSides = menuData.sides.filter(side => side.included)

  const updateSideSelection = (sideId: string, quantity: number) => {
    setSideSelections(prev =>
      prev.map(selection =>
        selection.menu_item_id === sideId
          ? { ...selection, quantity }
          : selection
      )
    )
  }

  const menuComputation = useMemo(() => {
    const payload: MenuSelectionPayload[] = []
    const guests: MenuSummary['guests'] = []
    const extras: MenuSummary['extras'] = []

    selections.forEach((selection, index) => {
      const main = menuData.mains.find(item => item.id === selection.menu_item_id)
      if (!main) return

      const guestName = selection.guest_name?.trim() || `Guest ${index + 1}`

      payload.push({
        custom_item_name: main.name,
        item_type: 'main',
        quantity: 1,
        guest_name: guestName,
        price_at_booking: main.price
      })

      guests.push({
        guestName,
        mainName: main.name,
        price: main.price
      })

      includedSides.forEach(side => {
        payload.push({
          custom_item_name: side.name,
          item_type: 'side',
          quantity: 1,
          guest_name: guestName,
          price_at_booking: 0
        })
      })
    })

    sideSelections
      .filter(side => side.quantity > 0)
      .forEach(selection => {
        const sideItem = optionalSides.find(item => item.id === selection.menu_item_id)
        if (!sideItem) return

        extras.push({
          name: sideItem.name,
          quantity: selection.quantity,
          price: sideItem.price * selection.quantity
        })

        for (let i = 0; i < selection.quantity; i++) {
          payload.push({
            custom_item_name: sideItem.name,
            item_type: 'side',
            quantity: 1,
            guest_name: 'Table',
            price_at_booking: sideItem.price
          })
        }
      })

    const mainsTotal = guests.reduce((sum, guest) => sum + guest.price, 0)
    const extrasTotal = extras.reduce((sum, extra) => sum + extra.price, 0)
    const deposit = partySize * 5

    const summary: MenuSummary = {
      guests,
      extras,
      totals: {
        mains: mainsTotal,
        extras: extrasTotal,
        total: mainsTotal + extrasTotal,
        deposit
      }
    }

    return { payload, summary }
  }, [selections, sideSelections, includedSides, optionalSides, partySize, menuData.mains])

  const totals = menuComputation.summary.totals
  const allGuestsSelected = selections.every(selection => selection.menu_item_id)

  useEffect(() => {
    const isValid = allGuestsSelected && menuComputation.payload.length > 0
    onValidityChange?.(isValid)

    if (isValid) {
      onChange(menuComputation.payload, menuComputation.summary)
    }
  }, [allGuestsSelected, menuComputation, onChange, onValidityChange])

  // Show loading state
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-anchor-green mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading menu...</p>
      </div>
    )
  }

  // Show error state
  if (error || menuData.mains.length === 0) {
    return (
      <div className="text-center py-12">
        <Icon name="alert" className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-600 mb-2">Unable to Load Menu</h3>
        <p className="text-red-600 mb-4">{error || 'Menu not available for the selected date'}</p>
        {date && (
          <p className="text-gray-600 text-sm mb-4">
            Selected date: {new Date(date + 'T12:00:00').toLocaleDateString('en-GB', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long',
              year: 'numeric'
            })}
          </p>
        )}
        <p className="text-sm text-gray-600">
          Give us a ring on 01753 682707 and we&apos;ll get you booked manually.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-anchor-charcoal mb-2">
          Select Your Sunday Roasts
        </h2>
        <p className="text-gray-600">
          Choose a main course for each guest
        </p>
      </div>

      {/* Menu Selections */}
      <div className="space-y-4">
        {selections.map((selection, index) => {
          const selectedMain = menuData.mains.find(item => item.id === selection.menu_item_id)
          return (
            <div key={index} className="bg-amber-50/40 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-amber-900">
                  Guest {index + 1}
                </h3>
                {selectedMain && (
                  <Badge variant="outline">{formatPrice(selectedMain.price, 'GBP')}</Badge>
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Guest name (optional)
                  </label>
                  <input
                    type="text"
                    value={selection.guest_name}
                    onChange={(e) => updateSelection(index, 'guest_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-anchor-green"
                    placeholder={`Guest ${index + 1}`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Main course
                  </label>
                  <select
                    value={selection.menu_item_id}
                    onChange={(e) => updateSelection(index, 'menu_item_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-anchor-green"
                    required
                  >
                    <option value="">Select a main course</option>
                    {menuData.mains.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name} — {formatPrice(item.price, 'GBP')}
                      </option>
                    ))}
                  </select>
                  {selectedMain?.description && (
                    <p className="mt-2 text-sm text-gray-600">
                      {selectedMain.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {includedSides.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex gap-3">
            <Icon name="info" className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-green-800">
              <p className="font-medium mb-1">Included with every roast:</p>
              <ul className="list-disc list-inside space-y-1">
                {includedSides.map(side => (
                  <li key={side.id}>{side.name}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {optionalSides.length > 0 && (
        <div className="bg-white border border-amber-200 rounded-lg p-4">
          <h3 className="font-semibold text-amber-900 mb-2">Optional extras for the table</h3>
          <p className="text-sm text-gray-600 mb-4">
            Add extra sides for everyone to share.
          </p>
          <div className="space-y-4">
            {optionalSides.map(side => {
              const selection = sideSelections.find(item => item.menu_item_id === side.id)
              return (
                <div key={side.id} className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-anchor-charcoal">{side.name}</p>
                    <p className="text-sm text-gray-600">{formatPrice(side.price, 'GBP')} each</p>
                    {side.description && (
                      <p className="text-sm text-gray-500 mt-1">{side.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <label htmlFor={`side-${side.id}`} className="text-sm">Qty</label>
                    <select
                      id={`side-${side.id}`}
                      value={selection?.quantity ?? 0}
                      onChange={(e) => updateSideSelection(side.id, Number(e.target.value))}
                      className="border rounded-md px-3 py-2"
                    >
                      {[0, 1, 2, 3, 4, 5].map(quantity => (
                        <option key={quantity} value={quantity}>{quantity}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm text-gray-700">
          <span>Mains total</span>
          <span>{formatPrice(totals.mains, 'GBP')}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-700">
          <span>Extras</span>
          <span>{formatPrice(totals.extras, 'GBP')}</span>
        </div>
        <div className="flex justify-between text-lg font-semibold pt-2 border-t border-amber-200">
          <span>Total</span>
          <span>{formatPrice(totals.total, 'GBP')}</span>
        </div>
        <div className="flex justify-between text-sm text-amber-800">
          <span>Deposit due now (GBP 5 per guest)</span>
          <span>{formatPrice(totals.deposit, 'GBP')}</span>
        </div>
        {menuComputation.summary.extras.length > 0 && (
          <div className="text-xs text-gray-600">
            Extras: {menuComputation.summary.extras.map(extra => `${extra.name} ×${extra.quantity}`).join(', ')}
          </div>
        )}
        <p className="text-xs text-amber-700">
          Deposits are deducted from your final bill on the day. Please let us know about any changes before Saturday 1pm.
        </p>
      </div>

      <Alert variant="info">
        <p className="font-medium">Booking deadline</p>
        <p className="text-sm mt-1">
          Sunday lunch bookings, including all pre-orders, must be confirmed by 1pm on Saturday so we can prepare everything fresh.
        </p>
      </Alert>

      <Alert variant="info">
        <p className="font-medium">Booking deadline</p>
        <p className="text-sm mt-1">
          Sunday lunch bookings, including all pre-orders, must be confirmed by 1pm on Saturday so we can prepare everything fresh.
        </p>
        {!allGuestsSelected && (
          <p className="text-sm mt-2 text-amber-800">
            Choose a roast for every guest to enable the confirmation button.
          </p>
        )}
      </Alert>
    </div>
  )
}
