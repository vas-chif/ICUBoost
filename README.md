# 🏥 ICUBoost - Intensive Care Medical Calculators

![ICUBoost Logo](src/assets/icon_logo.png)

> **Professional medical calculators for Intensive Care Units**  
> Strumenti medici professionali per Terapia Intensiva

[![Vue 3](https://img.shields.io/badge/Vue-3.5.22-4FC08D?logo=vue.js)](https://vuejs.org/)
[![Quasar](https://img.shields.io/badge/Quasar-2.16.0-1976D2?logo=quasar)](https://quasar.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-Private-red)]()

---

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Calculators](#-calculators)
- [Languages](#-languages)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Development](#-development)

---

## 🎯 About

**ICUBoost** is a modern web/mobile application designed to improve clinical practice in Intensive Care Units. It provides scientifically validated medical calculators with:

- ✅ **Accurate formulas** based on medical literature
- ✅ **Input validation** with physiological range checks
- ✅ **Multilingual support** (10 languages)
- ✅ **Responsive design** (mobile-first)
- ✅ **Offline capable** (PWA ready)
- ✅ **Free & open for medical professionals**

---

## ✨ Features

### 🌍 **10 Languages Support**

- 🇬🇧 English
- 🇮🇹 Italiano
- 🇷🇺 Русский
- 🇫🇷 Français
- 🇷🇴 Română
- 🇩🇪 Deutsch
- 🇪🇸 Español
- 🇵🇹 Português
- 🇯🇵 日本語
- 🇸🇦 العربية

### 📱 **Responsive UI**

- Mobile: 2-column grid
- Tablet: 3-4 column grid
- Desktop: 4-6 column grid
- Full-screen calculator dialogs

### 🎨 **Medical-Themed Design**

- Color-coded results (normal/warning/critical)
- Intuitive icons for each parameter
- Clean, professional interface

---

## 🧮 Calculators

### 1️⃣ **Mechanical Power (MP)**

**Purpose:** Assess lung injury risk during mechanical ventilation

**Formula:**

```
MP = 0.098 × RR × VTe × (Ppeak - 0.5 × (Pplateau - PEEP))
```

**Parameters:**

- RR: Respiratory Rate (breaths/min)
- VTe: Expired Tidal Volume (liters)
- Ppeak: Peak Pressure (cmH₂O)
- Pplateau: Plateau Pressure (cmH₂O)
- PEEP: Positive End-Expiratory Pressure (cmH₂O)

**Result Interpretation:**

- ✅ **Normal:** < 12 J/min
- ⚠️ **Caution:** 12-17 J/min
- ⛔ **Critical:** > 17 J/min

**Reference:** Gattinoni L, et al. _Intensive Care Med._ 2016;42(12):1960-1969.

---

### 2️⃣ **Respiratory Quotient (QR)**

**Purpose:** Evaluate metabolic state and gas exchange efficiency

**Formula:**

```
QR = (PvCO₂ - PaCO₂) / ((HB × 1.36 × (SaO₂ - SvO₂)) / 100 + (PaO₂ - PvO₂) × 0.003)
```

**Parameters:**

- PvCO₂: Venous CO₂ (mmHg)
- PaCO₂: Arterial CO₂ (mmHg)
- HB: Hemoglobin (g/dL)
- SaO₂: Arterial O₂ saturation (%)
- SvO₂: Venous O₂ saturation (%)
- PaO₂: Arterial O₂ partial pressure (mmHg)
- PvO₂: Venous O₂ partial pressure (mmHg)

**Result Interpretation:**

- ✅ **Normal range:** 0.7 - 1.0 ml-O₂/dL

---

## 🚀 Quick Start

### Prerequisites

- **Node.js:** 20+ (LTS recommended)
- **Yarn:** 1.22+ (REQUIRED - do NOT use npm!)

### Installation

```bash
# Clone repository
git clone https://github.com/vas-chif/icuboost.git
cd icuboost

# Install dependencies (MUST use yarn)
yarn install

# Start development server
yarn dev
```

App will open at **http://localhost:9001/**

---

## 📁 Project Structure

```
icuboost/
├── src/
│   ├── components/
│   │   ├── MechanicalPowerCalculator.vue
│   │   └── RespiratoryQuotientCalculator.vue
│   ├── i18n/
│   │   ├── en-US/    🇬🇧
│   │   ├── it-IT/    🇮🇹
│   │   ├── ru-RU/    🇷🇺
│   │   ├── fr-FR/    🇫🇷
│   │   ├── ro-RO/    🇷🇴
│   │   ├── de-DE/    🇩🇪
│   │   ├── es-ES/    🇪🇸
│   │   ├── pt-PT/    🇵🇹
│   │   ├── ja-JP/    🇯🇵
│   │   └── ar-SA/    🇸🇦
│   ├── layouts/
│   │   └── MainLayout.vue
│   ├── pages/
│   │   └── IndexPage.vue
│   └── css/
│       └── quasar.variables.scss
├── CODING_STANDARDS.md
├── COPILOT_RULES.md
├── STATO_PROGETTO.md
└── README.md
```

---

## 🛠️ Development

### Commands

```bash
# Development server (hot-reload)
yarn dev

# Build for production
yarn build

# Lint code
yarn lint

# Format code (Prettier)
yarn format
```

### Tech Stack

- **Framework:** Vue 3.5 (Composition API)
- **UI Framework:** Quasar 2.16
- **Language:** TypeScript 5.9 (strict mode)
- **i18n:** vue-i18n 11.0
- **Build Tool:** Vite
- **Package Manager:** Yarn (OBBLIGATORIO)

### Coding Standards

See [CODING_STANDARDS.md](CODING_STANDARDS.md) for detailed guidelines:

- TypeScript strict mode
- JSDoc for all public functions
- BEM CSS naming
- Mobile-first responsive design
- Security best practices

---

## 🌐 Deployment

### Firebase Hosting (Recommended)

```bash
# Build production
yarn build

# Deploy to Firebase
firebase deploy --only hosting
```

See [FIREBASE_DEPLOY_GUIDE.md](FIREBASE_DEPLOY_GUIDE.md) for detailed instructions.

---

## 📝 Contributing

### Adding New Calculators

1. Create component in `src/components/`
2. Add translations in all 10 `src/i18n/*/index.ts` files
3. Add card to `IndexPage.vue`
4. Add route to drawer menu in `MainLayout.vue`
5. Update documentation

---

## 🔒 Security

- ✅ All inputs validated against physiological ranges
- ✅ No hardcoded credentials
- ✅ No PHI (Protected Health Information) stored
- ✅ HTTPS enforced in production

---

## 📄 License

**Private** - Non-commercial use only  
Created for medical professionals with **zero cost** objective.

---

## 👨‍⚕️ Author

**Vasile Chifeac**  
Email: vas-chif@users.noreply.github.com  
Role: Full-Stack Developer + Medical Domain Expert

---

## 🗺️ Roadmap

### Future Calculators

- [ ] APACHE II Score
- [ ] SOFA Score
- [ ] Glasgow Coma Scale
- [ ] Shock Index
- [ ] P/F Ratio
- [ ] Driving Pressure
- [ ] And many more...

---

**Made with ❤️ for ICU healthcare professionals worldwide**
