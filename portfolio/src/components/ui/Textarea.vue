<script setup lang="ts">
import { cn } from '@/lib/utils'

interface Props {
  modelValue?: string
  class?: string
  placeholder?: string
  name?: string
  required?: boolean
  disabled?: boolean
  rows?: number
}

const props = withDefaults(defineProps<Props>(), {
  rows: 3,
})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <textarea
    :value="modelValue"
    :name="name"
    :placeholder="placeholder"
    :required="required"
    :disabled="disabled"
    :rows="rows"
    :class="cn(
      'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
      props.class
    )"
    @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    v-bind="$attrs"
  />
</template>
