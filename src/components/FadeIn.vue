<template>
  <div
    :class="className"
    :style="{
      opacity: visible ? 1 : 0,
      transition: `opacity ${duration}ms ease`,
    }"
  >
    <slot />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  delay:    { type: Number, default: 0 },
  duration: { type: Number, default: 1000 },
  class:    { type: String, default: '' },
})

const visible = ref(false)
const className = props.class

let timer = null
onMounted(() => {
  timer = setTimeout(() => { visible.value = true }, props.delay)
})
onUnmounted(() => { if (timer) clearTimeout(timer) })
</script>
