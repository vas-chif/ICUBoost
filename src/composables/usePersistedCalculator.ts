/**
 * @file usePersistedCalculator.ts
 * @description Composable per gestire persistenza dati calcolatori in localStorage
 * @author ICUBoost Development Team
 * @version 1.0.0
 *
 * 🎓 CONCETTO CHIAVE - Persistenza Dati:
 *
 * **PROBLEMA:**
 * Quando navighi tra MP ↔ QR, i dati inseriti si perdono perché:
 * - ref() crea memoria TEMPORANEA (si cancella al unmount componente)
 * - Vuoi mantenere i dati finché non clicchi RESET
 *
 * **SOLUZIONE:**
 * 1. Salva dati in localStorage (memoria permanente browser)
 * 2. Carica dati da localStorage all'avvio componente
 * 3. Watch automatico per salvare ogni modifica
 * 4. Reset esplicito solo quando utente clicca button
 *
 * **VANTAGGI:**
 * - ✅ Dati persistono tra navigazioni MP ↔ QR
 * - ✅ Dati persistono anche dopo refresh pagina
 * - ✅ Codice riusabile (DRY - Don't Repeat Yourself)
 * - ✅ Type-safe con TypeScript generics
 *
 * **ARCHITETTURA:**
 * ```
 * User Input → ref() → watch() → localStorage
 *                ↑                    ↓
 *                └─────────────────────┘
 *                  (caricamento iniziale)
 * ```
 */

import { ref, watch } from 'vue';
import type { Ref } from 'vue';
import { useSecureLogger } from './useSecureLogger';

const { logger } = useSecureLogger();

/**
 * Tipo generico per valori numerici persistiti
 */
export type PersistedNumber = number | null;

/**
 * Composable per gestire un campo numerico persistito in localStorage
 *
 * @param storageKey - Chiave univoca per localStorage (es: 'mp_rr', 'qr_sao2')
 * @param defaultValue - Valore di default se localStorage vuoto (default: 0)
 * @returns Oggetto con ref reattivo e metodo reset
 *
 * @example
 * // In MechanicalPowerCalculator.vue
 * const { value: rr, reset: resetRR } = usePersistedField('mp_rr', 0);
 *
 * // Utente digita 15 → automaticamente salvato in localStorage
 * rr.value = 15;
 *
 * // Al refresh pagina → rr.value caricato automaticamente a 15
 *
 * // Click RESET → resetRR() → rr.value torna a 0
 */
export function usePersistedField(
  storageKey: string,
  defaultValue: PersistedNumber = null,
): {
  value: Ref<PersistedNumber>;
  reset: () => void;
} {
  /**
   * 🎓 STEP 1: Carica valore iniziale da localStorage
   *
   * CONCETTO: localStorage.getItem() ritorna string | null
   * - Se esiste → converti a number con Number()
   * - Se null → usa defaultValue
   *
   * ESEMPIO:
   * localStorage.getItem('mp_rr') → "15" → Number("15") → 15
   * localStorage.getItem('new_key') → null → defaultValue → 0
   */
  const storedValue = localStorage.getItem(storageKey);
  const initialValue = storedValue !== null && storedValue !== '' ? Number(storedValue) : defaultValue;

  logger.debug(`📦 Caricato campo persistito: ${storageKey}`, {
    storedValue,
    initialValue,
    defaultValue,
  });

  /**
   * 🎓 STEP 2: Crea ref reattivo con valore iniziale
   *
   * CONCETTO: ref() crea variabile reattiva
   * - Quando cambia → Vue aggiorna UI automaticamente
   * - Accesso valore: .value
   */
  const value = ref<PersistedNumber>(initialValue);

  /**
   * 🎓 STEP 3: Watch automatico per salvare modifiche
   *
   * CONCETTO: watch() osserva cambiamenti e esegue callback
   * - Primo parametro: cosa osservare (value)
   * - Secondo parametro: callback quando cambia (newValue)
   * - { immediate: false } = non eseguire al mount (già caricato da localStorage)
   *
   * FLUSSO:
   * User input → value.value = 15 → watch triggered → localStorage.setItem()
   */
  watch(
    value,
    (newValue) => {
      if (newValue !== null) {
        localStorage.setItem(storageKey, newValue.toString());
        logger.debug(`💾 Salvato campo: ${storageKey} = ${newValue}`);
      } else {
        localStorage.removeItem(storageKey);
        logger.debug(`🗑️ Rimosso campo: ${storageKey}`);
      }
    },
    { immediate: false }, // Non salvare al mount (già in localStorage)
  );

  /**
   * 🎓 STEP 4: Funzione reset esplicita
   *
   * CONCETTO: Reset solo quando utente clicca button RESET
   * - Cancella da localStorage
   * - Ripristina valore default
   * - Trigger watch → salva default in localStorage
   */
  function reset(): void {
    localStorage.removeItem(storageKey);
    value.value = defaultValue;
    logger.info(`🔄 Reset campo: ${storageKey} → ${defaultValue}`);
  }

  return {
    value,
    reset,
  };
}

/**
 * Composable specializzato per Mechanical Power Calculator
 *
 * @returns Oggetto con tutti i campi MP e metodo resetAll
 *
 * @example
 * const mp = usePersistedMechanicalPower();
 * mp.rr.value = 15;
 * mp.vte.value = 0.450;
 * mp.resetAll(); // Reset tutti i campi
 */
export function usePersistedMechanicalPower() {
  const rr = usePersistedField('mp_rr');
  const vte = usePersistedField('mp_vte');
  const picco = usePersistedField('mp_picco');
  const plateau = usePersistedField('mp_plateau');
  const peep = usePersistedField('mp_peep');
  const result = usePersistedField('mp_result', 0); // 🎓 Risultato calcolo persistito

  /**
   * Reset tutti i campi MP contemporaneamente
   */
  function resetAll(): void {
    rr.reset();
    vte.reset();
    picco.reset();
    plateau.reset();
    peep.reset();
    result.reset();
    logger.info('🔄 Reset completo Mechanical Power Calculator');
  }

  return {
    rr,
    vte,
    picco,
    plateau,
    peep,
    result,
    resetAll,
  };
}

/**
 * Composable specializzato per Respiratory Quotient Calculator
 *
 * @returns Oggetto con tutti i campi QR e metodo resetAll
 *
 * @example
 * const qr = usePersistedRespiratoryQuotient();
 * qr.sao2.value = 98;
 * qr.svo2.value = 75;
 * qr.resetAll(); // Reset tutti i campi
 */
export function usePersistedRespiratoryQuotient() {
  const pvco2 = usePersistedField('qr_pvco2');
  const paco2 = usePersistedField('qr_paco2');
  const hb = usePersistedField('qr_hb');
  const sao2 = usePersistedField('qr_sao2');
  const svo2 = usePersistedField('qr_svo2');
  const pao2 = usePersistedField('qr_pao2');
  const pvo2 = usePersistedField('qr_pvo2');
  const result = usePersistedField('qr_result', 0); // 🎓 Risultato calcolo persistito

  /**
   * Reset tutti i campi QR contemporaneamente
   */
  function resetAll(): void {
    pvco2.reset();
    paco2.reset();
    hb.reset();
    sao2.reset();
    svo2.reset();
    pao2.reset();
    pvo2.reset();
    result.reset();
    logger.info('🔄 Reset completo Respiratory Quotient Calculator');
  }

  return {
    pvco2,
    paco2,
    hb,
    sao2,
    svo2,
    pao2,
    pvo2,
    result,
    resetAll,
  };
}
