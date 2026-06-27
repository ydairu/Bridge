<template>
  <label class="language-selector" :title="t('language')">
    <Globe2 :size="18" aria-hidden="true" />
    <span class="sr-only">{{ t('language') }}</span>
    <select v-model="selectedLocale" :aria-label="t('language')" @change="changeLocale">
      <option v-for="localeOption in supportedLocales" :key="localeOption.code" :value="localeOption.code">
        {{ localeOption.name }}
      </option>
    </select>
  </label>
</template>

<script setup>
import { ref, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { Globe2 } from 'lucide-vue-next'
import { supportedLocales } from '../i18n'

const { locale, t } = useI18n()
const selectedLocale = ref(locale.value)

const applyDocumentLanguage = () => {
  document.documentElement.lang = locale.value
  document.documentElement.dir = 'ltr'
}

const changeLocale = () => {
  locale.value = selectedLocale.value
  localStorage.setItem('bridge-locale', selectedLocale.value)
  applyDocumentLanguage()
}

watchEffect(() => {
  selectedLocale.value = locale.value
  applyDocumentLanguage()
})
</script>

<style scoped>
.language-selector {
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  padding: 0 8px 0 10px;
  color: var(--text-muted);
  background: var(--surface-soft);
  border: 1px solid var(--border-muted);
  border-radius: var(--radius-md);
  transition: border-color var(--transition-fast), background-color var(--transition-fast);
}

.language-selector:hover,
.language-selector:focus-within {
  color: var(--primary);
  background: var(--primary-soft);
  border-color: var(--primary);
}

.language-selector select {
  width: auto;
  min-width: 96px;
  min-height: 38px;
  padding: 0 22px 0 2px;
  border: 0;
  box-shadow: none;
  background-color: transparent;
  color: var(--text);
  font-size: 0.82rem;
  font-weight: 650;
  cursor: pointer;
}

.language-selector select:focus {
  box-shadow: none;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 900px) {
  .language-selector {
    width: 100%;
    min-height: 46px;
    margin: 8px 0;
  }

  .language-selector select {
    flex: 1;
  }
}
</style>
