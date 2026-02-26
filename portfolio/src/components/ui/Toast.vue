<script setup lang="ts">
import { useToast } from '@/composables/useToast'
import { cn } from '@/lib/utils'

const { toasts, dismiss } = useToast()

interface Props {
  class?: string
}

const props = defineProps<Props>()
</script>

<template>
  <Teleport to="body">
    <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      <TransitionGroup name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          :class="cn('pointer-events-auto rounded-lg border bg-card text-card-foreground shadow-lg p-4', props.class)"
          role="alert"
        >
          <p v-if="t.title" class="font-semibold">{{ t.title }}</p>
          <p v-if="t.description" class="text-sm text-muted-foreground">{{ t.description }}</p>
          <button
            type="button"
            class="absolute top-2 right-2 rounded-md p-1 opacity-70 hover:opacity-100"
            @click="dismiss(t.id)"
            aria-label="Close"
          >
            ×
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.2s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
