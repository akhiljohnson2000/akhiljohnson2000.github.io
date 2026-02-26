<script setup lang="ts">
import { ref } from 'vue'
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from 'radix-vue'
import { Moon, Sun } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import { useTheme } from '@/composables/useTheme'

const open = ref(false)
const { setTheme } = useTheme()
</script>

<template>
  <DropdownMenuRoot v-model:open="open">
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" size="icon" as="button">
        <Sun class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span class="sr-only">Toggle theme</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" :side-offset="4" class="z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
      <DropdownMenuItem class="cursor-pointer" @select="setTheme('light')">
        Light
      </DropdownMenuItem>
      <DropdownMenuItem class="cursor-pointer" @select="setTheme('dark')">
        Dark
      </DropdownMenuItem>
      <DropdownMenuItem class="cursor-pointer" @select="setTheme('system')">
        System
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenuRoot>
</template>
