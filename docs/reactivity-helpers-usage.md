# Reactivity Helpers Usage Examples

## Overview

This document shows how to use the reactivity helper utilities to prevent "Maximum recursive updates" errors in Vue 3 components.

## Installation

The utilities are located in `/src/utils/reactivity-helpers.ts` and can be imported as needed:

```typescript
import { watchWithGuard, createSafeEmitter, createMutationGuard } from '@/utils/reactivity-helpers'
```

## Examples

### 1. Safe Watch with Automatic Change Detection

**Problem:** Watch triggers even when values haven't changed.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { watchWithGuard } from '@/utils/reactivity-helpers'

const formData = ref({
  service_ids: [],
  doctor_ids: []
})

// ✅ Only triggers when service_ids actually changes
watchWithGuard(
  () => formData.value.service_ids,
  (newIds) => {
    console.log('Service IDs changed:', newIds)
    // Clear doctors when services change
    formData.value.doctor_ids = []
  }
)
</script>
```

### 2. Safe Emitter (Prevent Duplicate Events)

**Problem:** Component emits same event multiple times causing parent to update unnecessarily.

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'
import { createSafeEmitter } from '@/utils/reactivity-helpers'

const emit = defineEmits<{
  'update': [data: { service_ids: number[], doctor_ids: number[] }]
}>()

// Wrap the emit function
const safeEmit = createSafeEmitter(emit)

const formData = ref({
  service_ids: [],
  doctor_ids: []
})

watch(formData, (newData) => {
  // ✅ Only emits if data actually changed
  safeEmit('update', newData)
}, { deep: true })
</script>
```

### 3. Mutation Guard (Prevent Circular Updates)

**Problem:** Two watchers updating each other's watched properties.

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'
import { createMutationGuard } from '@/utils/reactivity-helpers'

const guard = createMutationGuard()

const formData = ref({
  service_ids: [],
  doctor_ids: []
})

watch(() => formData.value.service_ids, () => {
  // ✅ Prevents re-entry during update
  if (guard.isUpdating()) return
  
  guard.run(() => {
    // Clear doctors when services change
    formData.value.doctor_ids = []
  })
})

watch(() => formData.value.doctor_ids, () => {
  if (guard.isUpdating()) return
  
  guard.run(() => {
    // Some logic that might affect services
  })
})
</script>
```

### 4. Tracked Ref (Change Detection)

**Problem:** Need to update ref only when value actually changes.

```vue
<script setup lang="ts">
import { watch } from 'vue'
import { createTrackedRef } from '@/utils/reactivity-helpers'

const props = defineProps<{
  initialData: { service_ids: number[], doctor_ids: number[] }
}>()

// ✅ Automatically tracks changes
const [formData, setFormData, hasChanged] = createTrackedRef(props.initialData)

// Only updates if value is different
watch(() => props.initialData, (newData) => {
  if (!hasChanged(newData)) return
  setFormData(newData)
})
</script>
```

### 5. Debounced Watch (Rate Limiting)

**Problem:** Watch triggers too frequently during rapid changes.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { debouncedWatch } from '@/utils/reactivity-helpers'

const searchQuery = ref('')
const searchResults = ref([])

// ✅ Only triggers 300ms after last change
debouncedWatch(
  () => searchQuery.value,
  async (query) => {
    if (!query) {
      searchResults.value = []
      return
    }
    
    searchResults.value = await fetchResults(query)
  },
  300 // delay in milliseconds
)
</script>
```

### 6. Watch Multiple Sources

**Problem:** Need to watch multiple properties efficiently.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { watchMultiple } from '@/utils/reactivity-helpers'

const formData = ref({
  service_ids: [],
  doctor_ids: []
})

// ✅ Watches both and only triggers on actual changes
watchMultiple(
  [
    () => formData.value.service_ids,
    () => formData.value.doctor_ids
  ],
  ([services, doctors]) => {
    console.log('Either services or doctors changed:', { services, doctors })
  }
)
</script>
```

### 7. Debug Watch (Development Tool)

**Problem:** Need to debug why watch is triggering so frequently.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { debugWatch } from '@/utils/reactivity-helpers'

const formData = ref({
  service_ids: [],
  doctor_ids: []
})

// ✅ Logs all changes and detects loops
debugWatch(
  () => formData.value,
  (newVal) => {
    // Your logic
  },
  {
    name: 'formData watcher',
    maxCalls: 50, // Throws error if called more than 50 times
    deep: true
  }
)
</script>
```

## Complete Example Component

Here's a complete example showing how to fix the VetCardView recursive update issue:

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  watchWithGuard, 
  createSafeEmitter, 
  createMutationGuard 
} from '@/utils/reactivity-helpers'

