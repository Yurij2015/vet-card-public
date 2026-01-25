# Documentation Index

Welcome to the VetCard documentation! This guide will help you understand and fix common issues, especially the "Maximum Recursive Updates" error.

## Getting Started

- **[README_VETCARD.md](../README_VETCARD.md)** - Project overview, installation, and basic usage

## Troubleshooting

### Quick Fixes
- **[QUICK_FIX.md](./QUICK_FIX.md)** - ⚡ **START HERE** if you have the "Maximum Recursive Updates" error
- **[TROUBLESHOOTING.md](../TROUBLESHOOTING.md)** - Comprehensive troubleshooting guide

### Detailed Guides
- **[reactivity-helpers-usage.md](./reactivity-helpers-usage.md)** - Complete guide to using the reactivity helper utilities

## Understanding the Error

### What is "Maximum Recursive Updates"?

This Vue 3 error occurs when a reactive effect creates an infinite loop by continuously triggering itself. Common causes:

1. **Watcher modifying its own source**
   ```typescript
   watch(() => data.value, () => {
     data.value = newValue // Triggers itself!
   })
   ```

2. **Parent-child emit loop**
   - Child emits → Parent updates → Child's props change → Child emits again → Loop!

3. **Computed with side effects**
   ```typescript
   const data = computed(() => {
     emit('update', value) // Side effect in computed!
     return value
   })
   ```

## Solution Overview

We've created utility functions to prevent these issues:

### Key Utilities

| Utility | Purpose | When to Use |
|---------|---------|-------------|
| `watchWithGuard` | Watch with automatic change detection | Replace `watch` when you might get duplicate triggers |
| `createSafeEmitter` | Prevent duplicate event emissions | Wrap `emit` to avoid emitting same data twice |
| `createMutationGuard` | Prevent circular updates | When multiple watchers might affect each other |
| `debouncedWatch` | Rate-limit watch triggers | For search inputs or frequent changes |
| `debugWatch` | Debug infinite loops | During development to find the source |

### Quick Example

```typescript
import { createSafeEmitter, watchWithGuard, createMutationGuard } from '@/utils/reactivity-helpers'

const emit = defineEmits(['update'])
const safeEmit = createSafeEmitter(emit)
const guard = createMutationGuard()

const formData = ref({ service_ids: [], doctor_ids: [] })

// Watch with protection
watchWithGuard(
  () => formData.value.service_ids,
  () => {
    if (guard.isUpdating()) return
    
    guard.run(() => {
      formData.value.doctor_ids = []
      safeEmit('update', formData.value)
    })
  }
)
```

## File Structure

```
docs/
├── README.md                      # This file
├── QUICK_FIX.md                   # Quick solution guide
└── reactivity-helpers-usage.md    # Complete usage examples

src/utils/
├── reactivity-helpers.ts          # Utility functions
└── __tests__/
    └── reactivity-helpers.spec.ts # Unit tests

TROUBLESHOOTING.md                 # Main troubleshooting guide
README_VETCARD.md                  # Project README
```

## Step-by-Step Fix Guide

### 1. Identify the Problem
Look at your console error:
```
Maximum recursive updates exceeded in component <VetCardView>
ContentTab.vue:463
VetCardView.vue:119, 127, 205, 209
MobilePreview.vue:258, 268, 274
```

### 2. Check Those Line Numbers
- Line 463 in ContentTab - probably emitting from computed
- Lines 119, 127 in VetCardView - probably updating watched data
- Lines 205, 209 in VetCardView - probably watchers triggering each other

### 3. Apply the Fix
1. Import utilities: `import { createSafeEmitter, watchWithGuard } from '@/utils/reactivity-helpers'`
2. Replace `emit` with `safeEmit = createSafeEmitter(emit)`
3. Replace `watch` with `watchWithGuard` where needed
4. Add mutation guards for circular dependencies

### 4. Test
- Check console for errors
- Use Vue DevTools to monitor re-renders
- Verify functionality still works

## Best Practices

### ✅ Do's
- Keep computed properties pure (no side effects)
- Use `watchWithGuard` for watchers that might trigger frequently
- Wrap `emit` with `createSafeEmitter`
- Use mutation guards when watchers affect each other
- Add `flush: 'post'` for UI-related watchers
- Test with Vue DevTools

### ❌ Don'ts
- Don't emit from computed properties
- Don't modify watched data in the watcher
- Don't create circular dependencies without guards
- Don't ignore duplicate emissions
- Don't skip change detection

## Testing Your Fix

### Manual Testing
1. Open Vue DevTools
2. Enable component re-render tracking
3. Perform actions that previously caused the error
4. Verify no infinite loops in console
5. Check that functionality works correctly

### Automated Testing
```bash
npm run test:unit
```

Unit tests are provided for all utility functions.

## Common Scenarios

### Scenario 1: Multi-select with Dependencies
When selecting services should clear doctors:
- **Guide**: [QUICK_FIX.md](./QUICK_FIX.md#pattern-1-servicedoctor-selection)
- **Utilities**: `watchWithGuard`, `createMutationGuard`

### Scenario 2: Form with Preview
Parent form updates preview component:
- **Guide**: [QUICK_FIX.md](./QUICK_FIX.md#pattern-2-parent-child-communication)
- **Utilities**: `createSafeEmitter`, `watchWithGuard`

### Scenario 3: Search Input
Debouncing rapid changes:
- **Guide**: [reactivity-helpers-usage.md](./reactivity-helpers-usage.md#5-debounced-watch-rate-limiting)
- **Utilities**: `debouncedWatch`

## Getting Help

1. **Check the Quick Fix**: [QUICK_FIX.md](./QUICK_FIX.md)
2. **Read the Troubleshooting Guide**: [TROUBLESHOOTING.md](../TROUBLESHOOTING.md)
3. **Review Usage Examples**: [reactivity-helpers-usage.md](./reactivity-helpers-usage.md)
4. **Check Vue 3 Docs**: [Reactivity in Depth](https://vuejs.org/guide/extras/reactivity-in-depth.html)

## Contributing

If you find a bug or have a suggestion:
1. Document the issue with code examples
2. Provide console output if applicable
3. Suggest a fix if possible

## License

Private - VetCard Project

---

**Need immediate help?** Start with [QUICK_FIX.md](./QUICK_FIX.md)!
