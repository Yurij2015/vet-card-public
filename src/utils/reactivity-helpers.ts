/**
 * Utility functions to prevent recursive update issues in Vue 3
 */

import { ref, watch, type Ref, type WatchSource, type WatchCallback, type WatchOptions } from 'vue'

/**
 * Deep equality check for objects and arrays
 */
export function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true

  if (obj1 == null || obj2 == null) return obj1 === obj2

  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false

  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)

  if (keys1.length !== keys2.length) return false

  for (const key of keys1) {
    if (!keys2.includes(key)) return false
    if (!deepEqual(obj1[key], obj2[key])) return false
  }

  return true
}

/**
 * Array equality check
 */
export function arraysEqual<T>(arr1: T[], arr2: T[]): boolean {
  if (arr1.length !== arr2.length) return false
  return arr1.every((val, idx) => val === arr2[idx])
}

/**
 * Watch with automatic change detection to prevent unnecessary triggers
 *
 * @example
 * watchWithGuard(() => formData.service_ids, (newVal) => {
 *   // Only called when value actually changes
 * })
 */
export function watchWithGuard<T>(
  source: WatchSource<T>,
  callback: WatchCallback<T>,
  options?: WatchOptions
) {
  return watch(source, (newVal, oldVal) => {
    // Skip if values are deeply equal
    if (deepEqual(newVal, oldVal)) return

    callback(newVal, oldVal, () => {})
  }, options)
}

/**
 * Create a safe emitter that prevents duplicate emissions
 *
 * @example
 * const emit = defineEmits(['update'])
 * const safeEmit = createSafeEmitter(emit)
 *
 * // Only emits if data actually changed
 * safeEmit('update', { service_ids: [1, 2, 3] })
 */
export function createSafeEmitter(emit: Function) {
  const lastEmitted = new Map<string, string>()

  return (event: string, ...args: any[]) => {
    const serialized = JSON.stringify(args)
    const lastValue = lastEmitted.get(event)

    if (serialized === lastValue) {
      console.debug(`[SafeEmit] Skipped duplicate emission of "${event}"`)
      return
    }

    lastEmitted.set(event, serialized)
    emit(event, ...args)
  }
}

/**
 * Create a debounced watch to prevent rapid consecutive triggers
 *
 * @example
 * debouncedWatch(() => searchQuery, (newVal) => {
 *   // Called 300ms after last change
 * }, 300)
 */
export function debouncedWatch<T>(
  source: WatchSource<T>,
  callback: WatchCallback<T>,
  delay: number = 300,
  options?: WatchOptions
) {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return watch(source, (newVal, oldVal, onCleanup) => {
    if (timeout) clearTimeout(timeout)

    timeout = setTimeout(() => {
      callback(newVal, oldVal, onCleanup)
    }, delay)

    onCleanup(() => {
      if (timeout) clearTimeout(timeout)
    })
  }, options)
}

/**
 * Create a ref with change tracking to prevent recursive updates
 *
 * @example
 * const [data, setData, hasChanged] = createTrackedRef({ ids: [] })
 *
 * watch(() => props.data, (newVal) => {
 *   if (!hasChanged(newVal)) return
 *   setData(newVal)
 * })
 */
export function createTrackedRef<T>(initialValue: T): [
  Ref<T>,
  (newValue: T) => void,
  (compareValue: T) => boolean
] {
  const data = ref(initialValue) as Ref<T>
  const lastValue = ref<string>(JSON.stringify(initialValue))

  const setData = (newValue: T) => {
    const serialized = JSON.stringify(newValue)
    if (serialized === lastValue.value) return

    lastValue.value = serialized
    data.value = newValue
  }

  const hasChanged = (compareValue: T): boolean => {
    const serialized = JSON.stringify(compareValue)
    return serialized !== lastValue.value
  }

  return [data, setData, hasChanged]
}

/**
 * Watch multiple sources with a single guard
 *
 * @example
 * watchMultiple(
 *   [() => formData.service_ids, () => formData.doctor_ids],
 *   ([services, doctors]) => {
 *     // Only called when either actually changes
 *   }
 * )
 */
export function watchMultiple<T extends readonly unknown[]>(
  sources: readonly [...{ [K in keyof T]: WatchSource<T[K]> }],
  callback: WatchCallback<T>,
  options?: WatchOptions
) {
  return watch(sources, (newVals: any, oldVals: any) => {
    // Check if any value actually changed
    const hasChanges = newVals.some((val: any, idx: number) =>
      !deepEqual(val, oldVals?.[idx])
    )

    if (!hasChanges) return

    callback(newVals, oldVals, () => {})
  }, options)
}

/**
 * Create a mutation guard to prevent circular updates
 *
 * @example
 * const guard = createMutationGuard()
 *
 * watch(() => formData.service_ids, () => {
 *   if (guard.isUpdating()) return
 *
 *   guard.run(() => {
 *     formData.doctor_ids = []
 *   })
 * })
 */
export function createMutationGuard() {
  const isUpdating = ref(false)

  return {
    isUpdating: () => isUpdating.value,

    run: (callback: () => void) => {
      if (isUpdating.value) {
        console.warn('[MutationGuard] Blocked nested mutation')
        return
      }

      isUpdating.value = true
      try {
        callback()
      } finally {
        // Use setTimeout to reset after current update cycle
        setTimeout(() => {
          isUpdating.value = false
        }, 0)
      }
    }
  }
}

/**
 * Debug watch that logs all changes and detects potential loops
 *
 * @example
 * debugWatch(() => formData, (newVal) => {
 *   // Logs changes and warns if called too frequently
 * }, { name: 'formData watcher' })
 */
export function debugWatch<T>(
  source: WatchSource<T>,
  callback: WatchCallback<T>,
  options?: WatchOptions & { name?: string, maxCalls?: number }
) {
  const { name = 'anonymous', maxCalls = 100, ...watchOptions } = options || {}
  let callCount = 0
  let lastCallTime = Date.now()

  return watch(source, (newVal, oldVal, onCleanup) => {
    callCount++
    const now = Date.now()
    const timeSinceLastCall = now - lastCallTime
    lastCallTime = now

    console.log(`[Watch:${name}] Call #${callCount} (${timeSinceLastCall}ms since last)`, {
      newVal,
      oldVal
    })

    if (callCount > maxCalls) {
      console.error(`[Watch:${name}] LOOP DETECTED! Called ${callCount} times`)
      console.trace()
      throw new Error(`Watch loop detected in "${name}"`)
    }

    if (timeSinceLastCall < 10 && callCount > 10) {
      console.warn(`[Watch:${name}] Rapid calls detected - possible loop`)
    }

    callback(newVal, oldVal, onCleanup)
  }, watchOptions)
}

/**
 * Type-safe event emitter wrapper with duplicate prevention
 */
export interface SafeEmitter<T extends Record<string, any>> {
  emit: <K extends keyof T>(event: K, ...args: T[K] extends Array<any> ? T[K] : [T[K]]) => void
  reset: () => void
}

export function createTypedSafeEmitter<T extends Record<string, any>>(
  emit: Function
): SafeEmitter<T> {
  const lastEmitted = new Map<string, string>()

  return {
    emit: (event, ...args) => {
      const serialized = JSON.stringify(args)
      const lastValue = lastEmitted.get(event as string)

      if (serialized === lastValue) {
        console.debug(`[SafeEmit] Skipped duplicate emission of "${String(event)}"`)
        return
      }

      lastEmitted.set(event as string, serialized)
      // Cast to any[] to allow spreading
      emit(event as string, ...(args as any[]))
    },

    reset: () => {
      lastEmitted.clear()
    }
  }
}
