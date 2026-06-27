<template>
  <div :class="['animated-gradient-text', className]">
    <div class="text-content" :style="gradientStyle">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'GradientText',
  props: {
    colors: {
      type: Array,
      default: () => ['#40ffaa', '#4079ff', '#40ffaa', '#4079ff', '#40ffaa']
    },
    animationSpeed: {
      type: Number,
      default: 8
    },
    showBorder: {
      type: Boolean,
      default: false
    },
    className: {
      type: String,
      default: ''
    }
  },
  computed: {
    gradientStyle() {
      return {
        backgroundImage: `linear-gradient(to right, ${this.colors.join(', ')})`,
        animationDuration: `${this.animationSpeed}s`
      };
    }
  }
}
</script>

<style scoped>
.animated-gradient-text {
  position: relative;
  margin: 0 auto;
  display: flex;
  max-width: fit-content;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  transition: box-shadow 0.5s ease-out;
  overflow: hidden;
  cursor: pointer;
}


@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

.text-content {
  display: inline-block;
  position: relative;
  background-size: 300% 100%;
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  animation: gradient linear infinite;
}
</style>


