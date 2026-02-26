<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const FULL_TEXT = 'Akhil Johnson'
const typedText = ref('')
const showCursor = ref(true)
const CHAR_DELAY_MS = 100
const CURSOR_BLINK_MS = 530

let typeInterval: ReturnType<typeof setInterval> | null = null
let cursorInterval: ReturnType<typeof setInterval> | null = null

function startTyping() {
  let index = 0
  typedText.value = ''
  typeInterval = setInterval(() => {
    if (index < FULL_TEXT.length) {
      typedText.value = FULL_TEXT.slice(0, index + 1)
      index++
    } else {
      if (typeInterval) clearInterval(typeInterval)
      typeInterval = null
    }
  }, CHAR_DELAY_MS)
}

function startCursorBlink() {
  cursorInterval = setInterval(() => {
    showCursor.value = !showCursor.value
  }, CURSOR_BLINK_MS)
}

onMounted(() => {
  startCursorBlink()
  startTyping()
})

onUnmounted(() => {
  if (typeInterval) clearInterval(typeInterval)
  if (cursorInterval) clearInterval(cursorInterval)
})
</script>

<template>
  <span class="typed-name inline-block text-primary" aria-label="Akhil Johnson">
    <span>{{ typedText }}</span><span class="cursor" :class="{ 'cursor-visible': showCursor }">|</span>
  </span>
</template>

<style scoped>
.typed-name {
  min-width: 0.5ch;
}
.cursor {
  opacity: 0;
  transition: opacity 0.1s ease;
  margin-left: 1px;
}
.cursor-visible {
  opacity: 1;
}
</style>
