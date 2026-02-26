<script setup lang="ts">
import { cn } from '@/lib/utils'

interface Props {
  class?: string
}

const props = defineProps<Props>()
</script>

<template>
  <div :class="cn('text-2xl font-semibold leading-none tracking-tight', props.class)" v-bind="$attrs">
    <slot />
  </div>
</template>
