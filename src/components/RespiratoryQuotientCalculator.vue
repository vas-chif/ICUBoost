<script setup lang="ts">
/**
 * RespiratoryQuotientCalculator Component
 *
 * Calculates Respiratory Quotient (QR) to assess metabolic state.
 * Formula: QR = (PvCO₂ - PaCO₂) / ((HB × 1.36 × (SaO₂ - SvO₂)) / 100 + (PaO₂ - PvO₂) × 0.003)
 *
 * @component
 * @example
 * <RespiratoryQuotientCalculator />
 */

import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSecureLogger } from 'src/composables/useSecureLogger';
import { usePersistedRespiratoryQuotient } from 'src/composables/usePersistedCalculator';
import { useCalculatorStore } from 'src/stores/calculator-store';
import { useSavedCalculations } from 'src/composables/useSavedCalculations';
import SavedCalculations from './SavedCalculations.vue';
// i18n
const { t } = useI18n();

// Secure Logger
const { logger } = useSecureLogger();
const calculatorStore = useCalculatorStore();

// 🎓 CONCETTO: Salvataggio Calcoli QR
const { savedCalculations, addSavedCalculation, removeSavedCalculation, createSavedCalculation } =
  useSavedCalculations('qr');
/**
 * 🎓 CONCETTO: Persistenza Dati QR Calculator
 *
 * Stesso pattern di MP Calculator:
 * - 7 campi persistiti in localStorage
 * - Auto-save ogni modifica
 * - Reset esplicito con button
 * - Dati sopravvivono a navigazioni MP ↔ QR
 */
const qr = usePersistedRespiratoryQuotient();

// Input values persistiti (collegati a localStorage)
const pvco2 = qr.pvco2.value; // Venous CO2 (mmHg)
const paco2 = qr.paco2.value; // Arterial CO2 (mmHg)
const hb = qr.hb.value; // Hemoglobin (g/dL)
const sao2 = qr.sao2.value; // Arterial O2 saturation (%)
const svo2 = qr.svo2.value; // Venous O2 saturation (%)
const pao2 = qr.pao2.value; // Arterial O2 (mmHg)
const pvo2 = qr.pvo2.value; // Venous O2 (mmHg)

// Result (persistito in localStorage)
const respiratoryQuotient = qr.result.value;
const showResult = ref(false);
const errorMessage = ref<string>('');

// 🎓 CONCETTO: Dialog Salvataggio
const showSaveDialog = ref(false);
const patientInitials = ref('');

/**
 * 🎓 CONCETTO: Risultato QR Persistito
 * - respiratoryQuotient collegato a qr.result.value (localStorage)
 * - Calcolo salva automaticamente in localStorage
 * - Persistenza tra navigazioni MP ↔ QR
 */

/**
 * Validates all input parameters
 *
 * @returns {boolean} True if all inputs are valid
 */
function validateInputs(): boolean {
  errorMessage.value = '';

  // Check all fields are filled
  if (
    pvco2.value === null ||
    paco2.value === null ||
    hb.value === null ||
    sao2.value === null ||
    svo2.value === null ||
    pao2.value === null ||
    pvo2.value === null
  ) {
    errorMessage.value = t('errors.missingParameters');
    return false;
  }

  // Check no negative values
  if (
    pvco2.value < 0 ||
    paco2.value < 0 ||
    hb.value < 0 ||
    sao2.value < 0 ||
    svo2.value < 0 ||
    pao2.value < 0 ||
    pvo2.value < 0
  ) {
    errorMessage.value = t('validation.noNegativeNumbers');
    logger.warn('⚠️ Negative value detected in QR inputs', {
      pvco2: pvco2.value,
      paco2: paco2.value,
      hb: hb.value,
      sao2: sao2.value,
      svo2: svo2.value,
      pao2: pao2.value,
      pvo2: pvo2.value,
    });
    return false;
  }

  // Check all values are positive (> 0)
  if (
    pvco2.value === 0 ||
    paco2.value === 0 ||
    hb.value === 0 ||
    sao2.value === 0 ||
    svo2.value === 0 ||
    pao2.value === 0 ||
    pvo2.value === 0
  ) {
    errorMessage.value = t('validation.mustBePositive');
    return false;
  }

  // ⚠️ VALIDAZIONI SAFETY - Sempre attive (limiti assoluti)
  // Check physiological ranges for CO2
  if (pvco2.value > 100 || paco2.value > 100) {
    errorMessage.value = `${t('validation.outOfRange')}: CO₂ > 100 mmHg`;
    return false;
  }

  // Check O2 ranges
  if (pao2.value > 600 || pvo2.value > 600) {
    errorMessage.value = `${t('validation.outOfRange')}: O₂ > 600 mmHg`;
    return false;
  }

  // Check hemoglobin range
  if (hb.value > 25) {
    errorMessage.value = `${t('validation.outOfRange')}: HB > 25 g/dL`;
    return false;
  }

  // 🎓 VALIDAZIONI FISIOLOGICHE OPZIONALI - Solo se toggle attivo
  // Verifica rapporti gas arteriosi/venosi
  if (calculatorStore.enablePhysiologicalValidations) {
    // PvCO2 should be greater than PaCO2
    if (pvco2.value <= paco2.value) {
      errorMessage.value = t('validation.pvco2GreaterThanPaco2');
      return false;
    }

    // SaO2 should be greater than SvO2
    if (sao2.value <= svo2.value) {
      errorMessage.value = t('validation.sao2GreaterThanSvo2');
      return false;
    }

    // PaO2 should be greater than PvO2
    if (pao2.value <= pvo2.value) {
      errorMessage.value = t('validation.pao2GreaterThanPvo2');
      return false;
    }
  }

  return true;
}

