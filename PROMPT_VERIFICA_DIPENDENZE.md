# 🔍 PROMPT VERIFICA DIPENDENZE PROGETTO

> **Usa questo prompt in un altro progetto Quasar per verificare dipendenze e configurazioni**

---

## 📋 PROMPT COMPLETO DA COPIARE

```
Ciao! Ho bisogno di verificare se questo progetto Quasar ha tutte le dipendenze e configurazioni necessarie.

Il progetto usa:
- **Framework:** Quasar v2 (o v3)
- **Package Manager:** Yarn (OBBLIGATORIO - mai npm)
- **Build Tool:** Vite (o Webpack)
- **Language:** TypeScript strict mode

---

## 🎯 VERIFICA DA FARE:

### 1️⃣ **Package.json - Dipendenze**

Controlla se esistono e sono aggiornate:

```bash
# Esegui questo comando e mostrami l'output
cat package.json | grep -E "quasar|vue|typescript|vite|pinia|vue-i18n"
```

**Verifica queste dipendenze critiche:**
- `@quasar/app-vite` (o `@quasar/app-webpack`)
- `quasar` (framework)
- `vue` >= 3.0.0
- `typescript` >= 5.0.0
- `pinia` (state management)
- `vue-i18n` (se serve i18n)
- `vue-router` (routing)

**DOMANDE:**
1. Quali versioni sono installate?
2. Ci sono dipendenze deprecate o conflitti?
3. Mancano dipendenze essenziali per un progetto Quasar moderno?

---

### 2️⃣ **Quasar.config File**

Leggi il file di configurazione:

```bash
# TypeScript config
cat quasar.config.ts

# Oppure JavaScript config
cat quasar.config.js
```

**Verifica queste sezioni:**

#### A) **Build Configuration**
```typescript
build: {
  vueRouterMode: 'history', // o 'hash'
  typescript: {
    strict: true, // Deve essere true per TypeScript professionale
  },
}
```

#### B) **Framework Plugins**
```typescript
framework: {
  plugins: [
    'Notify',    // Notifiche toast
    'Dialog',    // Dialog modali
    'Loading',   // Loading spinner
    'LocalStorage', // Storage browser
  ],
}
```

**DOMANDE:**
1. `typescript.strict` è attivo?
2. Quali Quasar plugins sono configurati?
3. Mancano plugin utili per questo tipo di progetto?

#### C) **CSS/SCSS Configuration**
```typescript
css: [
  'app.scss', // File CSS principale
],
```

**DOMANDA:** Esiste `src/css/app.scss`?

#### D) **Boot Files**
```typescript
boot: [
  'i18n',      // Internazionalizzazione
  'axios',     // HTTP client
  // ... altri boot files
],
```

**DOMANDE:**
1. Quali boot files sono configurati?
2. Esistono i file corrispondenti in `src/boot/`?

---

### 3️⃣ **TypeScript Configuration**

Leggi `tsconfig.json`:

```bash
cat tsconfig.json
```

**Verifica queste opzioni critiche:**

```json
{
  "compilerOptions": {
    "strict": true,              // ✅ OBBLIGATORIO
    "noImplicitAny": true,       // ✅ OBBLIGATORIO
    "strictNullChecks": true,    // ✅ OBBLIGATORIO
    "esModuleInterop": true,
    "skipLibCheck": true,
    "moduleResolution": "node"
  }
}
```

**DOMANDE:**
1. `strict: true` è attivo?
2. Ci sono errori TypeScript nel progetto?
3. Path aliases configurati correttamente? (es: `@/*` → `src/*`)

---

### 4️⃣ **Struttura Cartelle**

Verifica struttura standard Quasar:

```bash
# Mostra struttura src/
tree src/ -L 2 -I node_modules

# Se tree non disponibile:
find src/ -maxdepth 2 -type d
```

**Cartelle obbligatorie:**
```
src/
├── assets/        # Immagini, fonts, file statici
├── boot/          # Boot files (axios, i18n, etc.)
├── components/    # Componenti Vue riutilizzabili
├── css/           # SCSS/CSS globali
├── layouts/       # Layout principali (MainLayout, etc.)
├── pages/         # Pagine/route
├── router/        # Vue Router config
└── stores/        # Pinia stores (state management)
```

**DOMANDE:**
1. Quali cartelle mancano?
2. Ci sono cartelle custom non standard?
3. La struttura segue best practices Quasar?

---

### 5️⃣ **ESLint & Prettier**

Verifica linting configuration:

```bash
# ESLint config
cat eslint.config.js  # Nuovo formato (v9+)
# oppure
cat .eslintrc.js      # Vecchio formato

# Prettier config
cat .prettierrc.json
# oppure
cat prettier.config.js
```

**Verifica regole critiche:**
- ✅ TypeScript plugin attivo
- ✅ Vue plugin attivo
- ✅ Quasar plugin attivo (se disponibile)
- ✅ Prettier integrato

**DOMANDE:**
1. ESLint configurato correttamente?
2. Ci sono errori lint nel progetto?
3. Prettier funziona con ESLint?

---

### 6️⃣ **Quasar Modes Installati**

Verifica quali mode Quasar sono attivi:

```bash
# Check cartelle mode
ls -la src-pwa 2>/dev/null && echo "✅ PWA mode installato"
ls -la src-cordova 2>/dev/null && echo "✅ Cordova mode installato"
ls -la src-capacitor 2>/dev/null && echo "✅ Capacitor mode installato"
ls -la src-electron 2>/dev/null && echo "✅ Electron mode installato"
```

**DOMANDE:**
1. Quali mode sono installati?
2. Servono mode aggiuntivi per questo progetto?
3. Mode configurati correttamente in `quasar.config`?

---

### 7️⃣ **Scripts Package.json**

Verifica script disponibili:

```bash
cat package.json | grep -A 20 "\"scripts\""
```

**Script essenziali che DEVONO esistere:**

```json
{
  "scripts": {
    "dev": "quasar dev",              // ✅ Development server
    "build": "quasar build",          // ✅ Production build
    "lint": "eslint --ext .js,.ts,.vue ./",  // ✅ Linting
    "format": "prettier --write \"**/*.{js,ts,vue,scss,html,md,json}\"",  // ✅ Formatting
    "type-check": "vue-tsc --noEmit"  // ✅ TypeScript check
  }
}
```

**DOMANDE:**
1. Quali script mancano?
2. Script funzionano correttamente?
3. Servono script custom aggiuntivi?

---

### 8️⃣ **Environment Variables**

Verifica file `.env`:

```bash
# Check se esistono
ls -la .env* 2>/dev/null

