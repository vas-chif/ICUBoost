# 🚀 Guida Completa: CI/CD con GitHub Actions per Quasar + Capacitor + Firebase

**Riutilizzabile per tutti i progetti futuri**

---

## 📋 INDICE

1. [Prerequisiti](#-prerequisiti)
2. [Setup Capacitor](#-setup-capacitor)
3. [Setup Firebase](#-setup-firebase)
4. [GitHub Actions Workflows](#-github-actions-workflows)
5. [Deploy Manuale vs Automatico](#-deploy-manuale-vs-automatico)
6. [Troubleshooting Comuni](#-troubleshooting-comuni)
7. [Checklist Finale](#-checklist-finale)

---

## 🎯 PREREQUISITI

### Installazioni Locali
```bash
# Node.js 18+
node --version

# Yarn
yarn --version

# Firebase CLI
npm install -g firebase-tools

# Xvfb (solo su server senza display)
sudo apt-get install xvfb
```

### Account Necessari
- ✅ GitHub account
- ✅ Google/Firebase account (piano Spark gratuito)
- ✅ Google Developer account (solo iOS - $99/anno)

---

## 📦 SETUP CAPACITOR

### 1. Aggiungi Capacitor Mode a Quasar

**Opzione A: Con display grafico**
```bash
quasar mode add capacitor
```

**Opzione B: Server headless (no GUI)**
```bash
# Installa Xvfb
sudo apt-get install xvfb

# Usa virtual display
xvfb-run -a quasar mode add capacitor
```

**Opzione C: Manuale (più affidabile)**
```bash
# 1. Crea directory
mkdir src-capacitor

# 2. Crea package.json
cat > src-capacitor/package.json << 'EOF'
{
  "name": "your-app-capacitor",
  "version": "1.0.0",
  "description": "Your App Mobile",
  "dependencies": {
    "@capacitor/android": "^6.0.0",
    "@capacitor/app": "^6.0.0",
    "@capacitor/cli": "^6.0.0",
    "@capacitor/core": "^6.0.0",
    "@capacitor/splash-screen": "^6.0.0"
  }
}
EOF

# 3. Crea capacitor.config.json
cat > src-capacitor/capacitor.config.json << 'EOF'
{
  "appId": "com.yourcompany.yourapp",
  "appName": "YourApp",
  "webDir": "www",
  "server": {
    "androidScheme": "https"
  }
}
EOF

# 4. Installa dipendenze
cd src-capacitor
yarn install
cd ..
```

### 2. Aggiorna package.json Root

```json
{
  "dependencies": {
    "@capacitor/android": "^6.0.0",
    "@capacitor/app": "^6.0.0",
    "@capacitor/cli": "^6.0.0",
    "@capacitor/core": "^6.0.0",
    "@capacitor/ios": "^6.0.0"
  }
}
```

**⚠️ CRITICO:** Usa **Capacitor v6** (stabile). La v7 NON è ancora su npm!

### 3. Verifica Struttura

```
your-project/
├── src/              # Codice Quasar
├── src-capacitor/    # ✅ Progetto Capacitor
│   ├── package.json
│   ├── capacitor.config.json
│   └── www/          # (creato automaticamente al build)
├── dist/
│   └── spa/          # ✅ Build output Quasar
├── package.json
└── firebase.json
```

---

## 🔥 SETUP FIREBASE

### 1. Login Firebase CLI

**Con browser locale:**
```bash
firebase login
```

**Server remoto (no browser):**
```bash
firebase login --no-localhost

# 1. Salva Session ID mostrato
# 2. Apri URL su altro device
# 3. Incolla authorization code
```

### 2. Inizializza Hosting

```bash
firebase init hosting
```

**Risposte:**
```
? Select Firebase project: Create new or select existing
? Public directory: dist/spa
? Configure as SPA: Yes
? Set up GitHub deploys: No
? Overwrite index.html: No
```

### 3. Ottimizza `firebase.json`

```json
{
  "hosting": {
    "public": "dist/spa",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp|ico|js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "index.html",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache, no-store, must-revalidate"
          }
        ]
      },
      {
        "source": "service-worker.js",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache"
          }
        ]
      }
    ]
  }
}
```

### 4. Genera CI Token

```bash
firebase login:ci

# Output:
# ✔ Success! Use this token to login on a CI server:
# 1//03Ab32j91QgFeN_Xy4sAcXDTHRH_FLOtyd2wlIA4F7VcuuJY...
```

**💾 SALVA IL TOKEN!** Servirà per GitHub Secrets.

---

## 🤖 GITHUB ACTIONS WORKFLOWS

### Workflow 1: Firebase Auto-Deploy

**File:** `.github/workflows/firebase-deploy.yml`

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: 📥 Checkout repository
        uses: actions/checkout@v4

      - name: 🔧 Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'yarn'

      - name: 📦 Install dependencies
        run: yarn install --frozen-lockfile

      - name: 🏗️ Build Quasar SPA
        run: npx quasar build -m spa
        env:
          NODE_ENV: production

      - name: 🚀 Deploy to Firebase Hosting
        if: github.ref == 'refs/heads/main'
        run: |
          npm install -g firebase-tools
          firebase deploy --only hosting --token ${{ secrets.FIREBASE_TOKEN }}
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

### Workflow 2: Android APK Build

**File:** `.github/workflows/android-build.yml`

```yaml
name: Android APK Build

on:
  workflow_dispatch: # Solo manuale

jobs:
  build-android:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'yarn'

      - name: Install dependencies
        run: yarn install

      - name: Install Capacitor dependencies
        run: |
          cd src-capacitor
          yarn install

      - name: Build Quasar SPA
        run: npx quasar build -m spa
        env:
          NODE_ENV: production

      - name: Copy build to Capacitor
        run: |
          mkdir -p src-capacitor/www
          cp -r dist/spa/* src-capacitor/www/

      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: Setup Android SDK
        uses: android-actions/setup-android@v3

      - name: Add Android platform and sync
        run: |
          cd src-capacitor
          npx cap add android
          npx cap sync android

      - name: Build Android APK (Debug)
        run: |
          cd src-capacitor/android
          chmod +x ./gradlew
          ./gradlew assembleDebug

      - name: Upload APK artifact
        uses: actions/upload-artifact@v4
        with:
          name: app-debug-apk
          path: src-capacitor/android/app/build/outputs/apk/debug/app-debug.apk
          retention-days: 30
```

### Setup GitHub Secrets

**Vai su:** `https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions`

1. Click **"New repository secret"**
2. **Name:** `FIREBASE_TOKEN`
3. **Secret:** `1//03Ab32j91Qg...` (il token da `firebase login:ci`)
4. Click **"Add secret"**

---

## 🔄 DEPLOY MANUALE VS AUTOMATICO

### Deploy Manuale (dal terminale)

```bash
# 1. Build locale
npx quasar build -m spa

# 2. Verifica dist/spa/
ls -la dist/spa/

# 3. Deploy Firebase
firebase deploy --only hosting

# URL: https://your-app.web.app
```

### Deploy Automatico (GitHub Actions)

```bash
# 1. Modifica codice
# ... edit files in src/ ...

# 2. Commit con conventional commits
git add .
git commit -m "feat(calculator): add new feature"

# 3. Push su main
git push origin main

# 4. Workflow parte automaticamente!
# Vai su: https://github.com/YOUR_REPO/actions
```

### Build APK Manuale (GitHub UI)

1. Vai su: `https://github.com/YOUR_REPO/actions/workflows/android-build.yml`
2. Click **"Run workflow"** (dropdown verde)
3. Seleziona branch: `main`
4. Click **"Run workflow"**
5. Aspetta 10-15 minuti
6. Download APK da **"Artifacts"** in fondo alla pagina

---

## 🐛 TROUBLESHOOTING COMUNI

### ❌ Errore: `quasar: command not found`

**Causa:** Quasar CLI non disponibile globalmente in GitHub Actions.

**Fix:**
```yaml
# ❌ SBAGLIATO
run: quasar build -m spa

# ✅ CORRETTO
run: npx quasar build -m spa
```

### ❌ Errore: `Couldn't find @capacitor/app@^7.4.4`

**Causa:** Capacitor v7 non è ancora rilasciato su npm.

**Fix:** Usa Capacitor v6:
```json
{
  "dependencies": {
    "@capacitor/android": "^6.0.0",
    "@capacitor/app": "^6.0.0",
    "@capacitor/cli": "^6.0.0",
    "@capacitor/core": "^6.0.0"
  }
}
```

Poi:
```bash
rm -rf node_modules yarn.lock src-capacitor/node_modules src-capacitor/yarn.lock
yarn install
cd src-capacitor && yarn install
```

### ❌ Errore: `dist/spa directory not found`

**Causa:** Build non completato o path sbagliato.

**Fix:**
```bash
# Verifica build locale
npx quasar build -m spa
ls dist/spa/index.html  # Deve esistere

# Verifica firebase.json
cat firebase.json
# "public": "dist/spa"  ← deve essere esatto
```

### ❌ Firebase deploy mostra versione vecchia

**Causa:** Cache del browser o build non aggiornato.

**Fix:**
```bash
# 1. Verifica che hai buildato
npx quasar build -m spa

# 2. Verifica file modificati
ls -lht dist/spa/ | head

# 3. Hard refresh browser
# Ctrl+Shift+R (Windows/Linux)
# Cmd+Shift+R (Mac)

# 4. Cancella cache browser completamente
# Chrome: DevTools → Network → Disable cache

# 5. Force deploy con messaggio
firebase deploy --only hosting -m "Force update v2.0"

# 6. Verifica sul Firebase Console
# https://console.firebase.google.com/project/YOUR_PROJECT/hosting
```

### ❌ GitHub Actions: Invalid workflow file

**Causa:** Sintassi YAML sbagliata (spesso indentazione).

**Fix:** Usa validator:
- https://www.yamllint.com/
- VS Code extension: "YAML" by Red Hat

**Errore comune:**
```yaml
# ❌ SBAGLIATO (secrets in if condition)
if: secrets.FIREBASE_TOKEN != ''

# ✅ CORRETTO
if: github.ref == 'refs/heads/main'
# I secrets NON possono essere controllati in if!
```

### ❌ APK non genera su GitHub Actions

**Causa:** Workflow Android è disabilitato (solo manual trigger).

**Fix:** Attiva manualmente:
1. https://github.com/YOUR_REPO/actions/workflows/android-build.yml
2. "Run workflow" → main → "Run workflow"

---

## ✅ CHECKLIST FINALE

### Prima del Deploy

- [ ] `src-capacitor/` esiste con package.json e capacitor.config.json
- [ ] Capacitor v6 (NON v7) in entrambi i package.json
- [ ] `firebase.json` configurato con `"public": "dist/spa"`
- [ ] Firebase token generato (`firebase login:ci`)
- [ ] GitHub secret `FIREBASE_TOKEN` aggiunto
- [ ] Workflows in `.github/workflows/` committati
- [ ] `yarn install` completato senza errori
- [ ] Build locale funziona (`npx quasar build -m spa`)

### Dopo il Deploy

- [ ] Workflow Firebase completato con ✅ verde
- [ ] URL Firebase accessibile: `https://YOUR_APP.web.app`
- [ ] Hard refresh browser mostra nuova versione
- [ ] PWA installabile (icona "Installa app" nel browser)
- [ ] Service worker attivo (DevTools → Application → Service Workers)
- [ ] Lighthouse score > 90 (DevTools → Lighthouse)

### Per Android APK

- [ ] Workflow eseguito manualmente con successo
- [ ] APK scaricato dagli artifacts
- [ ] APK installabile su device/emulator Android
- [ ] App funziona offline
- [ ] Splash screen appare correttamente

---

## 📊 COMANDI UTILI

### Git Conventional Commits

```bash
# Feature
git commit -m "feat(auth): add login functionality"

# Bug fix
git commit -m "fix(calculator): resolve division by zero"

# CI/CD
git commit -m "ci(github): update Android workflow to use Java 17"

# Build/deps
git commit -m "build(deps): upgrade Capacitor to v6"

# Docs
git commit -m "docs(readme): add deployment instructions"
```

### Firebase Commands

```bash
# Deploy hosting
firebase deploy --only hosting

# Preview deploy (channel temporaneo)
firebase hosting:channel:deploy preview

# Rollback ultima versione
firebase hosting:rollback

# Lista versioni
firebase hosting:releases:list

# Serve locale
firebase serve
```

### Capacitor Commands

```bash
# Sync webapp → Capacitor
npx cap sync android

# Open IDE
npx cap open android

# Update plugins
npx cap update
```

---

## 🎯 WORKFLOW COMPLETO TIPO

```bash
# 1. Modifica codice
vim src/pages/Dashboard.vue

# 2. Test locale
yarn dev

# 3. Build locale
npx quasar build -m spa

# 4. Test build
firebase serve
# Apri: http://localhost:5000

# 5. Commit con conventional commits
git add .
git commit -m "feat(dashboard): add new metrics widget"

# 6. Push (trigger auto-deploy Firebase)
git push origin main

# 7. Verifica workflow
# https://github.com/YOUR_REPO/actions

# 8. Test produzione
# https://YOUR_APP.web.app

# 9. (Opzionale) Genera APK
# GitHub → Actions → Android APK Build → Run workflow

# 10. Download APK dagli artifacts dopo ~15min
```

---

## 📚 RISORSE

- **Quasar Docs:** https://quasar.dev/quasar-cli-vite/developing-capacitor-apps
- **Capacitor Docs:** https://capacitorjs.com/docs
- **Firebase Hosting:** https://firebase.google.com/docs/hosting
- **GitHub Actions:** https://docs.github.com/en/actions
- **Conventional Commits:** https://www.conventionalcommits.org/

---

## 🎉 RISULTATO FINALE

Dopo setup completo avrai:

✅ **Firebase Hosting:** Deploy automatico ad ogni push su main  
✅ **APK Android:** Generabile on-demand da GitHub UI  
✅ **HTTPS:** Certificato SSL automatico  
✅ **CDN:** 100+ edge locations globally  
✅ **PWA:** Installabile su mobile/desktop  
✅ **Zero costi:** Piano Spark gratuito forever  
✅ **CI/CD:** Build/test/deploy completamente automatizzato

**Tempo setup:** ~30 minuti  
**Tempo deploy:** ~3 minuti (automatico)  
**Tempo APK build:** ~15 minuti (manuale)

---

**🚀 Pronto per nuovi progetti! Copia questa guida e segui gli step.**
