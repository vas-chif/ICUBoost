<script setup lang="ts">
/**
 * MechanicalPowerCalculator Component
 *
 * Calculates mechanical ventilation power to assess lung injury risk.
 * Formula: MP = 0.098 × RR × VTe × (Picco - 0.5 × (Plateau - PEEP))
 *
 * @component
 * @example
 * <MechanicalPowerCalculator />
 */

import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSecureLogger } from 'src/composables/useSecureLogger';
import { usePersistedMechanicalPower } from 'src/composables/usePersistedCalculator';
import { useCalculatorStore } from 'src/stores/calculator-store';
import { useSavedCalculations } from 'src/composables/useSavedCalculations';
import SavedCalculations from './SavedCalculations.vue';

// i18n
const { t } = useI18n();

// Secure Logger
const { logger } = useSecureLogger();
const calculatorStore = useCalculatorStore();

// 🎓 CONCETTO: Salvataggio Calcoli
// useSavedCalculations gestisce array di calcoli salvati in localStorage
const { savedCalculations, addSavedCalculation, removeSavedCalculation, createSavedCalculation } =
  useSavedCalculations('mp');

/**
 * 🎓 CONCETTO: Persistenza Dati con usePersistedMechanicalPower
 *
 * PRIMA: ref() semplici → dati persi al cambio tab
 * ORA: usePersistedField() → dati salvati in localStorage
 *
 * FLOW:
 * User input → ref.value cambia → watch() → localStorage.setItem()
 * Tab switch → componente unmount → dati in localStorage
 * Ritorno tab → componente mount → carica da localStorage
 * Click RESET → resetAll() → cancella localStorage + reset valori
 */
const mp = usePersistedMechanicalPower();

// Input values persistiti (collegati a localStorage)
const rr = mp.rr.value; // Respiratory Rate (breaths/min)
const picco = mp.picco.value; // Peak Pressure (cmH2O)
const plateau = mp.plateau.value; // Plateau Pressure (cmH2O)
const peep = mp.peep.value; // PEEP (cmH2O)

/**
 * VTe è caso speciale: stringa per auto-fraction (0.xxx)
 * Persiste come numero, ma display come stringa formattata
 */
const vte = ref<string>(
  mp.vte.value.value !== null && mp.vte.value.value > 0 ? mp.vte.value.value.toString() : '0.',
);

// Watch VTe per sincronizzare con localStorage
watch(vte, (newValue) => {
  const numericValue = parseFloat(newValue) || 0;
  mp.vte.value.value = numericValue;
});

// Result (persistito in localStorage)
const mechanicalPower = mp.result.value;
const showResult = ref(false);
const errorMessage = ref<string>('');

// 🎓 CONCETTO: Dialog Salvataggio
const showSaveDialog = ref(false);
const patientInitials = ref('');

/**
 * 🎓 CONCETTO: Risultato Persistito
 * - mechanicalPower collegato a mp.result.value (localStorage)
 * - Quando calcoli → mechanicalPower.value = X → auto-save in localStorage
 * - Navighi MP → QR → MP → risultato ancora visibile
 * - Reset → mechanicalPower.value = 0
 */

/**
 * Handles VTe input with auto-fractioning
 * Example: user types "345" → becomes "0.345"
 */
function handleVteInput(event: Event): void {
  const input = event.target as HTMLInputElement;
  let value = input.value.replace(/[^0-9]/g, ''); // Remove non-digits

  // Limit to 3 digits max (for 0.xxx)
  if (value.length > 3) {
    value = value.slice(0, 3);
  }

  // Auto-fraction: add decimal point
  if (value.length === 0) {
    vte.value = '0.';
  } else {
    vte.value = '0.' + value;
  }

  // Update input visual
  input.value = vte.value;
}

/**
 * Gets VTe numeric value for calculation
 */
function getVteValue(): number {
  return parseFloat(vte.value) || 0;
}

/**
 * Validates all input parameters
 *
 * @returns {boolean} True if all inputs are valid
 */