# Mostra struttura (SENZA valori sensibili!)
cat .env.example 2>/dev/null || echo "❌ .env.example non trovato"
```

**DOMANDE:**
1. Esiste `.env` per variabili ambiente?
2. Esiste `.env.example` template?
3. `.env` è in `.gitignore`? (DEVE esserlo!)

---

### 9️⃣ **Git Configuration**

Verifica `.gitignore`:

```bash
cat .gitignore | grep -E "node_modules|dist|.env|.quasar"
```

**Righe OBBLIGATORIE in .gitignore:**
```
node_modules/
dist/
.quasar/
.env
.env.local
*.log
```

**DOMANDE:**
1. `.gitignore` completo?
2. File sensibili protetti?
3. Build artifacts ignorati?

---

### 🔟 **Icone & Assets**

Verifica icone progetto:

```bash
# Check public icons
ls -la public/icons/ 2>/dev/null

# Check favicon
ls -la public/favicon.ico 2>/dev/null
```

**DOMANDE:**
1. Esistono icone in `public/icons/`?
2. Quante dimensioni icone disponibili?
3. Serve rigenerare icone con icongenie?

---

## 📊 **COMANDI DIAGNOSTICI COMPLETI**

Esegui tutti questi comandi e mostrami l'output:

```bash
# 1. Versioni installate
echo "=== VERSIONI PACCHETTI ==="
yarn list --pattern "quasar|vue|typescript|pinia"

# 2. Errori TypeScript
echo "=== ERRORI TYPESCRIPT ==="
yarn type-check 2>&1 | head -20

# 3. Errori ESLint
echo "=== ERRORI ESLINT ==="
yarn lint 2>&1 | head -20

# 4. Dipendenze obsolete
echo "=== DIPENDENZE OBSOLETE ==="
yarn outdated

