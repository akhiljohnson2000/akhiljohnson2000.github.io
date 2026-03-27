<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  modelValue?: string
  class?: string
  placeholder?: string
  name?: string
  required?: boolean
  disabled?: boolean
  rows?: number
  /** Grow height to fit content (uses scrollHeight). */
  autosize?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  rows: 2,
  autosize: false,
})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const root = ref<HTMLTextAreaElement | null>(null)

function adjustHeight() {
  const t = root.value
  if (!t || !props.autosize) return
  t.style.height = 'auto'
  t.style.height = `${t.scrollHeight}px`
}

function onInput(e: Event) {
  const v = (e.target as HTMLTextAreaElement).value
  emit('update:modelValue', v)
  if (props.autosize) nextTick(adjustHeight)
}

onMounted(() => {
  if (props.autosize) nextTick(adjustHeight)
})

watch(
  () => props.modelValue,
  () => {
    if (props.autosize) nextTick(adjustHeight)
  },
)

watch(
  () => props.autosize,
  (v) => {
    if (v) nextTick(adjustHeight)
  },
)
</script>

<template>
  <textarea
    ref="root"
    :value="modelValue"
    :name="name"
    :placeholder="placeholder"
    :required="required"
    :disabled="disabled"
    :rows="rows"
    :class="cn(
      'flex w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
      autosize ? 'min-h-[2.75rem] resize-none overflow-hidden' : 'min-h-[80px]',
      props.class
    )"
    @input="onInput"
    v-bind="$attrs"
  />
</template>