function validateInputs(): boolean {
  errorMessage.value = '';

  // Check all fields are filled
  if (rr.value === null || picco.value === null || plateau.value === null || peep.value === null) {
    errorMessage.value = t('errors.missingParameters');
    return false;
  }

  // Check no negative values (vte is always >= 0 by default)
  const vteValue = getVteValue();
  if (rr.value < 0 || vteValue <= 0 || picco.value < 0 || plateau.value < 0 || peep.value < 0) {
    errorMessage.value = t('validation.noNegativeNumbers');
    logger.warn('⚠️ Negative value detected in MP inputs', {
      rr: rr.value,
      vte: vteValue,
      picco: picco.value,
      plateau: plateau.value,
      peep: peep.value,
    });
    return false;
  }

  // Check all required values are filled and > 0
  if (rr.value === 0 || vteValue === 0 || picco.value === 0 || plateau.value === 0) {
    errorMessage.value = t('validation.mustBePositive');
    return false;
  }

  // Check physiological ranges
  if (rr.value > 99) {
    errorMessage.value = `${t('validation.outOfRange')}: RR max 99 ${t('calculators.mechanicalPower.rrUnit')}`;
    logger.warn('⚠️ RR exceeds maximum', { rr: rr.value, max: 99 });
    return false;
  }

  // VTe max 2L
  if (vteValue > 2) {
    errorMessage.value = `${t('validation.outOfRange')}: VTe > 2L`;
    return false;
  }

  // Pressures max 99 cmH2O
  if (picco.value > 99) {
    errorMessage.value = `${t('validation.outOfRange')}: Picco max 99 cmH₂O`;
    logger.warn('⚠️ Picco exceeds maximum', { picco: picco.value, max: 99 });
    return false;
  }

  if (plateau.value > 99) {
    errorMessage.value = `${t('validation.outOfRange')}: Plateau max 99 cmH₂O`;
    logger.warn('⚠️ Plateau exceeds maximum', { plateau: plateau.value, max: 99 });
    return false;
  }

  if (peep.value > 99) {
    errorMessage.value = `${t('validation.outOfRange')}: PEEP max 99 cmH₂O`;
    logger.warn('⚠️ PEEP exceeds maximum', { peep: peep.value, max: 99 });
    return false;
  }

  // 🎓 CONCETTO: Validazioni fisiologiche opzionali
  // Solo se toggle attivo, verifica rapporti Plateau < Picco e PEEP < Plateau
  if (calculatorStore.enablePhysiologicalValidations) {
    // Plateau should be less than Peak
    if (plateau.value > picco.value) {
      errorMessage.value = t('validation.plateauLessThanPeak');
      return false;
    }

    // PEEP should be less than Plateau
    if (peep.value > plateau.value) {
      errorMessage.value = t('validation.peepLessThanPlateau');
      return false;
    }
  }

  return true;
}

/**
 * Calculates mechanical power using the standard formula
 * MP = 0.098 × RR × VTe × (Picco - 0.5 × (Plateau - PEEP))
 *
 * @returns {void}
 */
function calculateMP(): void {
  const vteNumeric = getVteValue();
  logger.debug('🔍 Mechanical Power calculation started', {
    rr: rr.value,
    vte: vteNumeric,
    picco: picco.value,
    plateau: plateau.value,
    peep: peep.value,
  });

  if (!validateInputs()) {
    logger.warn('⚠️ MP validation failed', { error: errorMessage.value });
    showResult.value = false;
    return;
  }

  const rrValue = rr.value!;
  const vteValue = vteNumeric; // From getVteValue()
  const piccoValue = picco.value!;
  const plateauValue = plateau.value!;
  const peepValue = peep.value!;

  // Calculate Mechanical Power
  const mp = 0.098 * rrValue * vteValue * (piccoValue - 0.5 * (plateauValue - peepValue));

  // 🎓 CONCETTO: Arrotondamento 2 Decimali
  // Math.round(mp * 100) / 100 → 11.3456 → 1134.56 → 1135 → 11.35
  mechanicalPower.value = Math.round(mp * 100) / 100;
  showResult.value = true;
  errorMessage.value = '';

  // Log result with clinical interpretation
  const status =
    mechanicalPower.value < 12 ? 'NORMAL' : mechanicalPower.value <= 15 ? 'WARNING' : 'CRITICAL';
  logger.info(`✅ MP calculation completed - Status: ${status}`, {
    result: mechanicalPower.value,
    status,
    inputs: {
      rr: rrValue,
      vte: vteValue,
      picco: piccoValue,
      plateau: plateauValue,
      peep: peepValue,
    },
  });

  if (status === 'CRITICAL') {
    logger.warn('🚨 CRITICAL MP value detected (>15)!', { mp: mechanicalPower.value });
  }
}

