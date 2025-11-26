/**
 * @file logger.config.ts
 * @description Configurazione centralizzata per logging sicuro
 * @author ICUBoost Development Team
 * @version 1.0.0
 *
 * 🎓 CONCETTO CHIAVE:
 * Questo file contiene la lista di "parole proibite" che NON devono MAI
 * apparire nei log (per proteggere privacy utenti e sicurezza).
 *
 * ANALOGIA: È come una "lista nera" di informazioni segrete.
 */

/**
 * 📊 TYPES
 */
export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'SECURITY';
export type LogData = Record<string, unknown> | unknown[] | string | number | boolean | null;

/**
 * 🔒 CAMPI SENSIBILI DA SANITIZZARE
 *
 * SPIEGAZIONE:
 * - Questi sono nomi di campi che contengono dati personali/sensibili
 * - Se vediamo uno di questi nomi, maschiamo il valore con '***'
 *
 * ESEMPIO:
 * { email: 'user@example.com' } → { email: '***' }
 * { password: '123456' } → { password: '***' }
 */
export const SENSITIVE_FIELDS = [
  // 🔑 Autenticazione
  'password',
  'token',
  'secret',
  'apiKey',
  'accessToken',
  'refreshToken',
  'sessionToken',

  // 👤 Dati personali
  'email',
  'phone',
  'phoneNumber',
  'name',
  'surname',
  'fullName',

  // 🆔 Identificatori
  'userId',
  'uid',
  'sessionId',
  'deviceId',

  // 💳 Dati finanziari
  'creditCard',
  'cardNumber',
  'cvv',
  'iban',

  // 🏥 Dati medici sensibili (per ICUBoost)
  'patientId',
  'medicalRecord',
  'diagnosis',
  'personalHealthInfo',
] as const;

/**
 * 🔍 PATTERN REGEX PER RILEVARE DATI SENSIBILI
 *
 * SPIEGAZIONE:
 * - Espressioni regolari che trovano pattern specifici (email, telefoni, ecc.)
 * - Anche se il campo si chiama diversamente, questi pattern li trovano!
 *
 * ESEMPIO:
 * "Contattami su mario.rossi@gmail.com" → "Contattami su ***@gmail.com"
 */
export const SENSITIVE_PATTERNS = [
  // 📧 Email pattern
  {
    name: 'email',
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    replacement: '***@$DOMAIN', // Preserva dominio per debug
  },

  // 📱 Telefono italiano
  {
    name: 'phone_it',
    pattern: /(\+39|0039)?[\s]?([0-9]{2,3}[\s]?[0-9]{6,7}|[0-9]{3}[\s]?[0-9]{7})/g,
    replacement: '[PHONE_REDACTED]',
  },

  // 📱 Telefono internazionale
  {
    name: 'phone_intl',
    pattern: /\+[1-9]\d{1,14}/g,
    replacement: '[PHONE_REDACTED]',
  },

  // 💳 Carta di credito
  {
    name: 'credit_card',
    pattern:
      /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3[0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b/g,
    replacement: '[CARD_REDACTED]',
  },

  // 🇮🇹 Codice Fiscale Italiano
  {
    name: 'codice_fiscale',
    pattern: /[A-Z]{6}[0-9]{2}[ABCDEHLMPRST][0-9]{2}[A-Z][0-9]{3}[A-Z]/g,
    replacement: '[CF_REDACTED]',
  },

  // 💶 IBAN
  {
    name: 'iban',
    pattern: /\b[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}\b/g,
    replacement: '[IBAN_REDACTED]',
  },

  // 🔑 Token JWT
  {
    name: 'jwt_token',
    pattern: /eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*/g,
    replacement: '[TOKEN_REDACTED]',
  },
] as const;

/**
 * 🎨 CONFIGURAZIONE LIVELLI LOG
 *
 * SPIEGAZIONE:
 * - DEBUG: Informazioni dettagliate per sviluppo
 * - INFO: Eventi normali dell'applicazione
 * - WARN: Situazioni anomale ma non bloccanti
 * - ERROR: Errori che impediscono funzionalità
 * - SECURITY: Tentativi sospetti o violazioni sicurezza
 */
export const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  SECURITY: 4,
} as const;

/**
 * 🎯 CONFIGURAZIONE DEFAULT AMBIENTE
 *
 * SPIEGAZIONE:
 * - development: Localhost, tutto gratis (solo console)
 * - production: Firebase hosting, logging remoto attivo
 */
export const ENV_CONFIGS = {
  development: {
    minLevel: LOG_LEVELS.DEBUG, // Mostra tutti i log
    enableConsole: true, // Console browser sempre attiva
    enableRemote: false, // NO Firebase (gratis!)
    sanitizeData: true, // Comunque proteggi dati
  },
  production: {
    minLevel: LOG_LEVELS.ERROR, // Solo errori gravi
    enableConsole: false, // NO console in produzione
    enableRemote: true, // Invia a Firebase
    sanitizeData: true, // SEMPRE proteggi dati
  },
} as const;

export default {
  SENSITIVE_FIELDS,
  SENSITIVE_PATTERNS,
  LOG_LEVELS,
  ENV_CONFIGS,
};
