# 📐 CODING STANDARDS - PROJECT TEMPLATE

> **Template standard di codifica - Copia e personalizza per nuovi progetti**

## 🎯 OBIETTIVO

Questo documento definisce gli standard di codifica obbligatori per garantire:
- ✅ **Consistenza** - Codice uniforme in tutto il progetto
- ✅ **Manutenibilità** - Facile da leggere e modificare
- ✅ **Qualità** - Best practices applicate ovunque
- ✅ **Scalabilità** - Architettura che cresce senza collassare

---

## 🛠️ TECNOLOGIE BASE (DA PERSONALIZZARE)

**[INSERIRE STACK TECNOLOGICO]**

Esempio:
- **Language:** TypeScript 5.0+ (strict mode)
- **Framework:** Vue 3 + Quasar 2
- **Package Manager:** Yarn 1.22+ (mai npm!)
- **Build Tool:** Vite 4+
- **Linting:** ESLint + Prettier
- **Testing:** Vitest + Cypress

---

## 📝 CONVENZIONI NAMING

### **1️⃣ Files & Folders**

```
✅ CORRETTO:
- PascalCase per componenti Vue: UserProfile.vue
- kebab-case per utilities: user-service.ts
- kebab-case per cartelle: user-management/
- UPPERCASE per constants: API_ENDPOINTS.ts

❌ SBAGLIATO:
- snake_case: user_profile.vue
- camelCase per componenti: userProfile.vue
- Spazi: user profile.vue
```

**Regole:**
- Componenti Vue → `PascalCase.vue`
- TypeScript utilities → `kebab-case.ts`
- Test files → `*.spec.ts` o `*.test.ts`
- Cartelle → `kebab-case/`
- Constants → `SCREAMING_SNAKE_CASE.ts`

### **2️⃣ Variables & Functions**

```typescript
// ✅ CORRETTO - camelCase
const userName = 'John';
let totalCount = 0;
function calculateTotal(): number { /* ... */ }

// ✅ CORRETTO - Nomi descrittivi
const activeUserCount = 10; // Chiaro cosa rappresenta
function getUsersByRole(role: string): User[] { /* ... */ }

// ❌ SBAGLIATO - Abbreviazioni oscure
const usr = 'John'; // Cosa è usr?
let cnt = 0; // Count? Counter?
function calc(): number { /* ... */ } // Calcola cosa?

// ❌ SBAGLIATO - snake_case in TypeScript
const user_name = 'John';
function calculate_total(): number { /* ... */ }
```

**Regole:**
- Variabili → `camelCase`
- Funzioni → `camelCase`
- Costanti globali → `SCREAMING_SNAKE_CASE`
- Classi → `PascalCase`
- Interfaces → `PascalCase` con prefisso `I` opzionale
- Types → `PascalCase`
- Enum → `PascalCase`, values `SCREAMING_SNAKE_CASE`

### **3️⃣ Componenti Vue**

```typescript
// ✅ CORRETTO - PascalCase
import UserProfile from 'src/components/UserProfile.vue';
import DataTable from 'src/components/DataTable.vue';

// ✅ CORRETTO - Multi-word component names
const UserList = defineComponent({ /* ... */ });
const ProductCard = defineComponent({ /* ... */ });

// ❌ SBAGLIATO - Single word (evitare conflitti HTML)
const User = defineComponent({ /* ... */ });
const Card = defineComponent({ /* ... */ });
```

---

## 🏗️ STRUTTURA COMPONENTI VUE

### **Template Standard:**

