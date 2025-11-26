/**
 * @file useSmartEnvironment.ts
 * @description 🧠 Auto-detection ambiente per ICUBoost
 * @version 1.0.0
 * @author Vasile Chifeac
 *
 * 🎓 CONCETTO CHIAVE:
 * Questo composable "capisce da solo" se stai lavorando in sviluppo (localhost)
 * o in produzione (Firebase). Così possiamo RISPARMIARE SOLDI disattivando
 * servizi costosi quando non servono!
 *
 * ANALOGIA:
 * È come un interruttore automatico che:
 * - In casa (localhost) → luci spente (gratis)
 * - In ufficio (production) → luci accese (costa)
 */

import { computed, reactive } from 'vue';

// =============================================================================
// 📊 TYPES (Definizioni TypeScript)
// =============================================================================

/**
 * Tipo di ambiente rilevato
 *
 * SPIEGAZIONE:
 * - development: Stai lavorando sul tuo computer (localhost)
 * - production: App pubblicata su internet (Firebase)
 */
export type EnvironmentType = 'development' | 'production';

/**
 * Informazioni complete sull'ambiente
 */
export interface ISmartConfig {
  // 🌍 Ambiente rilevato
  environment: EnvironmentType;
  isDevelopment: boolean;
  isProduction: boolean;

  // 💰 Servizi costosi (attivati solo in production)
  enableRemoteLogging: boolean; // Firebase logging
  enableAnalytics: boolean; // Google Analytics

  // ⚡ Ottimizzazioni
  cacheTTL: number; // Tempo cache (millisecondi)
  enableDebugMode: boolean; // Console logs visibili

  // 📊 Metadata
  detectedAt: Date;
  hostname: string;
  protocol: string;
  port: string;
}

// =============================================================================
// 🔍 FUNZIONI DI DETECTION
// =============================================================================

/**
 * 🌍 Rileva ambiente di esecuzione
 *
 * SPIEGAZIONE DETTAGLIATA:
 * Controlla `window.location.hostname` per capire dove stai:
 *
 * - 'localhost' → SEI IN SVILUPPO (computer)
 * - '127.0.0.1' → SEI IN SVILUPPO (computer, IP locale)
 * - '192.168.x.x' → SEI IN SVILUPPO (rete locale)
 * - 'icuboost.web.app' → SEI IN PRODUZIONE (Firebase)
 *
 * @returns {EnvironmentType} 'development' o 'production'
 */
function detectEnvironment(): EnvironmentType {
  const hostname = window.location.hostname;

  // 🏠 Pattern localhost/development
  const localhostPatterns = [
    'localhost',
    '127.0.0.1',
    '::1', // IPv6 localhost
  ];

  // Controlla se hostname è localhost
  if (localhostPatterns.includes(hostname)) {
    return 'development';
  }

  // Controlla se è rete privata (192.168.x.x, 10.x.x.x)
  if (hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname.endsWith('.local')) {
    return 'development';
  }

  // 🚀 Altrimenti è production
  return 'production';
}

/**
 * 💰 Genera configurazione ottimizzata per costi
 *
 * SPIEGAZIONE:
 * - In DEVELOPMENT: TUTTO GRATUITO (solo console)
 * - In PRODUCTION: Servizi Firebase attivi (costa soldi)
 *
 * PERCHÉ COSÌ?
 * Vogliamo che l'app sia GRATUITA in sviluppo per testare senza spendere!
 *
 * @returns {ISmartConfig} Configurazione completa
 */
function generateSmartConfig(): ISmartConfig {
  const environment = detectEnvironment();

  // 🎯 Flags booleani
  const isDevelopment = environment === 'development';
  const isProduction = environment === 'production';

  // 💰 OTTIMIZZAZIONE COSTI
  const config: ISmartConfig = {
    // Ambiente
    environment,
    isDevelopment,
    isProduction,

    // 💰 Servizi costosi - SOLO in production!
    enableRemoteLogging: isProduction, // Firebase logging
    enableAnalytics: isProduction, // Google Analytics

    // ⚡ Performance
    cacheTTL: isDevelopment ? 60000 : 300000, // 1min dev, 5min prod
    enableDebugMode: isDevelopment, // Console logs

    // 📊 Metadata
    detectedAt: new Date(),
    hostname: window.location.hostname,
    protocol: window.location.protocol,
    port: window.location.port || (window.location.protocol === 'https:' ? '443' : '80'),
  };

  return config;
}

// =============================================================================
// 🎯 COMPOSABLE PRINCIPALE
// =============================================================================

let configInstance: ISmartConfig | null = null;

/**
 * 🧠 Hook principale per auto-detection ambiente
 *
 * COME USARLO:
 * ```typescript
 * import { useSmartEnvironment } from 'src/composables/useSmartEnvironment';
 *
 * const { config, isDev, isProd } = useSmartEnvironment();
 *
 * if (isDev.value) {
 *   console.log('Sono in sviluppo! Tutto gratis! 🎉');
 * }
 *
 * if (config.enableRemoteLogging) {
 *   sendLogToFirebase(log); // Solo in production
 * }
 * ```
 *
 * @returns {Object} Oggetto con config e helper
 */
export function useSmartEnvironment() {
  // Singleton: genera config solo UNA volta
  if (!configInstance) {
    configInstance = generateSmartConfig();

    // 📊 Log di detection (solo in development)
    if (configInstance.isDevelopment && console) {
      console.log('🧠 SMART ENVIRONMENT DETECTED:');
      console.log(`   🏠 Hostname: ${configInstance.hostname}`);
      console.log(`   🌍 Environment: ${configInstance.environment}`);
      console.log(
        `   💰 Remote Logging: ${configInstance.enableRemoteLogging ? 'ENABLED (costs!)' : 'DISABLED (free!)'}`,
      );
      console.log(`   📱 Debug Mode: ${configInstance.enableDebugMode ? 'ON' : 'OFF'}`);
      console.log(
        `   ✅ Cost Status: ${configInstance.isDevelopment ? 'ZERO COST' : 'OPTIMIZED'}`,
      );
    }
  }

  // Reactive config
  const config = reactive(configInstance);

  // Computed helpers
  const isDev = computed(() => config.isDevelopment);
  const isProd = computed(() => config.isProduction);

  /**
   * Log informazioni ambiente (solo development)
   */
  const logEnvironmentInfo = () => {
    if (!config.isDevelopment) return;

    console.group('🧠 Smart Environment Configuration');
    console.table({
      Environment: config.environment,
      Hostname: config.hostname,
      'Remote Logging': config.enableRemoteLogging,
      Analytics: config.enableAnalytics,
      'Debug Mode': config.enableDebugMode,
      'Cache TTL': `${config.cacheTTL / 1000}s`,
    });
    console.groupEnd();
  };

  return {
    // Config object
    config,

    // Computed flags
    isDev,
    isProd,

    // Helper functions
    logEnvironmentInfo,
  };
}

/**
 * 🔥 Export per uso diretto (senza reactive)
 */
export function getSmartConfig(): ISmartConfig {
  if (!configInstance) {
    configInstance = generateSmartConfig();
  }
  return configInstance;
}

export default useSmartEnvironment;
