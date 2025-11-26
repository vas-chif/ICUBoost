<template>
  <q-page class="index-page">
    <div class="q-pa-md">
      <!-- Welcome Header -->
      <div class="text-center q-mb-lg justify-center items-center">
        <q-img src="../assets/icon_logo.png" alt="ICUBoost Logo" style="max-width: 120px" />

        <p class="text-subtitle1 text-grey-7">{{ t('layout.appDescription') }}</p>
        <!-- <div>
          <h3 class="text-h4 text-primary q-mb-sm">{{ t('layout.appName') }}</h3>
        </div> -->
      </div>

      <!-- Calculators Grid -->
      <div class="row q-col-gutter-md justify-center">
        <!-- Mechanical Power Calculator Card -->
        <div v-show="showMechanicalPower" class="col-6 col-sm-4 col-md-3 col-lg-2">
          <q-card
            class="calculator-card cursor-pointer"
            flat
            bordered
            @click="calculatorStore.openCalculator('mechanical-power')"
          >
            <q-card-section class="text-center">
              <q-icon name="air" size="48px" color="primary" />
              <div class="text-subtitle2 q-mt-sm text-primary">
                {{ t('calculators.mechanicalPower.title') }}
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Respiratory Quotient Calculator Card -->
        <div v-show="showRespiratoryQuotient" class="col-6 col-sm-4 col-md-3 col-lg-2">
          <q-card
            class="calculator-card cursor-pointer"
            flat
            bordered
            @click="calculatorStore.openCalculator('respiratory-quotient')"
          >
            <q-card-section class="text-center">
              <q-icon name="favorite" size="48px" color="secondary" />
              <div class="text-subtitle2 q-mt-sm text-secondary">
                {{ t('calculators.respiratoryQuotient.title') }}
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Placeholder for future calculators -->
        <div class="col-6 col-sm-4 col-md-3 col-lg-2">
          <q-card class="calculator-card calculator-card--disabled" flat bordered>
            <q-card-section class="text-center">
              <q-icon name="add_circle_outline" size="48px" color="grey-5" />
              <div class="text-subtitle2 q-mt-sm text-grey-6">Coming Soon</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-6 col-sm-4 col-md-3 col-lg-2">
          <q-card class="calculator-card calculator-card--disabled" flat bordered>
            <q-card-section class="text-center">
              <q-icon name="add_circle_outline" size="48px" color="grey-5" />
              <div class="text-subtitle2 q-mt-sm text-grey-6">Coming Soon</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-6 col-sm-4 col-md-3 col-lg-2">
          <q-card class="calculator-card calculator-card--disabled" flat bordered>
            <q-card-section class="text-center">
              <q-icon name="add_circle_outline" size="48px" color="grey-5" />
              <div class="text-subtitle2 q-mt-sm text-grey-6">Coming Soon</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-6 col-sm-4 col-md-3 col-lg-2">
          <q-card class="calculator-card calculator-card--disabled" flat bordered>
            <q-card-section class="text-center">
              <q-icon name="add_circle_outline" size="48px" color="grey-5" />
              <div class="text-subtitle2 q-mt-sm text-grey-6">Coming Soon</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Calculator Dialog con drawer interno per navigazione -->
    <q-dialog v-model="calculatorStore.showDialog" maximized transition-show="slide-up">
      <q-layout view="hHh lpR fFf" container class="bg-white">
        <!-- Header -->
        <q-header class="bg-primary text-white">
          <q-toolbar>
            <q-btn flat dense round icon="menu" @click="dialogDrawerOpen = !dialogDrawerOpen">
              <q-tooltip>{{ t('layout.menu') }}</q-tooltip>
            </q-btn>
            <q-icon
              :name="calculatorStore.activeCalculator === 'mechanical-power' ? 'air' : 'favorite'"
              size="sm"
              class="q-ml-sm"
            />
            <q-toolbar-title class="text-h6">
              {{
                calculatorStore.activeCalculator === 'mechanical-power'
                  ? t('calculators.mechanicalPower.title')
                  : t('calculators.respiratoryQuotient.title')
              }}
            </q-toolbar-title>
            <q-btn flat dense round icon="close" @click="calculatorStore.closeDialog()">
              <q-tooltip>{{ t('common.close') }}</q-tooltip>
            </q-btn>
          </q-toolbar>
        </q-header>

        <!-- Drawer interno del dialog -->
        <q-drawer v-model="dialogDrawerOpen" show-if-above side="left" bordered>
          <q-list>
            <q-item-label header>{{ t('layout.calculators') }}</q-item-label>

            <!-- Mechanical Power -->
            <q-item
              clickable
              :active="calculatorStore.activeCalculator === 'mechanical-power'"
              active-class="bg-primary text-white"
              @click="handleDialogCalculatorClick('mechanical-power')"
            >
              <q-item-section avatar>
                <q-icon name="air" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ t('calculators.mechanicalPower.title') }}</q-item-label>
              </q-item-section>
            </q-item>

            <!-- Respiratory Quotient -->
            <q-item
              clickable
              :active="calculatorStore.activeCalculator === 'respiratory-quotient'"
              active-class="bg-secondary text-white"
              @click="handleDialogCalculatorClick('respiratory-quotient')"
            >
              <q-item-section avatar>
                <q-icon name="favorite" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ t('calculators.respiratoryQuotient.title') }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-drawer>

        <!-- Page container con contenuto calcolatrice -->
        <q-page-container>
          <q-page class="q-pa-md">
            <MechanicalPowerCalculator
              v-if="calculatorStore.activeCalculator === 'mechanical-power'"
            />
            <RespiratoryQuotientCalculator
              v-else-if="calculatorStore.activeCalculator === 'respiratory-quotient'"
            />
          </q-page>
        </q-page-container>
      </q-layout>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCalculatorStore } from 'src/stores/calculator-store';