```vue
<script setup lang="ts">
/**
 * [NOME COMPONENTE] - [DESCRIZIONE BREVE]
 *
 * @component
 * @description [Descrizione dettagliata cosa fa il componente]
 *
 * @example
 * <UserProfile :userId="123" @update="handleUpdate" />
 */

// 1. Imports (ordine alfabetico per categoria)
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import type { User } from 'src/types';

// 2. Props & Emits (TypeScript interfaces)
interface Props {
  /** ID utente da visualizzare */
  userId: number;
  /** Mostra dettagli completi */
  showDetails?: boolean;
}

interface Emits {
  /** Emesso quando utente viene aggiornato */
  (e: 'update', user: User): void;
  /** Emesso quando componente è pronto */
  (e: 'ready'): void;
}

const props = withDefaults(defineProps<Props>(), {
  showDetails: true,
});

const emit = defineEmits<Emits>();

// 3. Composables
const router = useRouter();

// 4. Reactive State
const user = ref<User | null>(null);
const isLoading = ref(false);

// 5. Computed Properties
const fullName = computed(() => {
  if (!user.value) return '';
  return `${user.value.firstName} ${user.value.lastName}`;
});

// 6. Methods
async function loadUser(): Promise<void> {
  isLoading.value = true;
  try {
    // Fetch user logic
    const data = await fetchUser(props.userId);
    user.value = data;
    emit('ready');
  } catch (error) {
    console.error('Failed to load user:', error);
  } finally {
    isLoading.value = false;
  }
}

function handleUpdate(): void {
  if (user.value) {
    emit('update', user.value);
  }
}

// 7. Lifecycle Hooks
onMounted(() => {
  void loadUser();
});
</script>

<template>
  <div class="user-profile">
    <!-- Loading State -->
    <q-spinner v-if="isLoading" color="primary" size="50px" />

    <!-- Content -->
    <div v-else-if="user" class="user-content">
      <h2>{{ fullName }}</h2>

      <!-- Details (conditional) -->
      <div v-if="showDetails" class="user-details">
        <p>Email: {{ user.email }}</p>
        <p>Role: {{ user.role }}</p>
      </div>

      <!-- Actions -->
      <q-btn label="Update" @click="handleUpdate" />
    </div>

    <!-- Error State -->
    <div v-else class="user-error">
      User not found
    </div>
  </div>
</template>

<style scoped lang="scss">
.user-profile {
  padding: 16px;

  .user-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .user-details {
    background: var(--q-color-grey-1);
    padding: 12px;
    border-radius: 8px;
  }
}
</style>
```

**Ordine sezioni obbligatorio:**
1. JSDoc header
2. Imports (Vue, Router, Types)
3. Props & Emits (TypeScript)
4. Composables
5. Reactive State
6. Computed Properties
7. Methods
8. Lifecycle Hooks

---

## 📐 TYPESCRIPT BEST PRACTICES

### **1️⃣ Strict Mode SEMPRE Attivo**

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### **2️⃣ Type Annotations Esplicite**

```typescript
// ✅ CORRETTO - Type esplicito
const count: number = 0;
const users: User[] = [];
function getUser(id: number): Promise<User> { /* ... */ }

// ⚠️ ACCETTABILE - Type inference ovvio
const name = 'John'; // string inferito
const total = 100 + 200; // number inferito

// ❌ SBAGLIATO - Type any
const data: any = fetchData(); // Evitare any!
function process(input: any): any { /* ... */ }
```

### **3️⃣ Interfaces vs Types**

```typescript
// ✅ CORRETTO - Interface per oggetti estendibili
interface User {
  id: number;
  name: string;
  email: string;
}

interface AdminUser extends User {
  permissions: string[];
}

// ✅ CORRETTO - Type per union/intersections
type Status = 'active' | 'inactive' | 'pending';
type Result<T> = { success: true; data: T } | { success: false; error: string };

// ✅ CORRETTO - Type per funzioni
type Calculator = (a: number, b: number) => number;
```

**Regola:**
- **Interface** → Oggetti che possono essere estesi
- **Type** → Union types, intersection, funzioni, tuple

### **4️⃣ Generics per Riusabilità**

```typescript
// ✅ CORRETTO - Generic function
function getById<T>(items: T[], id: number): T | undefined {
  return items.find(item => item.id === id);
}

// ✅ CORRETTO - Generic interface
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// Usage
const userResponse: ApiResponse<User> = await fetchUser(123);
const productResponse: ApiResponse<Product> = await fetchProduct(456);
```

---

## 🧪 TESTING STANDARDS

### **1️⃣ Struttura Test File**

```typescript
/**
 * Test suite per UserService
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { UserService } from 'src/services/UserService';

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    service = new UserService();
  });

  afterEach(() => {
    // Cleanup
  });

  describe('getUser', () => {
    it('should return user when ID exists', async () => {
      // Arrange
      const userId = 123;

      // Act
      const user = await service.getUser(userId);

      // Assert
      expect(user).toBeDefined();
      expect(user.id).toBe(userId);
    });

    it('should throw error when user not found', async () => {
      // Arrange
      const invalidId = 999;

      // Act & Assert
      await expect(service.getUser(invalidId)).rejects.toThrow('User not found');
    });
  });
});
```

**Pattern Arrange-Act-Assert (AAA):**
1. **Arrange** - Setup test data
2. **Act** - Execute function
3. **Assert** - Verify results

### **2️⃣ Test Coverage Target**

