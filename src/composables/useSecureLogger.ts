/**
 * @file useSecureLogger.ts
 * @description Sistema di logging sicuro con auto-detection environment
 * @author ICUBoost Development Team
 * @version 1.0.0
 *
 * 🎓 CONCETTO CHIAVE:
 * Questo è il "diario dell'app" che registra cosa succede, ma in modo INTELLIGENTE:
 * - In sviluppo → scrive solo sulla console (GRATIS)
 * - In produzione → invia a Firebase (costa soldi, ma necessario)
 * - NON registra MAI password/email (privacy!)
 *
 * ANALOGIA:
 * È come un giornalista che:
 * - Scrive articoli solo quando succede qualcosa di importante
 * - Censura informazioni sensibili (***@gmail.com invece di email completa)
 * - Costa poco perché lavora solo quando serve!
 */

import { useSmartEnvironment } from './useSmartEnvironment';
import {
  SENSITIVE_FIELDS,
  SENSITIVE_PATTERNS,
  LOG_LEVELS,
  type LogLevel,
  type LogData,
} from './logger.config';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: LogData | undefined;
  environment: string;
}

/**
 * 🎨 ICONE PER LIVELLI LOG
 *
 * SPIEGAZIONE:
 * Rendiamo i log più leggibili con emoji!
 */
const LOG_ICONS: Record<LogLevel, string> = {
  DEBUG: '🔍',
  INFO: 'ℹ️',
  WARN: '⚠️',
  ERROR: '❌',
  SECURITY: '🛡️',
};

/**
 * 🔐 CLASSE LOGGER SICURA
 *
 * SPIEGAZIONE:
 * Questa classe ha 3 responsabilità principali:
 * 1. Sanitizzare dati (rimuovere info sensibili)
 * 2. Scrivere su console (development)
 * 3. Inviare a Firebase (production)
 */
class SecureLogger {
  private minLevel: LogLevel;
  private enableConsole: boolean;
  private enableRemote: boolean;
  private environment: string;

  constructor() {
    // Auto-detection ambiente
    const { config } = useSmartEnvironment();

    this.environment = config.environment;
    this.enableConsole = config.enableDebugMode;
    this.enableRemote = config.enableRemoteLogging;

    // Livello minimo log
    this.minLevel = config.isDevelopment ? 'DEBUG' : 'ERROR';

    // 📊 Log configurazione (solo in dev)
    if (config.isDevelopment && console) {
      console.log('🔐 SECURE LOGGER INITIALIZED:');
      console.log(`   📱 Min Level: ${this.minLevel}`);
      console.log(`   💻 Console: ${this.enableConsole ? 'ON' : 'OFF'}`);
      console.log(`   ☁️ Remote: ${this.enableRemote ? 'ON (costs!)' : 'OFF (free!)'}`);
    }
  }

