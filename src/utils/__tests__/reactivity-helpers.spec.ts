import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, nextTick } from 'vue'
import {
  deepEqual,
  arraysEqual,
  watchWithGuard,
  createSafeEmitter,
  debouncedWatch,
  createTrackedRef,
  watchMultiple,
  createMutationGuard,
  debugWatch
} from '../reactivity-helpers'

describe('deepEqual', () => {
  it('should return true for identical primitives', () => {
    expect(deepEqual(1, 1)).toBe(true)
    expect(deepEqual('test', 'test')).toBe(true)
    expect(deepEqual(true, true)).toBe(true)
  })

  it('should return false for different primitives', () => {
    expect(deepEqual(1, 2)).toBe(false)
    expect(deepEqual('test', 'test2')).toBe(false)
  })

  it('should return true for deeply equal objects', () => {
    expect(deepEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true)
    expect(deepEqual({ a: { b: 1 } }, { a: { b: 1 } })).toBe(true)
  })

  it('should return false for different objects', () => {
    expect(deepEqual({ a: 1 }, { a: 2 })).toBe(false)
    expect(deepEqual({ a: 1 }, { b: 1 })).toBe(false)
  })

  it('should handle null and undefined', () => {
    expect(deepEqual(null, null)).toBe(true)
    expect(deepEqual(undefined, undefined)).toBe(true)
    expect(deepEqual(null, undefined)).toBe(false)
  })
})

describe('arraysEqual', () => {
  it('should return true for identical arrays', () => {
    expect(arraysEqual([1, 2, 3], [1, 2, 3])).toBe(true)
  })

  it('should return false for different arrays', () => {
    expect(arraysEqual([1, 2, 3], [1, 2, 4])).toBe(false)
    expect(arraysEqual([1, 2], [1, 2, 3])).toBe(false)
  })

  it('should handle empty arrays', () => {
    expect(arraysEqual([], [])).toBe(true)
  })
})

describe('watchWithGuard', () => {
  it('should not trigger callback when value does not change', async () => {
    const data = ref({ a: 1 })
    const callback = vi.fn()

    watchWithGuard(() => data.value, callback)

    // Trigger with same value
    data.value = { a: 1 }
    await nextTick()

    expect(callback).not.toHaveBeenCalled()
  })

  it('should trigger callback when value changes', async () => {
    const data = ref({ a: 1 })
    const callback = vi.fn()

    watchWithGuard(() => data.value, callback)

    data.value = { a: 2 }
    await nextTick()

    expect(callback).toHaveBeenCalledTimes(1)
  })
})

describe('createSafeEmitter', () => {
  it('should emit first time', () => {
    const emit = vi.fn()
    const safeEmit = createSafeEmitter(emit)

    safeEmit('update', { a: 1 })

    expect(emit).toHaveBeenCalledWith('update', { a: 1 })
  })

  it('should not emit duplicate events', () => {
    const emit = vi.fn()
    const safeEmit = createSafeEmitter(emit)

    safeEmit('update', { a: 1 })
    safeEmit('update', { a: 1 })

    expect(emit).toHaveBeenCalledTimes(1)
  })

  it('should emit when data changes', () => {
    const emit = vi.fn()
    const safeEmit = createSafeEmitter(emit)

    safeEmit('update', { a: 1 })
    safeEmit('update', { a: 2 })

    expect(emit).toHaveBeenCalledTimes(2)
  })

  it('should handle multiple different events', () => {
    const emit = vi.fn()
    const safeEmit = createSafeEmitter(emit)

    safeEmit('update', { a: 1 })
    safeEmit('change', { b: 2 })

    expect(emit).toHaveBeenCalledTimes(2)
  })
})