/**
 * Resets all input fields and result
 *
 * @returns {void}
 */
/**
 * Reset completo form e localStorage
/**
 * 🎓 CONCETTO: Salvataggio Calcoli
 * - saveCalculation(): Apre dialog se ci sono risultati validi
 * - confirmSave(): Valida iniziali, crea SavedCalculation, salva in localStorage
 */
function saveCalculation(): void {
  if (!showResult.value || mechanicalPower.value === 0) {
    logger.warn('⚠️ Tentativo salvataggio senza risultato valido');
    return;
  }
  showSaveDialog.value = true;
  logger.info('💾 Apertura dialog salvataggio calcolo');
}

function confirmSave(): void {
  const trimmed = patientInitials.value.trim();

  if (trimmed.length === 0) {
    logger.warn('⚠️ Iniziali paziente vuote');
    return;
  }

  const calculation = createSavedCalculation(trimmed, mechanicalPower.value ?? 0);
  addSavedCalculation(calculation);

  showSaveDialog.value = false;
  patientInitials.value = '';

  logger.info(`✅ Calcolo salvato: ${calculation.initials} - ${calculation.result} J/min`);
}

/**
 * 🎓 CONCETTO: Reset Persistenza
 * - mp.resetAll() cancella TUTTI i dati da localStorage
 * - Resetta ref() locali (result, errors)
 * - VTe torna a '0.' (stringa formattata)
 */
function resetForm(): void {
  logger.info('🔄 Reset completo Mechanical Power Calculator (localStorage cleared)');

  // Reset persistenza localStorage (include result)
  mp.resetAll();

  // Reset VTe string display
  vte.value = '0.';

  // Reset UI flags
  showResult.value = false;
  errorMessage.value = '';
}
</script>