  /**
   * 📏 Verifica se il log level è abilitato
   *
   * SPIEGAZIONE:
   * In production vogliamo SOLO errori gravi (ERROR, SECURITY)
   * In development vogliamo TUTTO (DEBUG, INFO, WARN, ERROR)
   *
   * ESEMPIO:
   * - Production: DEBUG non passa (troppo verboso)
   * - Development: DEBUG passa (ci serve per debug!)
   */
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.minLevel];
  }

  /**
   * 🔒 Sanitizza dati sensibili
   *
   * SPIEGAZIONE DETTAGLIATA:
   * Questo metodo "censura" informazioni personali prima di loggarle.
   *
   * COME FUNZIONA:
   * 1. Controlla ogni chiave dell'oggetto
   * 2. Se la chiave è in SENSITIVE_FIELDS → sostituisce con '***'
   * 3. Se il valore contiene pattern sensibili (email, telefono) → censura
   *
   * ESEMPIO INPUT:
   * { email: 'mario@gmail.com', nome: 'Mario', password: '123456' }
   *
   * ESEMPIO OUTPUT:
   * { email: '***', nome: 'Mario', password: '***' }
   *
   * @param data - Dati da sanitizzare
   * @returns Dati sanitizzati
   */
  private sanitize(data: LogData): LogData {
    if (typeof data !== 'object' || data === null) {
      // Se è stringa, controlla pattern
      if (typeof data === 'string') {
        let sanitized = data;
        SENSITIVE_PATTERNS.forEach((pattern) => {
          sanitized = sanitized.replace(pattern.pattern, pattern.replacement);
        });
        return sanitized;
      }
      return data;
    }

    // Se è array
    if (Array.isArray(data)) {
      return data.map((item) => this.sanitize(item as LogData)) as LogData;
    }

    // Se è oggetto
    const sanitized = { ...data } as Record<string, unknown>;

    // Rimuovi campi sensibili
    SENSITIVE_FIELDS.forEach((field) => {
      if (field in sanitized) {
        sanitized[field] = '***'; // Censura!
      }
    });

    // Sanitizza valori ricorsivamente
    Object.keys(sanitized).forEach((key) => {
      sanitized[key] = this.sanitize(sanitized[key] as LogData);
    });

    return sanitized;
  }

  /**
   * 📡 Invia log a Firebase (SOLO se abilitato)
   *
   * SPIEGAZIONE:
   * Questo metodo costa SOLDI perché scrive su Firebase!
   * Per questo è disabilitato in development.
   *
   * NOTA: Per ora salviamo solo in localStorage (gratis)
   * In futuro aggiungeremo Firebase quando necessario.
   */
  private sendToRemote(level: LogLevel, message: string, data?: LogData): void {
    if (!this.enableRemote) return;

    try {
      // 💾 Salvataggio locale (GRATIS)
      const logEntry: LogEntry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        data: data ? this.sanitize(data) : undefined,
        environment: this.environment,
      };

      // Salva in localStorage (max 100 log)
      const logs = JSON.parse(localStorage.getItem('icuboost_logs') || '[]');
      logs.push(logEntry);

      // Mantieni solo ultimi 100 log
      if (logs.length > 100) {
        logs.shift();
      }

      localStorage.setItem('icuboost_logs', JSON.stringify(logs));

      // 🔥 TODO FUTURO: Inviare a Firebase se necessario
      // await sendToFirebase(logEntry);
    } catch (error) {
      // Errore silenzioso (non vogliamo bloccare l'app per un log!)
      if (this.enableConsole) {
        console.error('❌ Failed to save log:', error);
      }
    }
  }

  /**
   * 📝 Log principale (PRIVATO)
   *
   * SPIEGAZIONE:
   * Questo è il "motore" del logger. Decide:
   * 1. Se loggare o no (shouldLog)
   * 2. Dove loggare (console e/o remote)
   * 3. Come formattare il messaggio
   */
  private log(level: LogLevel, message: string, data?: LogData): void {
    if (!this.shouldLog(level)) return;

    const timestamp = new Date().toISOString();
    const icon = LOG_ICONS[level];
    const sanitizedData = data ? this.sanitize(data) : undefined;

    // 💻 Log su console (se abilitato)
    if (this.enableConsole && console) {
      const consoleMethod = level === 'ERROR' ? 'error' : level === 'WARN' ? 'warn' : 'log';
      const style = `color: ${level === 'ERROR' ? 'red' : level === 'WARN' ? 'orange' : 'blue'}; font-weight: bold;`;

      console[consoleMethod](
        `%c${icon} [${level}] ${timestamp}`,
        style,
        message,
        sanitizedData || '',
      );
    }

    // ☁️ Log remoto (se abilitato)
    if (this.enableRemote) {
      this.sendToRemote(level, message, sanitizedData);
    }
  }

  // 🎯 METODI PUBBLICI

  /**
   * 🔍 Log DEBUG - Per sviluppo
   *
   * QUANDO USARE:
   * - Informazioni tecniche dettagliate
   * - Valori variabili durante esecuzione
   * - Flusso esecuzione codice
   *
   * ESEMPIO:
   * logger.debug('Calcolo MP iniziato', { rr: 15, vte: 0.5 });
   */
  debug(message: string, data?: LogData): void {
    this.log('DEBUG', message, data);
  }

  /**
   * ℹ️ Log INFO - Informazioni normali
   *
   * QUANDO USARE:
   * - Eventi importanti applicazione
   * - Azioni utente completate
   * - Milestone raggiunti
   *
   * ESEMPIO:
   * logger.info('Calcolo MP completato', { result: 12.5 });
   */
  info(message: string, data?: LogData): void {
    this.log('INFO', message, data);
  }

  /**
   * ⚠️ Log WARN - Avvisi
   *
   * QUANDO USARE:
   * - Situazioni anomale non bloccanti
   * - Valori fuori range consigliato
   * - Deprecation warnings
   *
   * ESEMPIO:
   * logger.warn('Valore MP elevato', { value: 18 });
   */
  warn(message: string, data?: LogData): void {
    this.log('WARN', message, data);
  }

  /**
   * ❌ Log ERROR - Errori
   *
   * QUANDO USARE:
   * - Errori che impediscono funzionalità
   * - Eccezioni catturate
   * - Validazioni fallite critiche
   *
   * ESEMPIO:
   * logger.error('Calcolo fallito', { error: 'Division by zero' });
   */
  error(message: string, data?: LogData): void {
    this.log('ERROR', message, data);
  }

  /**
   * 🛡️ Log SECURITY - Sicurezza
   *
   * QUANDO USARE:
   * - Tentativi accesso non autorizzato
   * - Input sospetti (SQL injection, XSS)
   * - Violazioni policy sicurezza
   *
   * ESEMPIO:
   * logger.security('Input sospetto rilevato', { input: '<script>alert(1)</script>' });
   */
  security(message: string, data?: LogData): void {
    this.log('SECURITY', message, data);
  }
}

// 💾 Singleton instance
let loggerInstance: SecureLogger | null = null;

/**
 * 🎯 COMPOSABLE PRINCIPALE
 *
 * COME USARLO NEI COMPONENTI:
 * ```typescript
 * import { useSecureLogger } from 'src/composables/useSecureLogger';
 *
 * const { logger } = useSecureLogger();
 *
 * // In development: scrive su console
 * // In production: invia a Firebase
 * logger.debug('Componente montato');
 * logger.info('Calcolo eseguito', { result: 12.5 });
 * logger.error('Errore validazione', { field: 'RR', value: -1 });
 * ```
 */
export function useSecureLogger() {
  // Crea istanza solo una volta (singleton)
  if (!loggerInstance) {
    loggerInstance = new SecureLogger();
  }

  return {
    logger: loggerInstance,

    // Helper methods diretti
    debug: (message: string, data?: LogData) => loggerInstance!.debug(message, data),
    info: (message: string, data?: LogData) => loggerInstance!.info(message, data),
    warn: (message: string, data?: LogData) => loggerInstance!.warn(message, data),
    error: (message: string, data?: LogData) => loggerInstance!.error(message, data),
    security: (message: string, data?: LogData) => loggerInstance!.security(message, data),
  };
}

export default useSecureLogger;
