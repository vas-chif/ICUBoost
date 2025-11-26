# 🚀 Guida Completa: Deploy Medical Utility Pro su Firebase Hosting

**Costo:** ✅ **GRATUITO** con piano Spark (10 GB storage + 360 MB/giorno traffico)

---

## 📋 PREREQUISITI

```bash
# 1. Node.js già installato ✅
node --version  # v18+ richiesto

# 2. Account Google/Firebase
# Vai su: https://console.firebase.google.com
# Accedi con account Google
```

---

## 🔧 STEP 1: Installa Firebase CLI

```bash
# Installa globalmente Firebase Tools
npm install -g firebase-tools

# Verifica installazione
firebase --version
```

---

## 🔐 STEP 2: Login a Firebase

```bash
# Login con account Google
firebase login

# Se sei su server remoto senza browser:
firebase login --no-localhost

# Segui il link generato e copia il token di autorizzazione
```

---

## 🏗️ STEP 3: Inizializza Firebase nel Progetto

```bash
cd /home/nyk-ai/projects/medicalUtility

# Inizializza Firebase
firebase init hosting

# Rispondere alle domande interattive:
```

### **Domande Firebase Init:**

1. **Select a Firebase project:**
   - `Create a new project` → **Invio**
   - Nome progetto: `medical-utility-pro` (o nome personalizzato)

2. **What do you want to use as your public directory?**

   ```
   dist/spa
   ```

   _(Quasar builda l'app in `dist/spa`)_

3. **Configure as a single-page app (rewrite all urls to /index.html)?**

   ```
   Yes
   ```

4. **Set up automatic builds and deploys with GitHub?**

   ```
   No
   ```

   _(Puoi configurarlo dopo se vuoi CI/CD automatico)_

5. **File dist/spa/index.html already exists. Overwrite?**
   ```
   No
   ```

---

## 📦 STEP 4: Builda l'Applicazione

```bash
# Build di produzione ottimizzata con Yarn (OBBLIGATORIO)
yarn build

# Output: dist/spa/
# Dimensione finale: ~2-5 MB (minificato + compresso)
```

### **Cosa fa il build:**

- ✅ Minifica JavaScript/CSS
- ✅ Ottimizza immagini
- ✅ Tree-shaking (rimuove codice inutilizzato)
- ✅ Code splitting (caricamento lazy)
- ✅ Genera service worker (PWA)

---

## 🚀 STEP 5: Deploy su Firebase

```bash
# Deploy su Firebase Hosting
firebase deploy

# Output:
# ✔ Deploy complete!
#
# Hosting URL: https://medical-utility-pro.web.app
# Project Console: https://console.firebase.google.com/project/medical-utility-pro
```

### **URL Generati Automaticamente:**

- **URL Principale:** `https://medical-utility.web.app`
- **URL Alternativo:** `https://medical-utility.firebaseapp.com`
- **Entrambi funzionano con HTTPS automatico!**

---

## 🌐 STEP 6: Dominio Personalizzato (Opzionale)

### Se vuoi usare tuo dominio (es. `medicalutility.com`):

```bash
# 1. Aggiungi dominio custom
firebase hosting:channel:deploy production

# 2. Nel Firebase Console:
# - Vai su Hosting → Add custom domain
# - Inserisci: medicalutility.com
# - Segui istruzioni per configurare DNS
```

### **Configurazione DNS:**

```
Tipo   Nome    Valore
A      @       151.101.1.195
A      @       151.101.65.195
CNAME  www     medical-utility.web.app
```

**SSL Certificato:** Automatico entro 24 ore!

---

## 📁 FILE DI CONFIGURAZIONE: firebase.json

Firebase crea automaticamente `firebase.json`. Ecco la configurazione ottimale per Quasar:

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
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp|ico)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "**/*.@(js|css)",
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

---

## 🔄 WORKFLOW COMPLETO DI AGGIORNAMENTO

```bash
# 1. Modifica codice
# ... fai modifiche in src/ ...

# 2. Testa localmente
yarn dev

# 3. Builda per produzione
yarn build

# 4. Testa build locale
yarn preview
# Oppure:
firebase serve

# 5. Deploy su Firebase
firebase deploy

# 6. Verifica su URL live
# Apri: https://medical-utility-pro.web.app
```

---

## 🎯 COMANDI FIREBASE UTILI

```bash
# Deploy completo
firebase deploy

# Deploy solo hosting (più veloce)
firebase deploy --only hosting

# Anteprima deploy (channel temporaneo)
firebase hosting:channel:deploy preview
# URL: https://medical-utility-pro--preview-xxxxx.web.app

# Testa localmente con Firebase emulator
firebase serve
# URL: http://localhost:5000

# Rollback a versione precedente
firebase hosting:clone SOURCE_SITE_ID:SOURCE_CHANNEL_ID TARGET_SITE_ID:live

# Lista tutte le versioni deploy
firebase hosting:releases:list

# Elimina vecchie versioni
firebase hosting:releases:delete VERSION_ID
```

---

## 📊 MONITORAGGIO E ANALYTICS

### Firebase Console:

```
https://console.firebase.google.com/project/medical-utility-pro/hosting
```

### Statistiche Disponibili:

- ✅ **Traffico totale** (requests/giorno)
- ✅ **Banda utilizzata** (GB)
- ✅ **Errori 404/500**
- ✅ **Tempi di caricamento**
- ✅ **Distribuzione geografica utenti**

