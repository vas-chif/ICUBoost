/**
 * @file useSavedCalculations.ts
 * @description Gestisce salvataggio calcoli in localStorage con iniziali paziente
 *
 * 🎓 CONCETTO: Ogni calcolatore ha il suo array di calcoli salvati
 * - MP: 'saved_calculations_mp'
 * - QR: 'saved_calculations_qr'
 *
 * STRUTTURA DATI:
 * {
 *   id: string (uuid),
 *   initials: string (max 2 char, uppercase),
 *   date: string (YYYY-MM-DD),
 *   time: string (HH:mm),
 *   result: number
 * }
 */

import { ref } from 'vue';
import type { Ref } from 'vue';

export interface SavedCalculation {
  id: string;
  initials: string;
  date: string;
  time: string;
  result: number;
}
/**
 * Ref reattivo per calcoli salvati
 */
export function useSavedCalculations(calculatorType: 'mp' | 'qr') {
  const storageKey = `saved_calculations_${calculatorType}`;
  
  const savedCalculations: Ref<SavedCalculation[]> = ref(
    JSON.parse(localStorage.getItem(storageKey) || '[]')
  );

  /**
   * Aggiunge un calcolo salvato
   *
   * @param calculation - Oggetto calcolo da salvare
   */
  function addSavedCalculation(calculation: SavedCalculation): void {
    savedCalculations.value.push(calculation);
    localStorage.setItem(storageKey, JSON.stringify(savedCalculations.value));
  }

  /**
   * Rimuove un calcolo salvato per indice
   *
   * @param index - Indice del calcolo da rimuovere
   */
  function removeSavedCalculation(index: number): void {
    savedCalculations.value.splice(index, 1);
    localStorage.setItem(storageKey, JSON.stringify(savedCalculations.value));
  }

  /**
   * 🎓 HELPER: Crea un nuovo calcolo salvato con data/ora corrente
   * 
   * @param initials - Iniziali paziente (max 2 char, uppercase)
   * @param result - Risultato del calcolo
   * @returns SavedCalculation object pronto per essere salvato
   */
  function createSavedCalculation(initials: string, result: number): SavedCalculation {
    const now = new Date();
    
    // Generate unique ID (fallback for older browsers)
    const id = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id,
      initials: initials.toUpperCase().slice(0, 2), // Max 2 char, uppercase
      date: now.toISOString().split('T')[0] || '', // YYYY-MM-DD
      time: now.toTimeString().slice(0, 5) || '', // HH:mm
      result: Math.round(result * 100) / 100, // 2 decimali
    };
  }

  /**
   * Pulisce tutti i calcoli salvati
   */
  function clearSavedCalculations(): void {
    savedCalculations.value = [];
    localStorage.setItem(storageKey, JSON.stringify(savedCalculations.value));
  }

  return {
    savedCalculations,
    addSavedCalculation,
    removeSavedCalculation,
    clearSavedCalculations,
    createSavedCalculation, // 🎓 Esponi helper
  };
}