**[INSERIRE TARGET COVERAGE]**

Esempio:
- ✅ **Critical Logic:** 90%+ coverage
- ✅ **Business Logic:** 80%+ coverage
- ✅ **UI Components:** 60%+ coverage
- ✅ **Utilities:** 100% coverage

---

## 📊 DOCUMENTAZIONE JSDoc

### **Funzioni Pubbliche SEMPRE Documentate:**

```typescript
/**
 * Calcola il Body Mass Index (BMI) di un paziente
 *
 * Formula: BMI = peso (kg) / altezza (m)²
 *
 * @param weight - Peso paziente in kg (0.1-500)
 * @param height - Altezza paziente in cm (50-300)
 * @returns BMI arrotondato a 1 decimale
 * @throws {ValidationError} Se parametri fuori range
 *
 * @example
 * const bmi = calculateBMI(70, 175); // 22.9
 *
 * @see https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight
 */
export function calculateBMI(weight: number, height: number): number {
  // Validation
  if (weight < 0.1 || weight > 500) {
    throw new ValidationError('Weight must be 0.1-500 kg');
  }
  if (height < 50 || height > 300) {
    throw new ValidationError('Height must be 50-300 cm');
  }

  // Calculation
  const heightM = height / 100;
  const bmi = weight / heightM ** 2;

  return Math.round(bmi * 10) / 10;
}
```

**Elementi obbligatori JSDoc:**
- `@param` - Ogni parametro con descrizione + range
- `@returns` - Cosa ritorna la funzione
- `@throws` - Eccezioni possibili
- `@example` - Esempio uso concreto
- `@see` - Link documentazione esterna (opzionale)

---

## 🎨 CSS/SCSS STANDARDS

### **1️⃣ BEM Naming Convention**

```scss
// ✅ CORRETTO - BEM (Block Element Modifier)
.user-card {
  padding: 16px;

  &__header {
    font-weight: bold;
  }

  &__content {
    margin-top: 12px;
  }

  &--highlighted {
    background: yellow;
  }
}

// Compilato come:
// .user-card { }
// .user-card__header { }
// .user-card__content { }
// .user-card--highlighted { }
```

**Pattern BEM:**
- **Block** - Entità standalone (`.user-card`)
- **Element** - Parte del block (`.user-card__header`)
- **Modifier** - Variante del block (`.user-card--highlighted`)

### **2️⃣ Variabili CSS Custom Properties**

```scss
// ✅ CORRETTO - Usa CSS variables
:root {
  --color-primary: #1976d2;
  --color-secondary: #26a69a;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
}

.button {
  background: var(--color-primary);
  padding: var(--spacing-md);
}

// ❌ SBAGLIATO - Valori hardcoded
.button {
  background: #1976d2;
  padding: 16px;
}
```

### **3️⃣ Responsive Design**

```scss
// ✅ CORRETTO - Mobile-first breakpoints
.container {
  width: 100%;

  // Tablet
  @media (min-width: 768px) {
    width: 750px;
  }

  // Desktop
  @media (min-width: 1024px) {
    width: 960px;
  }

  // Large Desktop
  @media (min-width: 1440px) {
    width: 1200px;
  }
}
```

---

## 🔒 SECURITY BEST PRACTICES

### **1️⃣ Input Validation**

```typescript
// ✅ CORRETTO - Validazione completa
function processUserInput(input: string): string {
  // 1. Sanitize HTML
  const sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // 2. Validate length
  if (sanitized.length > 1000) {
    throw new ValidationError('Input too long');
  }

  // 3. Validate pattern
  const safePattern = /^[a-zA-Z0-9\s\-_.,!?]+$/;
  if (!safePattern.test(sanitized)) {
    throw new ValidationError('Invalid characters');
  }

  return sanitized;
}

// ❌ SBAGLIATO - No validation
function processUserInput(input: string): string {
  return input; // XSS vulnerability!
}
```

### **2️⃣ Secrets Management**

```typescript
// ✅ CORRETTO - Environment variables
const API_KEY = import.meta.env.VITE_API_KEY;
const DB_URL = import.meta.env.VITE_DATABASE_URL;

if (!API_KEY) {
  throw new Error('Missing VITE_API_KEY environment variable');
}

// ❌ SBAGLIATO - Hardcoded secrets
const API_KEY = 'sk-1234567890abcdef'; // MAI FARE QUESTO!
```

### **3️⃣ Error Handling Sicuro**