/**
 * Calculates Respiratory Quotient using the standard formula
 * QR = (PvCO₂ - PaCO₂) / ((HB × 1.36 × (SaO₂ - SvO₂)) / 100 + (PaO₂ - PvO₂) × 0.003)
 *
 * @returns {void}
 */
function calculateQR(): void {
  logger.debug('🔍 Respiratory Quotient calculation started', {
    pvco2: pvco2.value,
    paco2: paco2.value,
    hb: hb.value,
    sao2: sao2.value,
    svo2: svo2.value,
    pao2: pao2.value,
    pvo2: pvo2.value,
  });

  if (!validateInputs()) {
    logger.warn('⚠️ QR validation failed', { error: errorMessage.value });
    showResult.value = false;
    return;
  }

  // 🎓 CONCETTO: Type Assertions Rimosse
  // pvco2.value è già Ref<number> (non number | null)
  // ESLint warning: "unnecessary type assertion" → rimuoviamo !
  const pvco2Value = pvco2.value!;
  const paco2Value = paco2.value!;
  const hbValue = hb.value!;
  const sao2Value = sao2.value!;
  const svo2Value = svo2.value!;
  const pao2Value = pao2.value!;
  const pvo2Value = pvo2.value!;

  // Calculate numerator: CO2 difference
  const co2Diff = pvco2Value - paco2Value;

  // Calculate denominator: O2 content difference
  const o2ContentDiff =
    (hbValue * 1.36 * (sao2Value - svo2Value)) / 100 + (pao2Value - pvo2Value) * 0.003;

  // Prevent division by zero
  if (o2ContentDiff === 0) {
    errorMessage.value = `${t('errors.calculationFailed')}: Division by zero`;
    showResult.value = false;
    logger.error('❌ QR calculation failed: Division by zero', {
      co2Diff,
      o2ContentDiff,
      inputs: { hb: hbValue, sao2: sao2Value, svo2: svo2Value, pao2: pao2Value, pvo2: pvo2Value },
    });
    return;
  }

  // Calculate QR
  const qr = co2Diff / o2ContentDiff;

  // Round to 2 decimal places
  respiratoryQuotient.value = Math.round(qr * 100) / 100;
  showResult.value = true;
  errorMessage.value = '';

  // Log result with metabolic interpretation
  const isNormal = respiratoryQuotient.value >= 0.7 && respiratoryQuotient.value <= 1.0;
  const metabolicType =
    respiratoryQuotient.value < 0.7
      ? 'Fat metabolism (aerobic)'
      : respiratoryQuotient.value <= 0.85
        ? 'Mixed metabolism'
        : respiratoryQuotient.value <= 1.0
          ? 'Carbohydrate metabolism (aerobic)'
          : 'Anaerobic metabolism';

  logger.info(`✅ QR calculation completed - ${metabolicType}`, {
    result: respiratoryQuotient.value,
    metabolicType,
    isNormal,
    inputs: {
      co2: { pvco2: pvco2Value, paco2: paco2Value },
      o2: { sao2: sao2Value, svo2: svo2Value, pao2: pao2Value, pvo2: pvo2Value },
      hb: hbValue,
    },
  });

  if (!isNormal) {
    logger.warn('⚠️ QR value outside normal range (0.7-1.0)', { qr: respiratoryQuotient.value });
  }
}

/**
 * 🎓 CONCETTO: Salvataggio Calcoli
 * - saveCalculation(): Apre dialog se ci sono risultati validi
 * - confirmSave(): Valida iniziali, crea SavedCalculation, salva in localStorage
 */
