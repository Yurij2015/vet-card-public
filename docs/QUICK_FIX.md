# Quick Start: Fixing "Maximum Recursive Updates" Error

## The Problem You're Experiencing

Your console shows:
```
Maximum recursive updates exceeded in component <VetCardView>
```

This happens when:
- `ContentTab` emits → `VetCardView` updates → triggers watch → `ContentTab` reacts → emits again → **LOOP!**

## Quick Fix

### Step 1: Import the Helper
```typescript
import { createSafeEmitter, watchWithGuard, createMutationGuard } from '@/utils/reactivity-helpers'
```

### Step 2: Fix Your Child Component (ContentTab.vue)

**Before (causes loop):**
```vue
<script setup lang="ts">
const emit = defineEmits(['update'])

// ❌ BAD: Might emit duplicates
watch(() => selectedData, (newVal) => {
  emit('update', newVal)
})

// ❌ WORSE: Emitting from computed!
const selectedDoctors = computed(() => {
  const result = { doctor_ids: [], allDoctors: 14 }
  emit('update', result) // NEVER DO THIS!
  return result
})
</script>
```

**After (fixed):**
```vue
<script setup lang="ts">
import { createSafeEmitter, watchWithGuard } from '@/utils/reactivity-helpers'

const emit = defineEmits(['update'])
const safeEmit = createSafeEmitter(emit) // Wrap emit

// ✅ GOOD: Pure computed (no side effects)
const selectedDoctors = computed(() => ({
  doctor_ids: formData.value.doctor_ids,
  allDoctors: 14
}))

// ✅ GOOD: Watch and emit safely
watchWithGuard(
  () => formData.value,
  (newVal) => {
    safeEmit('update', {
      service_ids: newVal.service_ids,
      doctor_ids: newVal.doctor_ids
    })
  },
  { deep: true, flush: 'post' }
)
</script>
```

### Step 3: Fix Your Parent Component (VetCardView.vue)

**Before (causes loop):**
```vue
<script setup lang="ts">
const formData = ref({ service_ids: [], doctor_ids: [] })

// ❌ BAD: Might trigger child to emit again
watch(() => formData.service_ids, () => {
  // Some logic that updates formData
  formData.value.doctor_ids = []
})

// Receives update from child
const handleUpdate = (data) => {
  formData.value = data // This triggers the watch above!
}
</script>
```

**After (fixed):**
```vue
<script setup lang="ts">
import { watchWithGuard, createMutationGuard } from '@/utils/reactivity-helpers'

const formData = ref({ service_ids: [], doctor_ids: [] })
const guard = createMutationGuard()

// ✅ GOOD: Guarded watch
watchWithGuard(
  () => formData.value.service_ids,
  () => {
    if (guard.isUpdating()) return
    
    guard.run(() => {
      formData.value.doctor_ids = []
    })
  },
  { flush: 'post' }
)

// ✅ GOOD: Guarded update from child
const handleUpdate = (data) => {
  if (guard.isUpdating()) return
  
  guard.run(() => {
    formData.value = data
  })
}
</script>

<template>
  <ContentTab @update="handleUpdate" />
</template>
```

## Common Patterns

### Pattern 1: Service/Doctor Selection
When selecting a service should clear doctors:

```typescript
const guard = createMutationGuard()
const formData = ref({ service_ids: [], doctor_ids: [] })

watchWithGuard(
  () => formData.value.service_ids,
  (newIds, oldIds) => {
    if (guard.isUpdating()) return
    
    console.log('Services changed:', newIds)
    
    guard.run(() => {
      // Clear doctors when services change
      if (formData.value.doctor_ids.length > 0) {
        formData.value.doctor_ids = []
      }
    })
  },
  { flush: 'post' }
)
```

### Pattern 2: Parent-Child Communication
Use v-model correctly:

```vue
<!-- Child Component -->
<script setup lang="ts">
import { createSafeEmitter, watchWithGuard } from '@/utils/reactivity-helpers'

const props = defineProps<{ modelValue: any }>()
const emit = defineEmits(['update:modelValue'])
const safeEmit = createSafeEmitter(emit)

const localValue = ref(props.modelValue)

// Emit changes safely
watchWithGuard(
  () => localValue.value,
  (newVal) => {
    safeEmit('update:modelValue', newVal)
  },
  { deep: true }
)

// Update from parent
watchWithGuard(
  () => props.modelValue,
  (newVal) => {
    localValue.value = newVal
  }
)
</script>

<!-- Parent Component -->
<template>
  <ChildComponent v-model="formData" />
</template>
```

### Pattern 3: Multiple Watchers
When you have multiple related watchers:

```typescript
const guard = createMutationGuard()

watchWithGuard(
  () => formData.value.service_ids,
  () => {
    if (guard.isUpdating()) return
    guard.run(() => {
      // Update related data
      formData.value.doctor_ids = []
    })
  }
)

watchWithGuard(
  () => formData.value.doctor_ids,
  () => {
    if (guard.isUpdating()) return
    guard.run(() => {
      // Update something else
    })
  }
)
```

## Debug Your Code

Add this temporarily to find the source of the loop:

```typescript
import { debugWatch } from '@/utils/reactivity-helpers'

// This will throw an error after 20 calls and show you the stack trace
debugWatch(
  () => formData.value,
  (newVal) => {
    // Your logic
  },
  { 
    name: 'formData-debug',
    maxCalls: 20,
    deep: true 
  }
)
```

## Checklist

Before you commit your fix, verify:

- [ ] No `emit()` calls inside computed properties
- [ ] All watchers use `watchWithGuard` or have manual change detection
- [ ] Parent-child updates use `createMutationGuard()`
- [ ] Event emissions use `createSafeEmitter()`
- [ ] Watchers that update UI use `flush: 'post'`
- [ ] Console shows no recursive update errors
- [ ] Vue DevTools shows no infinite re-renders

## Still Having Issues?

1. **Share your component code**: Focus on VetCardView.vue, ContentTab.vue, and MobilePreview.vue
2. **Check line numbers**: The error mentions specific lines - look at those first
3. **Read the full guide**: See [docs/reactivity-helpers-usage.md](./reactivity-helpers-usage.md)
4. **Check troubleshooting**: See [TROUBLESHOOTING.md](../TROUBLESHOOTING.md)

## Need More Examples?

See the full usage guide with complete examples:
- [Reactivity Helpers Usage](./reactivity-helpers-usage.md)
- [Troubleshooting Guide](../TROUBLESHOOTING.md)
