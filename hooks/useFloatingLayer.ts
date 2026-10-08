'use client'

import { useEffect, useSyncExternalStore } from 'react'
import { floatingLayers, watchOpenDialogs, type FloatingLayerId } from '@/lib/floating-layers'

// The page is watched for open dialogs from the first layer that mounts until
// the tab closes. The booking bar and the cookie banner are in the root layout,
// so in practice that is every page.
let dialogWatchStarted = false

function ensureDialogWatch(): void {
  if (dialogWatchStarted || typeof document === 'undefined') return
  dialogWatchStarted = true
  watchOpenDialogs(floatingLayers, document)
}

const notShowingOnServer = () => false

/**
 * A layer says whether it wants to be on screen and is told whether it may be.
 * The rules are in `lib/floating-layers.ts`. The layer must not decide for
 * itself by looking for other layers.
 */
export function useFloatingLayer(id: FloatingLayerId, wants: boolean): boolean {
  useEffect(() => {
    ensureDialogWatch()
    if (!wants) return
    return floatingLayers.request(id)
  }, [id, wants])

  const showing = useSyncExternalStore(
    floatingLayers.subscribe,
    () => floatingLayers.isShowing(id),
    notShowingOnServer
  )

  return wants && showing
}

/** Read whether another layer is on screen, without asking to show anything. */
export function useFloatingLayerShowing(id: FloatingLayerId): boolean {
  useEffect(() => {
    ensureDialogWatch()
  }, [])

  return useSyncExternalStore(
    floatingLayers.subscribe,
    () => floatingLayers.isShowing(id),
    notShowingOnServer
  )
}
