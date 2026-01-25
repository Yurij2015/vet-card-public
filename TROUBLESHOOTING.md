# Troubleshooting Guide

## Maximum Recursive Updates Error

### Symptoms
```
Uncaught (in promise) Maximum recursive updates exceeded in component <VetCardView>.
This means you have a reactive effect that is mutating its own dependencies and 
thus recursively triggering itself.
```

### Root Cause
This error occurs when reactive effects create an infinite loop by modifying the same data they're watching.

### Common Patterns That Cause This

#### 1. Watch Modifying Its Own Source
```typescript
// ❌ WRONG - Creates infinite loop
watch(() => formData.service_ids, (newVal) => {
  formData.service_ids = [...newVal] // Triggers watch again!
})

// ✅ CORRECT - Use different property or add guard
watch(() => formData.service_ids, (newVal, oldVal) => {
  if (JSON.stringify(newVal) === JSON.stringify(oldVal)) return
  // Process without modifying service_ids
})
```

#### 2. Parent-Child Emit Loop
```typescript
// Child Component
watch(() => props.modelValue, () => {
  emit('update', props.modelValue) // ❌ Bad!
})

// Parent Component  
const handleUpdate = (data) => {
  formData.value = data // This updates props, triggering child watch!
}

// ✅ CORRECT - Add change detection
const lastEmittedValue = ref(null)

const emitUpdate = (data) => {
  const stringified = JSON.stringify(data)
  if (stringified === lastEmittedValue.value) return
  lastEmittedValue.value = stringified
  emit('update', data)
}
```

#### 3. Emitting from Computed Properties
```typescript
// ❌ WRONG - Computed properties should not have side effects
const selectedDoctors = computed(() => {
  const result = { doctor_ids: [], allDoctors: 14 }
  emit('update', result) // BAD! Never emit from computed
  return result
})

// ✅ CORRECT - Use watch for side effects
const selectedDoctors = computed(() => {
  return { doctor_ids: [], allDoctors: 14 }
})

watch(selectedDoctors, (newVal) => {
  emit('update', newVal)
})
```

#### 4. Multiple Watchers Affecting Each Other
```typescript
// ❌ WRONG - Circular dependency
watch(() => formData.service_ids, () => {
  formData.doctor_ids = [] // Triggers doctor_ids watcher
})

watch(() => formData.doctor_ids, () => {
  formData.service_ids = [] // Triggers service_ids watcher - LOOP!
})

// ✅ CORRECT - Use update flag
const isInternalUpdate = ref(false)

watch(() => formData.service_ids, () => {
  if (isInternalUpdate.value) return
  isInternalUpdate.value = true
  formData.doctor_ids = []
  nextTick(() => { isInternalUpdate.value = false })
})
```

### Solutions

#### Solution 1: Use `flush: 'post'`
Run watchers after DOM updates to prevent immediate re-triggering:
```typescript
watch(() => formData.service_ids, handler, { 
  flush: 'post' 
})
```

#### Solution 2: Add Change Guards
Always check if the value actually changed:
```typescript
watch(() => formData.service_ids, (newVal, oldVal) => {
  // Deep equality check
  if (JSON.stringify(newVal) === JSON.stringify(oldVal)) return
  
  // Or for arrays
  if (newVal.length === oldVal.length && 
      newVal.every((val, idx) => val === oldVal[idx])) return
  
  // Your logic here
})
```

#### Solution 3: Use v-model Correctly
For parent-child communication:
```vue
<!-- Child Component -->
<script setup lang="ts">
const props = defineProps<{
  modelValue: any
}>()

const emit = defineEmits<{
  'update:modelValue': [value: any]
}>()

// Only emit on user interaction, not prop changes
const handleChange = (newValue: any) => {
  emit('update:modelValue', newValue)
}
</script>

<!-- Parent Component -->
<template>
  <ChildComponent v-model="formData" />
</template>
```

#### Solution 4: Separate Watched Data from Updated Data
```typescript
// Instead of modifying watched data
const inputData = ref({ service_ids: [] })
const processedData = ref({ service_ids: [] })

watch(() => inputData.service_ids, (newVal) => {
  // Modify different property
  processedData.value.service_ids = processIds(newVal)
})
```

### Debugging Steps

1. **Add Debug Logging**
```typescript
let watchCallCount = 0

watch(() => formData, (newVal) => {
  console.log('Watch triggered:', ++watchCallCount)
  if (watchCallCount > 100) {
    console.trace('Infinite loop detected!')
    throw new Error('Watch loop detected')
  }
}, { deep: true })
```

2. **Check Browser Console**
Look for patterns in the logs:
- Same component name appearing repeatedly
- Same line numbers being called in sequence
- Growing arrays or objects

3. **Temporarily Disable Watchers**
Comment out watchers one by one to identify the culprit:
```typescript
// watch(() => formData.service_ids, handler) // Disabled for testing
```

4. **Use Vue DevTools**
- Check the component tree for infinite re-renders
- Monitor reactive data changes in real-time
- Look at event emissions

### Prevention Checklist

- [ ] Never emit events from computed properties
- [ ] Always add change guards in watchers
- [ ] Don't modify watched properties in the watcher
- [ ] Use `v-model` pattern for parent-child communication
- [ ] Consider using `flush: 'post'` for UI-related watchers
- [ ] Avoid circular dependencies between watchers
- [ ] Use `nextTick()` when you must update watched data
- [ ] Keep computed properties pure (no side effects)

### Example: Complete Fixed Component

```vue
<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'

const props = defineProps<{
  initialData?: any
}>()

const emit = defineEmits<{
  'update': [data: any]
}>()

// Separate input and output data
const formData = ref({
  service_ids: [],
  doctor_ids: []
})

// Track last emitted to prevent loops
const lastEmitted = ref('')

// Pure computed property
const selectedServices = computed(() => {
  return {
    service_ids: formData.value.service_ids,
    allServices: 2
  }
})

// Watch with guard
watch(() => formData.value.service_ids, (newVal, oldVal) => {
  // Guard: check if actually changed
  if (JSON.stringify(newVal) === JSON.stringify(oldVal)) return
  
  // Clear doctors when services change
  if (formData.value.doctor_ids.length > 0) {
    formData.value.doctor_ids = []
  }
}, { flush: 'post' })

// Emit with loop prevention
watch(formData, (newVal) => {
  const serialized = JSON.stringify(newVal)
  if (serialized === lastEmitted.value) return
  
  lastEmitted.value = serialized
  emit('update', { ...newVal })
}, { deep: true, flush: 'post' })

// Handle external updates
watch(() => props.initialData, (newVal) => {
  if (!newVal) return
  
  const serialized = JSON.stringify(newVal)
  if (serialized === JSON.stringify(formData.value)) return
  
  formData.value = { ...newVal }
}, { immediate: true })
</script>
```

### Need More Help?

If you're still experiencing issues:

1. Share the specific component code (VetCardView.vue, ContentTab.vue, etc.)
2. Include the full error stack trace
3. Describe what user action triggers the error
4. Share your Vue version: `npm list vue`

### Related Resources

- [Vue 3 Reactivity Fundamentals](https://vuejs.org/guide/essentials/reactivity-fundamentals.html)
- [Watchers](https://vuejs.org/guide/essentials/watchers.html)
- [Component v-model](https://vuejs.org/guide/components/v-model.html)
