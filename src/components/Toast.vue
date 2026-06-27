<template>
  <transition-group name="toast" tag="div" class="toast-container">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      :class="['toast', `toast-${toast.type}`]"
      @click="removeToast(toast.id)"
    >
      <div class="toast-icon">
        <span v-if="toast.type === 'success'">✓</span>
        <span v-else-if="toast.type === 'error'">✕</span>
        <span v-else-if="toast.type === 'warning'">⚠</span>
        <span v-else>ℹ</span>
      </div>
      <div class="toast-content">
        <p class="toast-message">{{ toast.message }}</p>
      </div>
      <button class="toast-close" @click.stop="removeToast(toast.id)">×</button>
    </div>
  </transition-group>
</template>

<script>
import { toasts, useToast } from '../composables/useToast'

export default {
  name: 'Toast',
  setup() {
    const { removeToast } = useToast()
    
    return {
      toasts,
      removeToast
    }
  }
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
  max-width: 400px;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  pointer-events: auto;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 4px solid;
  min-width: 300px;
  animation: slideIn 0.3s ease-out;
}

.toast:hover {
  transform: translateX(-4px);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
}

.dark-mode .toast {
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.toast-success {
  border-left-color: #10b981;
  background: #f0fdf4;
}

.dark-mode .toast-success {
  background: #064e3b;
  border-left-color: #10b981;
}

.toast-error {
  border-left-color: #ef4444;
  background: #fef2f2;
}

.dark-mode .toast-error {
  background: #7f1d1d;
  border-left-color: #ef4444;
}

.toast-warning {
  border-left-color: #f59e0b;
  background: #fffbeb;
}

.dark-mode .toast-warning {
  background: #78350f;
  border-left-color: #f59e0b;
}

.toast-info {
  border-left-color: #3b82f6;
  background: #eff6ff;
}

.dark-mode .toast-info {
  background: #1e3a8a;
  border-left-color: #3b82f6;
}

.toast-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
}

.toast-success .toast-icon {
  color: #10b981;
}

.toast-error .toast-icon {
  color: #ef4444;
}

.toast-warning .toast-icon {
  color: #f59e0b;
}

.toast-info .toast-icon {
  color: #3b82f6;
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-message {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
  color: #1a1a1a;
  word-wrap: break-word;
}

.dark-mode .toast-message {
  color: #ffffff;
}

.toast-close {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #6b7280;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: color 0.2s;
}

.toast-close:hover {
  color: #1a1a1a;
}

.dark-mode .toast-close {
  color: #9ca3af;
}

.dark-mode .toast-close:hover {
  color: #ffffff;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.toast-enter-active {
  animation: slideIn 0.3s ease-out;
}

.toast-leave-active {
  animation: slideOut 0.3s ease-in;
}

@keyframes slideOut {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}

@media (max-width: 768px) {
  .toast-container {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
  
  .toast {
    min-width: auto;
    width: 100%;
  }
}
</style>