# 5. Dipendenze duplicate
echo "=== DIPENDENZE DUPLICATE ==="
yarn list --pattern "vue" --depth=0

# 6. Size del progetto
echo "=== SIZE PROGETTO ==="
du -sh node_modules/
du -sh dist/ 2>/dev/null || echo "No build presente"
```

---

## 🎯 **OUTPUT RICHIESTO**

Per favore rispondi con:

### **1. SUMMARY TABLE**

| Componente | Stato | Versione | Note |
|------------|-------|----------|------|
| Quasar | ✅/❌ | 2.x.x | ... |
| Vue | ✅/❌ | 3.x.x | ... |
| TypeScript | ✅/❌ | 5.x.x | strict: ✅/❌ |
| Pinia | ✅/❌ | 3.x.x | ... |
| Vue Router | ✅/❌ | 4.x.x | mode: history/hash |
| ESLint | ✅/❌ | 9.x.x | ... |
| Prettier | ✅/❌ | 3.x.x | ... |

### **2. PROBLEMI TROVATI**

Lista prioritaria problemi:

**🔴 CRITICI (blocca sviluppo):**
- [ ] ...

**🟡 WARNINGS (migliorare):**
- [ ] ...

**🟢 SUGGESTIONS (opzionali):**
- [ ] ...

### **3. AZIONI RACCOMANDATE**

Comandi da eseguire per risolvere:

```bash
# Esempio:
yarn add -D @types/node
yarn upgrade quasar@latest
```

---

## 📚 **RIFERIMENTI**

- [Quasar Docs](https://quasar.dev/)
- [Vue 3 Docs](https://vuejs.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Pinia Docs](https://pinia.vuejs.org/)

---

**GRAZIE! Questo mi aiuterà a capire lo stato del progetto e cosa manca! 🚀**
```

---

## 🎓 **COME USARE QUESTO PROMPT**

### **STEP 1: Copia il Prompt**
Copia tutto il contenuto tra i ` ``` ` sopra.

### **STEP 2: Apri Altro Progetto**
Apri il progetto Quasar/Yarn che vuoi verificare in VS Code.

### **STEP 3: Chiedi a Copilot**
Incolla il prompt nella chat Copilot del progetto.

### **STEP 4: Analizza Risposta**
Copilot eseguirà tutti i comandi diagnostici e ti dirà:
- ✅ Cosa funziona
- ❌ Cosa manca
- 🔧 Come risolvere

---

## 📝 **CUSTOMIZZAZIONI PROMPT**

### **Per Progetto Backend:**
Aggiungi sezione:
```
### Backend APIs
- Verifica Express/Fastify/NestJS
- Verifica database client (Prisma/TypeORM)
- Verifica .env per DB credentials
```

### **Per Progetto PWA:**
Aggiungi sezione:
```
### PWA Configuration
- Verifica src-pwa/ folder
- Verifica manifest.json
- Verifica service worker
- Verifica icongenie icons
```

### **Per Progetto Mobile:**
Aggiungi sezione:
```
### Mobile Configuration
- Verifica src-cordova/ o src-capacitor/
- Verifica platform config (iOS/Android)
- Verifica native plugins
```

---

## 🎯 **ESEMPIO RISPOSTA ATTESA**

Copilot dovrebbe rispondere tipo:

```markdown
## ✅ VERIFICA COMPLETATA

### Summary Table
| Componente | Stato | Versione | Note |
|------------|-------|----------|------|
| Quasar | ✅ | 2.16.0 | OK |
| Vue | ✅ | 3.5.22 | OK |
| TypeScript | ⚠️ | 5.9.2 | strict: false ← DA ATTIVARE! |
| Pinia | ❌ | - | NON INSTALLATO! |

### 🔴 PROBLEMI CRITICI
- Pinia non installato → `yarn add pinia`
- TypeScript strict mode disabilitato → Attiva in tsconfig.json

### 🟡 WARNINGS
- ESLint ha 15 errori → Esegui `yarn lint --fix`
- 3 dipendenze obsolete → Esegui `yarn upgrade-interactive`

### AZIONI RACCOMANDATE
\`\`\`bash
yarn add pinia
# Poi attiva strict in tsconfig.json
\`\`\`
```

---

**PROMPT PRONTO! Salvalo e usalo nei tuoi progetti Quasar! 🎉**