function saveCalculation(): void {
  if (!showResult.value || respiratoryQuotient.value === 0) {
    logger.warn('⚠️ Tentativo salvataggio senza risultato valido');
    return;
  }
  showSaveDialog.value = true;
  logger.info('💾 Apertura dialog salvataggio calcolo QR');
}

function confirmSave(): void {
  const trimmed = patientInitials.value.trim();

  if (trimmed.length === 0) {
    logger.warn('⚠️ Iniziali paziente vuote');
    return;
  }

  const calculation = createSavedCalculation(trimmed, respiratoryQuotient.value ?? 0);
  addSavedCalculation(calculation);

  showSaveDialog.value = false;
  patientInitials.value = '';

  logger.info(`✅ Calcolo QR salvato: ${calculation.initials} - ${calculation.result} ml-O₂/dL`);
}

/**
 * Resets all input fields and result
 *
 * @returns {void}
 */
/**
 * Reset completo form e localStorage
 *
 * 🎓 CONCETTO: Reset Persistenza QR
 * - qr.resetAll() cancella TUTTI i 7 campi da localStorage
 * - Resetta ref() locali (result, errors)
 */
function resetForm(): void {
  logger.info('🔄 Reset completo Respiratory Quotient Calculator (localStorage cleared)');

  // Reset persistenza localStorage (include result)
  qr.resetAll();

  // Reset UI flags
  showResult.value = false;
  errorMessage.value = '';
}
</script>

