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
  min-height: 36px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  padding: 0 8px 0 10px;
  color: rgba(180, 210, 255, 0.6);
  background: rgba(13, 27, 53, 0.7);
  border: 1px solid rgba(74, 158, 245, 0.2);
  border-radius: 8px;
  transition: border-color 0.2s, background 0.2s, color 0.2s;
  cursor: pointer;
}

.language-selector:hover,
.language-selector:focus-within {
  color: #4A9EF5;
  background: rgba(74, 158, 245, 0.1);
  border-color: rgba(74, 158, 245, 0.4);
}

.language-selector select {
  width: auto;
  min-width: 96px;
  min-height: 34px;
  padding: 0 22px 0 2px;
  border: 0;
  box-shadow: none;
  background-color: transparent;
  color: inherit;
  font-size: 0.82rem;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  appearance: auto;
}

.language-selector select option {
  background: #0F1F3D;
  color: #F0F6FF;
}

.language-selector select:focus {
  outline: none;
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

@media (max-width: 768px) {
  .language-selector {
    width: 100%;
    min-height: 46px;
    margin: 8px 0;
    border-radius: 10px;
  }

  .language-selector select {
    flex: 1;
  }
}
</style>
