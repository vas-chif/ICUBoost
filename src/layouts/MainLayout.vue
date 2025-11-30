<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white q-pa-md">
      <q-toolbar>
        <!-- Menu Button -->
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <!-- Logo & App Name -->
        <q-toolbar-title class="row items-center no-wrap">
          <span class="gt-xs">{{ t('layout.appName') }}</span>
        </q-toolbar-title>

        <!-- Search Bar (Desktop) -->
        <q-input
          v-model="calculatorStore.searchQuery"
          dark
          dense
          standout
          :placeholder="t('common.search')"
          class="gt-sm"
          style="max-width: 400px"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
          <template v-if="calculatorStore.searchQuery" #append>
            <q-icon name="close" class="cursor-pointer" @click="calculatorStore.searchQuery = ''" />
          </template>
        </q-input>

        <!-- Language Selector -->
        <q-btn-dropdown flat dense :label="currentLocale.toUpperCase()" class="q-ml-md">
          <q-list>
            <q-item v-close-popup clickable @click="changeLocale('en-US')">
              <q-item-section avatar>
                <q-avatar size="24px">🇬🇧</q-avatar>
              </q-item-section>
              <q-item-section>English</q-item-section>
            </q-item>

            <q-item v-close-popup clickable @click="changeLocale('it-IT')">
              <q-item-section avatar>
                <q-avatar size="24px">🇮🇹</q-avatar>
              </q-item-section>
              <q-item-section>Italiano</q-item-section>
            </q-item>

            <q-item v-close-popup clickable @click="changeLocale('ru-RU')">
              <q-item-section avatar>
                <q-avatar size="24px">🇷🇺</q-avatar>
              </q-item-section>
              <q-item-section>Русский</q-item-section>
            </q-item>

            <q-item v-close-popup clickable @click="changeLocale('fr-FR')">
              <q-item-section avatar>
                <q-avatar size="24px">🇫🇷</q-avatar>
              </q-item-section>
              <q-item-section>Français</q-item-section>
            </q-item>

            <q-item v-close-popup clickable @click="changeLocale('ro-RO')">
              <q-item-section avatar>
                <q-avatar size="24px">🇷🇴</q-avatar>
              </q-item-section>
              <q-item-section>Română</q-item-section>
            </q-item>

            <q-item v-close-popup clickable @click="changeLocale('de-DE')">
              <q-item-section avatar>
                <q-avatar size="24px">🇩🇪</q-avatar>
              </q-item-section>
              <q-item-section>Deutsch</q-item-section>
            </q-item>

            <q-item v-close-popup clickable @click="changeLocale('es-ES')">
              <q-item-section avatar>
                <q-avatar size="24px">🇪🇸</q-avatar>
              </q-item-section>
              <q-item-section>Español</q-item-section>
            </q-item>

            <q-item v-close-popup clickable @click="changeLocale('pt-PT')">
              <q-item-section avatar>
                <q-avatar size="24px">🇵🇹</q-avatar>
              </q-item-section>
              <q-item-section>Português</q-item-section>
            </q-item>

            <q-item v-close-popup clickable @click="changeLocale('ja-JP')">
              <q-item-section avatar>
                <q-avatar size="24px">🇯🇵</q-avatar>
              </q-item-section>
              <q-item-section>日本語</q-item-section>
            </q-item>

            <q-item v-close-popup clickable @click="changeLocale('ar-SA')">
              <q-item-section avatar>
                <q-avatar size="24px">🇸🇦</q-avatar>
              </q-item-section>
              <q-item-section>العربية</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-toolbar>

      <!-- Search Bar (Mobile) -->
      <q-toolbar v-if="showMobileSearch" class="lt-md">
        <q-input
          v-model="calculatorStore.searchQuery"
          dark
          dense
          standout
          :placeholder="t('common.search')"
          class="full-width"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
          <template v-if="calculatorStore.searchQuery" #append>
            <q-icon name="close" class="cursor-pointer" @click="calculatorStore.searchQuery = ''" />
          </template>
        </q-input>
      </q-toolbar>
    </q-header>

    <!-- Drawer Navigation -->
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      class="license-drawer"
      style="max-height: 680px"
      :width="260"
      :breakpoint="500"
      bordered
      behavior="mobile"
    >
      <q-list>
        <q-item-label header class="text-primary">
          <q-icon name="calculate" class="q-mr-sm" />
          {{ t('layout.calculators') }}
        </q-item-label>

        <!-- Mechanical Power Calculator -->
        <q-item
          clickable
          :active="calculatorStore.activeCalculator === 'mechanical-power'"
          active-class="bg-primary text-white"
          @click="handleCalculatorClick('mechanical-power')"
        >
          <q-item-section avatar>
            <q-icon
              name="air"
              :color="calculatorStore.activeCalculator === 'mechanical-power' ? 'white' : 'primary'"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ t('calculators.mechanicalPower.title') }}</q-item-label>
            <q-item-label
              caption
              :class="calculatorStore.activeCalculator === 'mechanical-power' ? 'text-white' : ''"
              >{{ t('calculators.mechanicalPower.description') }}</q-item-label
            >
          </q-item-section>
        </q-item>

        <!-- Respiratory Quotient Calculator -->
        <q-item
          clickable
          :active="calculatorStore.activeCalculator === 'respiratory-quotient'"
          active-class="bg-secondary text-white"
          @click="handleCalculatorClick('respiratory-quotient')"
        >
          <q-item-section avatar>
            <q-icon
              name="favorite"
              :color="
                calculatorStore.activeCalculator === 'respiratory-quotient' ? 'white' : 'secondary'
              "
            />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ t('calculators.respiratoryQuotient.title') }}</q-item-label>
            <q-item-label
              caption
              :class="
                calculatorStore.activeCalculator === 'respiratory-quotient' ? 'text-white' : ''
              "
              >{{ t('calculators.respiratoryQuotient.description') }}</q-item-label
            >
          </q-item-section>
        </q-item>

        <q-separator class="q-my-md" />

        <!-- Settings -->
        <q-item clickable>
          <q-item-section avatar>
            <q-icon name="settings" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ t('layout.settings') }}</q-item-label>
          </q-item-section>
        </q-item>

        <!-- About -->
        <q-item clickable>
          <q-item-section avatar>
            <q-icon name="info" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ t('layout.about') }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer class="bg-grey-2 text-dark">
      <div class="row no-wrap justify-center items-center text-center head-4-slim">
        <!-- Prima riga: Copyright e credits -->
        <div class="text-center text-caption text-grey-7 row no-wrap justify-center">
          <div class="q-ma-xs q-pr-sm row no-wrap">
            <q-icon name="copyright" size="xs" class="q-mr-xs" />
            <p class="text-secondary q-ma-none q-mr-xl">2025 ICUboost</p>
          </div>
          <div class="q-ma-xs q-pl-sm">
            <a
              class="created-by caption text-secondary"
              href="https://uniqueyouagency.com/#/"
              target="_blank"
              rel="noopener noreferrer"
              style="text-decoration: none"
            >
              {{ t('layout.createdBy') }}
              <span class="text-weight-bolder text-purple-10"
                >Unique<span class="text-red-8">You</span>Agency</span
              >
            </a>
          </div>
        </div>
      </div>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, provide } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCalculatorStore } from 'src/stores/calculator-store';

