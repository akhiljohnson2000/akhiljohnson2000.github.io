<script setup lang="ts">
import { cn } from '@/lib/utils'

interface Props {
  type?: string
  modelValue?: string
  class?: string
  placeholder?: string
  name?: string
  required?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <input
    :type="type"
    :value="modelValue"
    :name="name"
    :placeholder="placeholder"
    :required="required"
    :disabled="disabled"
    :class="cn(
      'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
      props.class
    )"
    @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    v-bind="$attrs"
  />
</template>