### Aggiungi Google Analytics (opzionale):

```bash
firebase init analytics

# Tracking automatico:
# - Pageviews
# - User engagement
# - Conversioni
```

---

## 🔐 SICUREZZA E BEST PRACTICES

### 1. **Environment Variables per API Keys:**

```bash
# Crea .env.production
cat > .env.production << 'EOF'
VITE_API_URL=https://api.yourdomain.com
VITE_FIREBASE_API_KEY=your-key-here
EOF

# NON committare .env files!
echo ".env.production" >> .gitignore
```

### 2. **Firebase Security Rules:**

Se usi Firestore/Realtime Database:

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /drugs/{drugId} {
      allow read: if true;  // Pubblico
      allow write: if request.auth != null;  // Solo autenticati
    }
  }
}
```

### 3. **CORS Headers:**

Già configurato in `firebase.json` sopra!

---

## 🌍 PRESTAZIONI E CDN

### Firebase Hosting include:

- ✅ **CDN Globale:** 100+ edge locations
- ✅ **HTTP/2:** Multiplexing automatico
- ✅ **Brotli Compression:** 20% più efficiente di gzip
- ✅ **SSL/TLS 1.3:** Encryption automatica
- ✅ **IPv6 Support**

### Tempi di Caricamento Attesi:

- **First Contentful Paint:** < 1s
- **Time to Interactive:** < 3s
- **Lighthouse Score:** 90-100

---

## 🐛 TROUBLESHOOTING

### **Errore: "Firebase not found"**

```bash
npm install -g firebase-tools
firebase login
```

### **Errore: "dist/spa directory not found"**

```bash
yarn build
# Verifica che esista: dist/spa/index.html
```

### **Errore 404 dopo deploy**

```bash
# Verifica firebase.json rewrites
# Deve avere: "destination": "/index.html"
firebase deploy --only hosting
```

### **Certificato SSL non attivo**

- Attendi 24 ore dopo aver configurato dominio custom
- Verifica DNS con: `dig yourdomain.com`

### **Cache non aggiornato**

```bash
# Hard refresh browser: Ctrl+Shift+R (Linux/Windows) o Cmd+Shift+R (Mac)
# Oppure cancella cache browser

# Oppure forza nuovo deploy con versione:
firebase deploy --only hosting -m "Force cache bust"
```

---

## 💡 CONFIGURAZIONE AVANZATA

### **1. Multiple Environments (Staging + Production):**

```bash
# Crea progetto staging
firebase use --add
# Seleziona: medical-utility-pro-staging

# Deploy su staging
firebase use staging
firebase deploy

# Deploy su production
firebase use production
firebase deploy
```

### **2. CI/CD con GitHub Actions:**

```yaml
# .github/workflows/firebase-deploy.yml
name: Deploy to Firebase Hosting

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - run: yarn install --frozen-lockfile
      - run: yarn build

      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: medical-utility-pro
```

### **3. Preview Channels (per Pull Requests):**

```bash
# Crea preview per PR #123
firebase hosting:channel:deploy pr-123

# URL temporaneo: https://medical-utility-pro--pr-123-xxxxx.web.app

# Dopo merge, cancella channel:
firebase hosting:channel:delete pr-123
```

---

## 📈 LIMITI PIANO GRATUITO (Spark)

| Risorsa          | Limite Gratuito            | Note                      |
| ---------------- | -------------------------- | ------------------------- |
| Storage          | 10 GB                      | Files hostati             |
| Banda            | 360 MB/giorno (~10GB/mese) | Download totali           |
| Domini custom    | 1 dominio                  | Illimitati su piano Blaze |
| Build simultanei | 1                          | Illimitati su piano Blaze |
| Progetti         | Illimitati                 | ✅                        |
| SSL/HTTPS        | ✅ Gratuito                | Automatico                |

### **Stima per Medical Utility Pro:**

- **App size:** 3 MB
- **100 utenti/giorno:** 300 MB/giorno
- **✅ Ben sotto i limiti gratuiti!**

---

## ✅ CHECKLIST FINALE

Prima del deploy:

- [ ] Build completato senza errori (`yarn build`)
- [ ] Testato localmente (`yarn preview`)
- [ ] File `.env.production` configurato (se necessario)
- [ ] `firebase.json` contiene configurazione corretta
- [ ] Service Worker attivo (PWA)
- [ ] Google Analytics configurato (opzionale)
- [ ] Dominio custom configurato (opzionale)
- [ ] DNS verificato (se dominio custom)
- [ ] README.md aggiornato con nuovo URL

---

## 🎯 RISULTATO FINALE

Dopo il deploy avrai:

✅ **URL Live:** `https://medical-utility-pro.web.app`  
✅ **HTTPS Automatico** con certificato SSL  
✅ **CDN Globale** con 100+ locations  
✅ **PWA Installabile** su mobile/desktop  
✅ **Offline Ready** con service worker  
✅ **SEO Friendly** con pre-rendering  
✅ **100% GRATUITO** per sempre (piano Spark)

---

## 📞 SUPPORTO

- **Firebase Docs:** https://firebase.google.com/docs/hosting
- **Community:** https://stackoverflow.com/questions/tagged/firebase-hosting
- **Status:** https://status.firebase.google.com/

---

**🎉 Pronto per il deploy? Segui gli step qui sopra!**