<template>
  <div class="respiratory-quotient-calculator">
    <q-card flat>
      <q-card-section class="bg-secondary text-white row items-center q-pa-md">
        <div>
          <div class="text-h6">{{ t('calculators.respiratoryQuotient.title') }}</div>
          <div class="text-caption">{{ t('calculators.respiratoryQuotient.description') }}</div>
        </div>
        <q-space />
        <div>
          <q-toggle
            v-model="calculatorStore.enablePhysiologicalValidations"
            checked-icon="check"
            color="positive"
            :label="t('common.enablePhysiologicalValidations')"
            unchecked-icon="clear"
          />
        </div>
      </q-card-section>

      <q-card-section class="q-pa-sm bg-blue-1">
        <div class="text-body2 text-grey-9">
          <q-icon name="info" color="primary" size="sm" class="q-mr-xs" />
          {{ t('calculators.respiratoryQuotient.metabolismDescription') }}
        </div>
      </q-card-section>

      <q-card-section>
        <div class="row q-col-gutter-md">
          <!-- CO2 Values -->
          <div class="col-12">
            <div class="text-subtitle2 text-grey-7 q-mb-sm">CO₂ Parameters</div>
          </div>

          <div class="col-12 col-sm-6">
            <q-input
              v-model.number="pvco2"
              type="number"
              step="0.1"
              :label="t('calculators.respiratoryQuotient.pvco2')"
              :suffix="t('calculators.respiratoryQuotient.pvco2Unit')"
              outlined
              dense
              clearable
              placeholder="0"
              :rules="[(val) => (val !== null && val > 0) || t('validation.mustBePositive')]"
            >
              <template #prepend>
                <q-icon name="bloodtype" color="red-8" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-sm-6">
            <q-input
              v-model.number="paco2"
              type="number"
              step="0.1"
              :label="t('calculators.respiratoryQuotient.paco2')"
              :suffix="t('calculators.respiratoryQuotient.paco2Unit')"
              outlined
              dense
              clearable
              placeholder="0"
              :rules="[(val) => (val !== null && val > 0) || t('validation.mustBePositive')]"
            >
              <template #prepend>
                <q-icon name="bloodtype" color="red" />
              </template>
            </q-input>
          </div>

          <!-- Hemoglobin -->
          <div class="col-12">
            <div class="text-subtitle2 text-grey-7 q-mb-sm q-mt-md">Hemoglobin</div>
          </div>

          <div class="col-12 col-sm-6">
            <q-input
              v-model.number="hb"
              type="number"
              step="0.1"
              :label="t('calculators.respiratoryQuotient.hb')"
              :suffix="t('calculators.respiratoryQuotient.hbUnit')"
              outlined
              dense
              clearable
              placeholder="0"
              :rules="[(val) => (val !== null && val > 0) || t('validation.mustBePositive')]"
            >
              <template #prepend>
                <q-icon name="water_drop" color="red-10" />
              </template>
            </q-input>
          </div>

          <!-- O2 Saturation -->
          <div class="col-12">
            <div class="text-subtitle2 text-grey-7 q-mb-sm q-mt-md">O₂ Saturation</div>
          </div>

          <div class="col-12 col-sm-6">
            <q-input
              v-model.number="sao2"
              type="number"
              step="0.1"
              min="0"
              max="100"
              oninput="if(this.value.length > 3) this.value = this.value.slice(0,3);"
              :label="t('calculators.respiratoryQuotient.sao2')"
              :suffix="t('calculators.respiratoryQuotient.sao2Unit')"
              outlined
              dense
              clearable
              placeholder="0"
              :rules="[(val) => (val !== null && val > 0) || t('validation.mustBePositive')]"
            >
              <template #prepend>
                <q-icon name="favorite" color="red" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-sm-6">
            <q-input
              v-model.number="svo2"
              type="number"
              step="0.1"
              min="0"
              max="100"
              oninput="if(this.value.length > 3) this.value = this.value.slice(0,3);"
              :label="t('calculators.respiratoryQuotient.svo2')"
              :suffix="t('calculators.respiratoryQuotient.svo2Unit')"
              outlined
              dense
              clearable
              placeholder="0"
              :rules="[(val) => (val !== null && val > 0) || t('validation.mustBePositive')]"
            >
              <template #prepend>
                <q-icon name="favorite" color="red-8" />
              </template>
            </q-input>
          </div>

          <!-- O2 Partial Pressure -->
          <div class="col-12">
            <div class="text-subtitle2 text-grey-7 q-mb-sm q-mt-md">O₂ Partial Pressure</div>
          </div>

          <div class="col-12 col-sm-6">
            <q-input
              v-model.number="pao2"
              type="number"
              step="0.1"
              :label="t('calculators.respiratoryQuotient.pao2')"
              :suffix="t('calculators.respiratoryQuotient.pao2Unit')"
              outlined
              dense
              clearable
              placeholder="0"
              :rules="[(val) => (val !== null && val > 0) || t('validation.mustBePositive')]"
            >
              <template #prepend>
                <q-icon name="air" color="light-blue" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-sm-6">
            <q-input
              v-model.number="pvo2"
              type="number"
              step="0.1"
              :label="t('calculators.respiratoryQuotient.pvo2')"
              :suffix="t('calculators.respiratoryQuotient.pvo2Unit')"
              outlined
              dense
              clearable
              placeholder="0"
              :rules="[(val) => (val !== null && val > 0) || t('validation.mustBePositive')]"
            >
              <template #prepend>
                <q-icon name="air" color="blue-8" />
              </template>
            </q-input>
          </div>
        </div>

        <!-- Error Message -->
        <q-banner v-if="errorMessage" class="bg-negative text-white q-mt-md" dense rounded>
          <template #avatar>
            <q-icon name="error" />
          </template>
          {{ errorMessage }}
        </q-banner>

        <!-- Result - ALWAYS VISIBLE -->
        <q-card class="q-mt-md bg-grey-3" flat bordered>
          <q-card-section class="text-center">
            <div class="text-h3 text-grey-9">
              {{ showResult ? respiratoryQuotient : '---' }}
            </div>
            <div class="text-subtitle1 text-grey-8">
              {{ t('calculators.respiratoryQuotient.resultUnit') }}
            </div>
            <q-separator class="q-my-sm" />
            <div class="text-body2 text-grey-8">
              <strong>Range QR: 0.7 - 1.0 ml-O₂/dL</strong>
            </div>
          </q-card-section>
        </q-card>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat :label="t('common.reset')" color="secondary" @click="resetForm" />
        <q-btn
          flat
          :label="t('common.save')"
          color="positive"
          icon="save"
          :disable="!showResult || respiratoryQuotient === 0"
          @click="saveCalculation"
        />
        <q-btn
          unelevated
          :label="t('common.calculate')"
          color="secondary"
          icon="calculate"
          @click="calculateQR"
        />
      </q-card-actions>

      <!-- Save Dialog -->
      <q-dialog v-model="showSaveDialog">
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">{{ t('common.save') }}</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-input
              v-model="patientInitials"
              :label="t('common.patientInitials')"
              dense
              autofocus
              maxlength="2"
              @keyup.enter="confirmSave"
            />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat :label="t('common.cancel')" color="primary" v-close-popup />
            <q-btn
              flat
              :label="t('common.save')"
              color="positive"
              @click="confirmSave"
              :disable="patientInitials.trim().length === 0"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-card>

    <!-- Saved Calculations Table -->
    <SavedCalculations
      calculator-type="qr"
      :calculations="savedCalculations"
      @remove="removeSavedCalculation"
    />
  </div>
</template>

<style scoped lang="scss">
.respiratory-quotient-calculator {
  width: 100%;
  padding-bottom: 80px; // Spazio per bottoni e footer mobile

  :deep(.q-card) {
    border-radius: 0;
  }

  :deep(.q-card-section) {
    padding: 12px 16px;
  }

  :deep(.q-card-actions) {
    padding: 12px 16px;
    position: sticky;
    bottom: 0;
    background: white;
    z-index: 1;
    box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
  }
}
</style>