import MechanicalPowerCalculator from 'src/components/MechanicalPowerCalculator.vue';
import RespiratoryQuotientCalculator from 'src/components/RespiratoryQuotientCalculator.vue';

const { t } = useI18n();
const calculatorStore = useCalculatorStore();

// Drawer interno del dialog
const dialogDrawerOpen = ref(false);

/**
 * Gestisce click su calcolatrice nel drawer interno del dialog
 * Naviga alla calcolatrice selezionata e chiude drawer su mobile
 */
function handleDialogCalculatorClick(type: 'mechanical-power' | 'respiratory-quotient'): void {
  calculatorStore.navigateToCalculator(type);
  // Su mobile chiudi drawer dopo selezione
  if (window.innerWidth < 1024) {
    dialogDrawerOpen.value = false;
  }
}

/**
 * 🎓 CONCETTO: Filtro Ricerca Calcolatori
 *
 * PROBLEMA: Utente cerca "mechanical" → vuole vedere solo MP
 *
 * SOLUZIONE:
 * - computed property verifica se nome/descrizione contiene searchQuery
 * - case-insensitive (toLowerCase)
 * - multilingual (cerca in traduzioni correnti)
 * - v-show nasconde cards che non matchano
 *
 * PERFORMANCE:
 * - computed = cached (ricalcola solo se searchQuery cambia)
 * - v-show = toggle CSS display (non unmount componente)
 */
const showMechanicalPower = computed(() => {
  const query = calculatorStore.searchQuery.toLowerCase().trim();
  if (!query) return true; // Se ricerca vuota, mostra tutto

  const title = t('calculators.mechanicalPower.title').toLowerCase();
  const description = t('calculators.mechanicalPower.description').toLowerCase();

  return title.includes(query) || description.includes(query);
});

const showRespiratoryQuotient = computed(() => {
  const query = calculatorStore.searchQuery.toLowerCase().trim();
  if (!query) return true;

  const title = t('calculators.respiratoryQuotient.title').toLowerCase();
  const description = t('calculators.respiratoryQuotient.description').toLowerCase();

  return title.includes(query) || description.includes(query);
});
</script>

<style scoped lang="scss">
.index-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.calculator-card {
  transition: all 0.3s ease;
  min-height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: white;

  &:hover:not(.calculator-card--disabled) {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  }

  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

// Mobile adjustments
@media (max-width: 600px) {
  .calculator-card {
    min-height: 120px;

    .q-icon {
      font-size: 36px !important;
    }

    .text-subtitle2 {
      font-size: 0.75rem;
    }
  }
}

// Desktop enlargement
@media (min-width: 1024px) {
  .calculator-card {
    min-height: 180px;
  }
}
</style>
