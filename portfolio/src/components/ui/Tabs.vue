<script setup lang="ts">
import { TabsRoot } from 'radix-vue'
import { cn } from '@/lib/utils'

interface Props {
  defaultValue?: string
  modelValue?: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  defaultValue: 'career',
})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <TabsRoot
    :default-value="defaultValue"
    :model-value="modelValue ?? defaultValue"
    @update:model-value="(v) => emit('update:modelValue', v)"
    :class="cn('w-full', props.class)"
  >
    <slot />
  </TabsRoot>
</template>
