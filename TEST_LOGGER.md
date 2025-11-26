# 🎓 TEST DEL LOGGER - Guida Mentore

## 📚 COSA ABBIAMO CREATO

Hai appena implementato un **sistema di logging sicuro e intelligente** composto da 3 file:

### 1. `logger.config.ts` - La Configurazione
**Cosa fa**: Definisce le "regole" del logger
- Lista campi sensibili (password, email, token...)
- Livelli log (DEBUG, INFO, WARN, ERROR, SECURITY)
- Pattern regex per rilevare dati sensibili

**Perché è importante**: Protegge la privacy degli utenti!

### 2. `useSmartEnvironment.ts` - L'Auto-Detection
**Cosa fa**: Capisce automaticamente dove sta girando l'app
- `localhost` → development (GRATIS)
- `staging.tuodominio.com` → staging (test)
- `tuodominio.com` → production (COSTA!)

**Perché è importante**: Risparmia soldi loggando solo quando serve!

### 3. `useSecureLogger.ts` - Il Logger Vero
**Cosa fa**: Registra eventi dell'app in modo intelligente
- Sanitizza dati sensibili (email → ***)
- Scrive su console in development
- Salva in localStorage (futuro: Firebase) in production

**Perché è importante**: Ti aiuta a debuggare e monitorare l'app!

---

## 🧪 COME TESTARLO

### Test 1: Logger in Development (Console)

Apri un componente (es. `MechanicalPowerCalculator.vue`) e aggiungi:

```typescript
import { useSecureLogger } from 'src/composables/useSecureLogger';

// Nel setup()
const { logger } = useSecureLogger();

// Test vari livelli
logger.debug('🔍 Componente montato', { name: 'MechanicalPowerCalculator' });
logger.info('ℹ️ Calcolo iniziato', { rr: 15, vte: 0.5 });
logger.warn('⚠️ Valore alto', { mp: 18 });
logger.error('❌ Errore validazione', { field: 'RR', value: -1 });
```

**Cosa aspettarti nella Console del browser**:
```
🔍 [DEBUG] 2024-01-15T10:30:00.000Z Componente montato { name: 'MechanicalPowerCalculator' }
ℹ️ [INFO] 2024-01-15T10:30:01.000Z Calcolo iniziato { rr: 15, vte: 0.5 }
⚠️ [WARN] 2024-01-15T10:30:02.000Z Valore alto { mp: 18 }
❌ [ERROR] 2024-01-15T10:30:03.000Z Errore validazione { field: 'RR', value: -1 }
```

### Test 2: Sanitizzazione Dati Sensibili

Prova a loggare dati sensibili:

```typescript
logger.info('Login utente', {
  email: 'mario.rossi@gmail.com',
  password: 'super_secret_123',
  nome: 'Mario'
});
```

**Cosa aspettarti**:
```
ℹ️ [INFO] Login utente {
  email: '***',         // CENSURATO!
  password: '***',      // CENSURATO!
  nome: 'Mario'         // OK, non sensibile
}
```

### Test 3: Verifica Environment Detection

Apri la Console del browser e digita:

```javascript
import { useSmartEnvironment } from './composables/useSmartEnvironment';
const { config } = useSmartEnvironment();
console.log(config);
```

**Su localhost dovresti vedere**:
```javascript
{
  environment: 'development',
  isDevelopment: true,
  isStaging: false,
  isProduction: false,
  enableDebugMode: true,    // Console ON
  enableRemoteLogging: false // Firebase OFF (gratis!)
}
```

### Test 4: Verifica localStorage (Simulazione Production)

Per testare il salvataggio locale:

1. Apri DevTools → Application → Local Storage
2. Cerca la chiave `icuboost_logs`
3. Dovresti vedere un array JSON con max 100 log

---

## 🎯 DOVE USARE IL LOGGER

### Nel `MechanicalPowerCalculator.vue`

```typescript
import { useSecureLogger } from 'src/composables/useSecureLogger';

export default defineComponent({
  setup() {
    const { logger } = useSecureLogger();
    
    // All'inizio del calcolo
    function calculateMP() {
      logger.debug('Inizio calcolo MP', { rr: rr.value, vte: vte.value });
      
      try {
        // ... logica calcolo ...
        
        logger.info('Calcolo completato', { mp: mpResult.value });
        
        if (mpResult.value > 17) {
          logger.warn('Valore MP critico', { value: mpResult.value });
        }
      } catch (error) {
        logger.error('Errore calcolo MP', { error });
      }
    }
  }
});
```

### Nel `RespiratoryQuotientCalculator.vue`

```typescript
const { logger } = useSecureLogger();

function calculateQR() {
  logger.debug('Inizio calcolo QR', { sao2: sao2.value, svo2: svo2.value });
  
  // Validazione
  if (sao2.value > 100) {
    logger.error('SaO2 invalida', { value: sao2.value });
    return;
  }
  
  // ... calcolo ...
  
  logger.info('QR calcolato', { qr: qrResult.value });
}
```

---

## 💡 CONCETTI CHIAVE DA RICORDARE

### 1. **Singleton Pattern**
Il logger usa una sola istanza globale (performance!)

### 2. **Sanitizzazione Automatica**
Dati sensibili vengono SEMPRE censurati (sicurezza!)

### 3. **Environment-Aware**
Si adatta automaticamente a dev/staging/prod (risparmio!)

### 4. **Type-Safe**
TypeScript garantisce che usi i metodi corretti (qualità!)

---

## 🚀 PROSSIMI PASSI

1. ✅ **Test il logger** - Aggiungi log nei calcolatori
2. ⏳ **Validazione avanzata** - Usa logger per errori validazione
3. ⏳ **Firebase Integration** - Quando necessario, aggiungeremo invio remoto
4. ⏳ **Dashboard Logs** - Pagina per vedere log salvati in localStorage

---

## 📖 APPROFONDIMENTI

### Perché questo approccio?

- **Gratis in development**: Console log non costano
- **Economico in production**: localStorage free, Firebase solo se serve
- **Sicuro**: Nessun dato sensibile nei log
- **Scalabile**: Aggiungi Firebase quando hai budget

### Alternative (perché NON le usiamo)

- ❌ `console.log` diretto → Non sicuro, non configurabile
- ❌ Sentry/LogRocket → Costosi da subito
- ❌ Log sempre su Firebase → Spesa inutile in development

### Il nostro approccio

✅ Logger intelligente che costa ZERO finché non serve!

---

## 🎓 ESERCIZI PER TE

1. Aggiungi logger in `MechanicalPowerCalculator.vue`
2. Testa con dati sensibili per vedere sanitizzazione
3. Verifica localStorage dopo 10 calcoli
4. Prova a cambiare `minLevel` da DEBUG a ERROR

**Quando hai dubbi, rileggimi! Sono il tuo mentore 🧑‍🏫**
