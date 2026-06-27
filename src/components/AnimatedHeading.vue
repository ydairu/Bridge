<template>
  <h1 :class="className">
    <span
      v-for="(line, li) in lines"
      :key="li"
      style="display: block"
    >
      <span
        v-for="(char, ci) in line.split('')"
        :key="ci"
        :style="{
          display: 'inline-block',
          opacity: visibleChars.has(`${li}-${ci}`) ? 1 : 0,
          transform: visibleChars.has(`${li}-${ci}`) ? 'translateX(0)' : 'translateX(-18px)',
          transition: 'opacity 500ms ease, transform 500ms ease',
          whiteSpace: 'pre',
        }"
      >{{ char === ' ' ? ' ' : char }}</span>
    </span>
  </h1>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  text:         { type: String, required: true },
  class:        { type: String, default: '' },
  initialDelay: { type: Number, default: 200 },
  charDelay:    { type: Number, default: 30 },
})

const className = props.class
const lines = props.text.split('\n')
const visibleChars = reactive(new Set())
const timers = []

onMounted(() => {
  lines.forEach((line, li) => {
    const prevChars = lines.slice(0, li).reduce((acc, l) => acc + l.length, 0)
    line.split('').forEach((_, ci) => {
      const delay = props.initialDelay + (prevChars + ci) * props.charDelay
      const t = setTimeout(() => { visibleChars.add(`${li}-${ci}`) }, delay)
      timers.push(t)
    })
  })
})

onUnmounted(() => timers.forEach(clearTimeout))
</script>