<template>
  <div class="mechanical-power-calculator">
    <q-card flat>
      <q-card-section class="bg-primary text-white row items-center q-pa-md">
        <div>
          <div class="text-h6">{{ t('calculators.mechanicalPower.title') }}</div>
          <div class="text-caption">{{ t('calculators.mechanicalPower.description') }}</div>
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
          {{ t('calculators.mechanicalPower.longDescription') }}
        </div>
      </q-card-section>

      <!-- Formula Expansion -->
      <q-expansion-item
        icon="calculate"
        :label="t('calculators.mechanicalPower.showFormula') || 'Formula'"
        header-class="bg-grey-2 text-grey-8"
        dense
      >
        <q-card class="bg-grey-1">
          <q-card-section class="q-pa-md">
            <div class="text-subtitle2 text-grey-9 q-mb-sm">
              {{ t('calculators.mechanicalPower.formulaTitle') }}
            </div>
            <div class="formula-box q-pa-md bg-white rounded-borders">
              <div
                class="text-h6 text-center text-primary q-mb-md"
                style="font-family: 'Courier New', monospace"
              >
                MP = 0.098 × RR × VTe × (Ppicco - 0.5 × ΔP)
              </div>
              <q-separator class="q-my-sm" />
            </div>
          </q-card-section>
        </q-card>
      </q-expansion-item>

      <q-card-section>
        <div class="row q-col-gutter-md">
          <!-- Respiratory Rate -->
          <div class="col-12 col-sm-6">
            <q-input
              v-model.number="rr"
              type="number"
              :label="t('calculators.mechanicalPower.rr')"
              :suffix="t('calculators.mechanicalPower.rrUnit')"
              outlined
              dense
              clearable
              placeholder="0"
              min="0"
              max="99"
              oninput="if (this.value.length > 2) this.value = this.value.slice(0, 2);"
              :rules="[(val) => (val !== null && val > 0) || t('validation.mustBePositive')]"
            >
              <template #prepend>
                <q-icon name="air" />
              </template>
            </q-input>
          </div>

          <!-- Tidal Volume -->
          <div class="col-12 col-sm-6">
            <q-input
              v-model="vte"
              type="text"
              inputmode="numeric"
              :label="t('calculators.mechanicalPower.vte')"
              :suffix="t('calculators.mechanicalPower.vteUnit')"
              outlined
              dense
              @input="handleVteInput"
              :rules="[(val) => getVteValue() > 0 || t('validation.mustBePositive')]"
            >
              <template #prepend>
                <q-icon name="opacity" />
              </template>
            </q-input>
          </div>

          <!-- Peak Pressure -->
          <div class="col-12 col-sm-4">
            <q-input
              v-model.number="picco"
              type="number"
              :label="t('calculators.mechanicalPower.picco')"
              :suffix="t('calculators.mechanicalPower.piccoUnit')"
              outlined
              dense
              clearable
              placeholder="0"
              min="0"
              max="99"
              oninput="if (this.value.length > 2) this.value = this.value.slice(0, 2);"
              :rules="[(val) => (val !== null && val > 0) || t('validation.mustBePositive')]"
            >
              <template #prepend>
                <q-icon name="arrow_upward" />
              </template>
            </q-input>
          </div>

          <!-- Plateau Pressure -->
          <div class="col-12 col-sm-4">
            <q-input
              v-model.number="plateau"
              type="number"
              :label="t('calculators.mechanicalPower.plateau')"
              :suffix="t('calculators.mechanicalPower.plateauUnit')"
              outlined
              dense
              clearable
              placeholder="0"
              min="0"
              max="99"
              oninput="if (this.value.length > 2) this.value = this.value.slice(0, 2);"
              :rules="[(val) => (val !== null && val > 0) || t('validation.mustBePositive')]"
            >
              <template #prepend>
                <q-icon name="linear_scale" />
              </template>
            </q-input>
          </div>

          <!-- PEEP -->
          <div class="col-12 col-sm-4">
            <q-input
              v-model.number="peep"
              type="number"
              :label="t('calculators.mechanicalPower.peep')"
              :suffix="t('calculators.mechanicalPower.peepUnit')"
              outlined
              dense
              clearable
              placeholder="0"
              min="0"
              max="99"
              oninput="if (this.value.length > 2) this.value = this.value.slice(0, 2);"
              :rules="[(val) => (val !== null && val >= 0) || t('validation.mustBePositive')]"
            >
              <template #prepend>
                <q-icon name="compress" />
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
              {{ showResult ? mechanicalPower : '---' }}
            </div>
            <div class="text-subtitle1 text-grey-8">
              {{ t('calculators.mechanicalPower.resultUnit') }}
            </div>
            <q-separator class="q-my-sm" />
            <div class="text-body2 text-grey-8">
              <strong>Range MP: 12-15 J/min</strong>
            </div>
          </q-card-section>
        </q-card>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat :label="t('common.reset')" color="primary" @click="resetForm" />
        <q-btn
          flat
          :label="t('common.save')"
          color="positive"
          icon="save"
          :disable="!showResult || mechanicalPower === 0"
          @click="saveCalculation"
        />
        <q-btn
          unelevated
          :label="t('common.calculate')"
          color="primary"
          icon="calculate"
          @click="calculateMP"
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
              outlined
              dense
              autofocus
              @keyup.enter="confirmSave"
            />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat :label="t('common.cancel')" color="primary" v-close-popup />
            <q-btn
              flat
              :label="t('common.save')"
              color="primary"
              @click="confirmSave"
              :disable="patientInitials.trim().length === 0"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-card>

    <!-- Saved Calculations Table -->
    <SavedCalculations
      calculator-type="mp"
      :calculations="savedCalculations"
      @remove="removeSavedCalculation"
    />
  </div>
</template>

<style scoped lang="scss">
.mechanical-power-calculator {
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
