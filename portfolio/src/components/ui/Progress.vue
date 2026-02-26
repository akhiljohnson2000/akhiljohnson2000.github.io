<script setup lang="ts">
import { ProgressRoot, ProgressIndicator } from 'radix-vue'
import { cn } from '@/lib/utils'

interface Props {
  value?: number
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  value: 0,
})
</script>

<template>
  <ProgressRoot
    :model-value="value"
    :class="cn(
      'relative h-4 w-full overflow-hidden rounded-full bg-secondary',
      props.class
    )"
    v-bind="$attrs"
  >
    <ProgressIndicator
      class="h-full w-full flex-1 bg-primary transition-all"
      :style="{ transform: `translateX(-${100 - (value ?? 0)}%)` }"
    />
  </ProgressRoot>
</template>