const { t, locale } = useI18n();
const calculatorStore = useCalculatorStore();

const leftDrawerOpen = ref(false);
const showMobileSearch = ref(false);
const currentLocale = ref(locale.value);

function toggleLeftDrawer(): void {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

// Provide toggleLeftDrawer per permettere accesso da child components
provide('toggleLeftDrawer', toggleLeftDrawer);

/**
 * CONCETTO: Navigazione drawer-calculator
 * - Se dialog chiuso: apre calcolatore
 * - Se dialog aperto: switcha calcolatore senza chiudere
 * - Drawer rimane accessibile per navigare tra calcolatori
 */
function handleCalculatorClick(type: 'mechanical-power' | 'respiratory-quotient'): void {
  if (calculatorStore.showDialog && calculatorStore.activeCalculator !== type) {
    // Dialog aperto, switch senza chiudere
    calculatorStore.navigateToCalculator(type);
  } else if (!calculatorStore.showDialog) {
    // Dialog chiuso, apri calcolatore
    calculatorStore.openCalculator(type);
  }
  // Non chiudere drawer - permette navigazione multipla
}

function changeLocale(newLocale: string): void {
  locale.value = newLocale;
  currentLocale.value = newLocale;
  localStorage.setItem('locale', newLocale);
}

// Load saved locale from localStorage
const savedLocale = localStorage.getItem('locale');
if (savedLocale) {
  locale.value = savedLocale;
  currentLocale.value = savedLocale;
}
</script>