describe('debouncedWatch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('should debounce rapid changes', async () => {
    const data = ref(0)
    const callback = vi.fn()

    debouncedWatch(() => data.value, callback, 100)

    data.value = 1
    data.value = 2
    data.value = 3

    // Should not have called yet
    expect(callback).not.toHaveBeenCalled()

    // Fast-forward time
    vi.advanceTimersByTime(100)
    await nextTick()

    // Should have called once with latest value
    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith(3, expect.anything(), expect.anything())

    vi.useRealTimers()
  })

  it('should reset timer on new changes', async () => {
    const data = ref(0)
    const callback = vi.fn()

    debouncedWatch(() => data.value, callback, 100)

    data.value = 1
    vi.advanceTimersByTime(50)

    data.value = 2
    vi.advanceTimersByTime(50)

    // Should not have called yet (timer was reset)
    expect(callback).not.toHaveBeenCalled()

    vi.advanceTimersByTime(50)
    await nextTick()

    // Now should be called
    expect(callback).toHaveBeenCalledTimes(1)

    vi.useRealTimers()
  })
})

describe('createTrackedRef', () => {
  it('should create a ref with initial value', () => {
    const [data] = createTrackedRef({ a: 1 })
    expect(data.value).toEqual({ a: 1 })
  })

  it('should update when setData is called with new value', () => {
    const [data, setData] = createTrackedRef({ a: 1 })

    setData({ a: 2 })

    expect(data.value).toEqual({ a: 2 })
  })

  it('should not update when setData is called with same value', () => {
    const [data, setData] = createTrackedRef({ a: 1 })
    const original = data.value

    setData({ a: 1 })

    expect(data.value).toBe(original)
  })

  it('should correctly detect changes', () => {
    const [, , hasChanged] = createTrackedRef({ a: 1 })

    expect(hasChanged({ a: 1 })).toBe(false)
    expect(hasChanged({ a: 2 })).toBe(true)
  })
})

describe('watchMultiple', () => {
  it('should watch multiple sources', async () => {
    const a = ref(1)
    const b = ref(2)
    const callback = vi.fn()

    watchMultiple([() => a.value, () => b.value], callback)

    a.value = 10
    await nextTick()

    expect(callback).toHaveBeenCalledWith([10, 2], expect.anything(), expect.anything())
  })

  it('should not trigger when no values change', async () => {
    const a = ref(1)
    const b = ref(2)
    const callback = vi.fn()

    watchMultiple([() => a.value, () => b.value], callback)

    // Trigger watch but values are same
    a.value = 1
    await nextTick()

    expect(callback).not.toHaveBeenCalled()
  })
})

describe('createMutationGuard', () => {
  it('should allow first mutation', () => {
    const guard = createMutationGuard()
    const callback = vi.fn()

    expect(guard.isUpdating()).toBe(false)
    guard.run(callback)
    expect(callback).toHaveBeenCalled()
  })

  it('should block nested mutations', () => {
    const guard = createMutationGuard()
    const innerCallback = vi.fn()

    guard.run(() => {
      expect(guard.isUpdating()).toBe(true)
      guard.run(innerCallback)
    })

    expect(innerCallback).not.toHaveBeenCalled()
  })

  it('should reset after mutation completes', async () => {
    const guard = createMutationGuard()

    guard.run(() => {
      expect(guard.isUpdating()).toBe(true)
    })

    // Wait for timeout
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(guard.isUpdating()).toBe(false)
  })
})

describe('debugWatch', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  it('should log watch calls', async () => {
    const data = ref(1)
    const callback = vi.fn()

    debugWatch(() => data.value, callback, { name: 'test' })

    data.value = 2
    await nextTick()

    expect(console.log).toHaveBeenCalled()
    expect(callback).toHaveBeenCalled()
  })

  it('should detect loops', async () => {
    const data = ref(0)

    expect(() => {
      debugWatch(
        () => data.value,
        () => {
          data.value++
        },
        { name: 'loop-test', maxCalls: 5 }
      )

      // Trigger the loop
      data.value = 1
    }).rejects.toThrow()
  })
})