```typescript
// ✅ CORRETTO - Error handling sicuro
try {
  await sensitiveOperation();
} catch (error) {
  // Log error senza esporre dettagli
  logger.error('Operation failed', { operation: 'sensitiveOperation' });

  // Mostra messaggio generico all'utente
  throw new Error('Operation failed. Please try again.');
}

// ❌ SBAGLIATO - Espone stack trace
try {
  await sensitiveOperation();
} catch (error) {
  // Espone dettagli interni!
  alert(`Error: ${error.message}\n${error.stack}`);
}
```

---

## 📦 GIT COMMIT STANDARDS

### **Conventional Commits**

```bash
# ✅ CORRETTO - Conventional Commits
feat(user): add user profile component
fix(api): handle 404 error in getUserById
docs(readme): update installation instructions
style(button): fix button padding
refactor(auth): simplify login logic
test(user): add tests for UserService
chore(deps): update Vue to 3.3.0

# ❌ SBAGLIATO - Commit messages generici
git commit -m "fix"
git commit -m "update"
git commit -m "changes"
```

**Format:**
```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Types:**
- `feat` - Nuova feature
- `fix` - Bug fix
- `docs` - Documentazione
- `style` - Formattazione (no logic changes)
- `refactor` - Refactoring
- `test` - Test
- `chore` - Manutenzione (deps, build, etc.)

---

## 🚀 PERFORMANCE GUIDELINES

### **1️⃣ Lazy Loading**

```typescript
// ✅ CORRETTO - Lazy load routes
const routes = [
  {
    path: '/user',
    component: () => import('src/pages/UserPage.vue'),
  },
  {
    path: '/admin',
    component: () => import('src/pages/AdminPage.vue'),
  },
];

// ❌ SBAGLIATO - Import tutto all'avvio
import UserPage from 'src/pages/UserPage.vue';
import AdminPage from 'src/pages/AdminPage.vue';
```

### **2️⃣ Computed vs Methods**

```vue
<script setup lang="ts">
// ✅ CORRETTO - Computed (cached)
const fullName = computed(() => {
  return `${firstName.value} ${lastName.value}`;
});

// ❌ SBAGLIATO - Method (recalcolato ogni render)
function getFullName(): string {
  return `${firstName.value} ${lastName.value}`;
}
</script>

<template>
  <!-- ✅ Computed cached -->
  <p>{{ fullName }}</p>

  <!-- ❌ Method chiamato ogni volta -->
  <p>{{ getFullName() }}</p>
</template>
```

---

## 📋 CODE REVIEW CHECKLIST

**Prima di merge:**

- [ ] ✅ TypeScript strict mode (no errors)
- [ ] ✅ ESLint passed (yarn lint)
- [ ] ✅ Tests passed (yarn test)
- [ ] ✅ Test coverage > **[TARGET]%**
- [ ] ✅ JSDoc su funzioni pubbliche
- [ ] ✅ No `console.log()` dimenticati
- [ ] ✅ No secrets hardcoded
- [ ] ✅ Responsive tested (mobile/tablet/desktop)
- [ ] ✅ Error handling completo
- [ ] ✅ Commit messages Conventional Commits
- [ ] ✅ File size < 500 righe (se > 500 → split)

---

## 📚 RIFERIMENTI

**[INSERIRE LINK RISORSE]**

Esempio:
- [Vue.js Style Guide](https://vuejs.org/style-guide/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [BEM Methodology](https://getbem.com/)

---

**TEMPLATE VERSION:** 1.0  
**CREATED:** [DATA]  
**LAST UPDATED:** [DATA]  
**PROJECT:** [NOME PROGETTO]

---

## 📝 ISTRUZIONI USO TEMPLATE

1. **Copia** questo file nel nuovo progetto come `CODING_STANDARDS.md`
2. **Personalizza** sezioni tra `[PARENTESI QUADRE]`:
   - Stack tecnologico
   - Target test coverage
   - Breakpoints responsive
   - Link riferimenti
3. **Rimuovi** sezioni non applicabili
4. **Aggiungi** standard specifici del tuo dominio
5. **Commit** su Git
6. **Applica** standard in code review

**Sezioni da personalizzare:**
- ✅ Tecnologie base
- ✅ Target test coverage
- ✅ Breakpoints CSS
- ✅ Link riferimenti
- ✅ Code review checklist target

**Sezioni universali (mantieni sempre):**
- ✅ Convenzioni naming
- ✅ TypeScript best practices
- ✅ Security guidelines
- ✅ Git commit standards
- ✅ JSDoc documentation
