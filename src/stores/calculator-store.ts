/**
 * @file calculator-store.ts
 * @description Store Pinia per gestire navigazione tra calcolatori
 * @author ICUBoost Development Team
 * @version 1.0.0
 *
 * 🎓 CONCETTO:
 * Store locale che mantiene lo stato dell'app:
 * - Quale calcolatore è attivo
 * - Dialog aperto/chiuso
 * - Persistenza stato finché non clicchi Reset
 */

import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export type CalculatorType = 'mechanical-power' | 'respiratory-quotient' | null;

export const useCalculatorStore = defineStore('calculator', () => {
  // State
  const activeCalculator = ref<CalculatorType>(null);
  const showDialog = ref(false);

  /**
   * 🎓 CONCETTO: Search Query Centralizzato
   *
   * Perché nello store?
   * - MainLayout scrive (input header)
   * - IndexPage legge (filtro grid)
   * - Single source of truth (no prop drilling)
   */
  const searchQuery = ref('');

  const enablePhysiologicalValidations = ref(
    localStorage.getItem('enablePhysiologicalValidations') !== 'false',
  );

  // Watch per salvare in localStorage
  watch(enablePhysiologicalValidations, (newValue) => {
    localStorage.setItem('enablePhysiologicalValidations', String(newValue));
  });

  /**
   * Apre un calcolatore specifico
   *
   * @param calculator - Tipo di calcolatore da aprire
   */
  function openCalculator(calculator: Exclude<CalculatorType, null>): void {
    activeCalculator.value = calculator;
    showDialog.value = true;
  }

  /**
   * Naviga a un altro calcolatore senza chiudere il dialog
   *
   * @param calculator - Tipo di calcolatore a cui navigare
   */
  function navigateToCalculator(calculator: Exclude<CalculatorType, null>): void {
    activeCalculator.value = calculator;
  }

  /**
   * Chiude il dialog e resetta lo stato
   */
  function closeDialog(): void {
    showDialog.value = false;
    // Non resettiamo activeCalculator per permettere riapertura veloce
  }

  /**
   * Reset completo dello store
   */
  function reset(): void {
    activeCalculator.value = null;
    showDialog.value = false;
  }

  return {
    // State
    activeCalculator,
    showDialog,
    searchQuery,
    enablePhysiologicalValidations,

    // Actions
    openCalculator,
    navigateToCalculator,
    closeDialog,
    reset,
  };
});