interface Props {
  initialServices?: number[]
  initialDoctors?: number[]
}

const props = withDefaults(defineProps<Props>(), {
  initialServices: () => [],
  initialDoctors: () => []
})

const emit = defineEmits<{
  'update': [data: { service_ids: number[], doctor_ids: number[] }]
}>()

// Create safe emitter
const safeEmit = createSafeEmitter(emit)

// Create mutation guard
const guard = createMutationGuard()

// Form data
const formData = ref({
  service_ids: [...props.initialServices],
  doctor_ids: [...props.initialDoctors]
})

// Pure computed properties (no side effects!)
const selectedServices = computed(() => ({
  service_ids: formData.value.service_ids,
  allServices: 2,
  allServicesData: [] // Load from store or API
}))

const selectedDoctors = computed(() => ({
  doctor_ids: formData.value.doctor_ids,
  allDoctors: 14,
  allDoctorsData: [] // Load from store or API
}))

// Watch service changes and clear doctors
watchWithGuard(
  () => formData.value.service_ids,
  (newServiceIds, oldServiceIds) => {
    console.log('📊 Service IDs changed:', newServiceIds)
    
    // Use guard to prevent circular updates
    if (guard.isUpdating()) return
    
    guard.run(() => {
      // Clear doctors when services change
      if (formData.value.doctor_ids.length > 0) {
        formData.value.doctor_ids = []
      }
    })
  },
  { flush: 'post' }
)

// Watch form data and emit to parent
watchWithGuard(
  () => formData.value,
  (newData) => {
    console.log('✅ Form data updated:', newData)
    
    // Use safe emit to prevent duplicate emissions
    safeEmit('update', {
      service_ids: [...newData.service_ids],
      doctor_ids: [...newData.doctor_ids]
    })
  },
  { 
    deep: true,
    flush: 'post'
  }
)

// Handle external updates from parent
watchWithGuard(
  () => [props.initialServices, props.initialDoctors],
  ([services, doctors]) => {
    if (guard.isUpdating()) return
    
    guard.run(() => {
      formData.value = {
        service_ids: [...services],
        doctor_ids: [...doctors]
      }
    })
  }
)

// Methods
const updateServices = (serviceIds: number[]) => {
  if (guard.isUpdating()) return
  
  guard.run(() => {
    formData.value.service_ids = [...serviceIds]
  })
}

const updateDoctors = (doctorIds: number[]) => {
  if (guard.isUpdating()) return
  
  guard.run(() => {
    formData.value.doctor_ids = [...doctorIds]
  })
}
</script>

<template>
  <div class="vet-card-view">
    <h2>Selected Services: {{ selectedServices.service_ids.length }}</h2>
    <h2>Selected Doctors: {{ selectedDoctors.doctor_ids.length }}</h2>
    
    <!-- Your template here -->
  </div>
</template>
```

## Best Practices

1. **Always use guards when modifying watched data**
   ```typescript
   if (guard.isUpdating()) return
   guard.run(() => { /* mutations */ })
   ```

2. **Use `flush: 'post'` for UI-related watchers**
   ```typescript
   watch(source, handler, { flush: 'post' })
   ```

3. **Keep computed properties pure**
   ```typescript
   // ❌ Bad
   const data = computed(() => {
     emit('update', value) // Side effect!
     return value
   })
   
   // ✅ Good
   const data = computed(() => value)
   watch(data, () => emit('update', data.value))
   ```

4. **Use safeEmit for all event emissions in watched code**
   ```typescript
   const safeEmit = createSafeEmitter(emit)
   watch(data, () => safeEmit('update', data.value))
   ```

5. **Debug with debugWatch during development**
   ```typescript
   // Remove or disable in production
   if (import.meta.env.DEV) {
     debugWatch(() => formData.value, handler, { name: 'formData' })
   }
   ```

## Testing

To test that your fixes work:

1. Open Vue DevTools
2. Monitor component re-renders
3. Check console for debug logs
4. Verify no "Maximum recursive updates" errors

## Performance Tips

- Use `watchWithGuard` instead of plain `watch` for any watcher that might trigger frequently
- Use `debouncedWatch` for search inputs or frequent user interactions
- Use `watchMultiple` instead of multiple separate watchers when possible
- Always clean up watchers when components unmount (automatic with `watch` API)

## Troubleshooting

If you still encounter issues:

1. Enable debug mode:
   ```typescript
   import { debugWatch } from '@/utils/reactivity-helpers'
   debugWatch(() => data, handler, { name: 'my-watch', maxCalls: 10 })
   ```

2. Check for:
   - Emitting from computed properties
   - Modifying watched properties in watchers
   - Missing mutation guards
   - Missing change detection

3. See [TROUBLESHOOTING.md](../../TROUBLESHOOTING.md) for more help
