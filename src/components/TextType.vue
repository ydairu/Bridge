<template>
  <span class="text-type">
    {{ displayText }}<span v-if="showCursor" class="cursor">{{ cursorCharacter }}</span>
  </span>
</template>

<script>
import { ref, onMounted, onUnmounted, watch } from 'vue'

export default {
  name: 'TextType',
  props: {
    text: {
      type: Array,
      required: true
    },
    typingSpeed: {
      type: Number,
      default: 75
    },
    pauseDuration: {
      type: Number,
      default: 1500
    },
    showCursor: {
      type: Boolean,
      default: true
    },
    cursorCharacter: {
      type: String,
      default: '|'
    }
  },
  setup(props) {
    const displayText = ref('')
    const currentTextIndex = ref(0)
    const currentCharIndex = ref(0)
    const isDeleting = ref(false)
    let timeoutId = null

    const typeText = () => {
      const currentText = props.text[currentTextIndex.value]
      
      if (isDeleting.value) {
        displayText.value = currentText.substring(0, currentCharIndex.value - 1)
        currentCharIndex.value--
        
        if (currentCharIndex.value === 0) {
          isDeleting.value = false
          currentTextIndex.value = (currentTextIndex.value + 1) % props.text.length
          timeoutId = setTimeout(typeText, props.pauseDuration)
          return
        }
      } else {
        displayText.value = currentText.substring(0, currentCharIndex.value + 1)
        currentCharIndex.value++
        
        if (currentCharIndex.value === currentText.length) {
          timeoutId = setTimeout(() => {
            isDeleting.value = true
            typeText()
          }, props.pauseDuration)
          return
        }
      }
      
      timeoutId = setTimeout(typeText, isDeleting.value ? props.typingSpeed / 2 : props.typingSpeed)
    }

    onMounted(() => {
      typeText()
    })

    watch(
      () => props.text,
      () => {
        if (timeoutId) clearTimeout(timeoutId)
        displayText.value = ''
        currentTextIndex.value = 0
        currentCharIndex.value = 0
        isDeleting.value = false
        typeText()
      },
      { deep: true }
    )

    onUnmounted(() => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    })

    return {
      displayText
    }
  }
}
</script>

<style scoped>
.text-type {
  display: inline-block;
}

.cursor {
  animation: blink 1s infinite;
  font-weight: normal;
}

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}
</style>
