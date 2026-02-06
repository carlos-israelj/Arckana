# Arckana - Explicación Completa del Proyecto

## 📖 Índice

1. [¿Qué es Arckana?](#qué-es-arckana)
2. [El Problema que Resuelve](#el-problema-que-resuelve)
3. [¿Cómo Funciona?](#cómo-funciona)
4. [Componentes del Sistema](#componentes-del-sistema)
5. [Flujo Completo Paso a Paso](#flujo-completo-paso-a-paso)
6. [Ejemplo del Mundo Real](#ejemplo-del-mundo-real)
7. [Tecnologías Utilizadas](#tecnologías-utilizadas)
8. [Por Qué es Importante](#por-qué-es-importante)

---

## ¿Qué es Arckana?

**Arckana es un sistema para distribuir dividendos de forma confidencial y eficiente.**

Imagina que tienes un fondo de inversión tokenizado (como BUIDL de BlackRock) que genera ganancias cada mes. Necesitas distribuir esas ganancias a todos los holders del token, **pero sin revelar cuántos tokens tiene cada persona**.

**Arckana resuelve exactamente eso.**

---

## El Problema que Resuelve

### Problema Tradicional

Cuando distribuyes dividendos en blockchain normalmente:

1. **Todos pueden ver cuántos tokens tienes** 👁️
   - Tu balance es público en la blockchain
   - Cualquiera puede ver tus inversiones

2. **Es muy costoso en gas** 💸
   - Si hay 10,000 holders, necesitas 10,000 transacciones
   - Cada transacción cuesta gas fees

3. **No es escalable** 📈
   - Más holders = más costos y más tiempo

### Solución de Arckana

1. **Privacidad Total** 🔒
   - Tu balance está encriptado
   - Solo tú sabes cuánto tienes
   - Los cálculos se hacen en un TEE (ambiente confidencial)

2. **Gas Eficiente** ⚡
   - Una sola transacción para publicar la distribución
   - Los holders reclaman individualmente sin que el admin pague gas

3. **Escalable** 🚀
   - 10 holders o 10,000 holders = mismo costo
   - Usa Merkle trees para verificación eficiente

---

## ¿Cómo Funciona?

### Analogía Simple

Piensa en Arckana como un **sistema de lotería privada**:

1. **Tú compras boletos** (tienes tokens de Arckana)
2. **Guardas tus boletos en un sobre cerrado** (encriptas tu balance)
3. **Das permiso al juez** para que vea tus boletos dentro del sobre (Grant Access al TEE)
4. **El juez cuenta todos los boletos** dentro de una caja fuerte especial donde nadie puede ver (TEE)
5. **El juez publica solo el resultado final** (Merkle root en blockchain)
6. **Tú puedes reclamar tu premio** con una prueba matemática (Merkle proof)

**Lo importante**: Nadie excepto el juez (TEE) sabe cuántos boletos tenías, ¡pero todos pueden verificar que el resultado es correcto!

---

## Componentes del Sistema

### 1. Frontend (La Interfaz Web)
**Ubicación**: `frontend/`
**URL**: https://arckana.lat/

**Qué hace**:
- Conectas tu wallet (MetaMask)
- Encriptas tu balance de tokens
- Autorizas el procesamiento
- Reclamas tus dividendos

**Tabs**:
- 🔐 **Tab 1 - Protect Balance**: Encripta tu balance
- 📊 **Tab 2 - Distribution**: Ve el estado de distribuciones
- 💰 **Tab 3 - Claim**: Reclama tus dividendos
- 🔧 **Tab 4 - Admin**: Gestiona distribuciones (solo admin)

### 2. Smart Contracts (La Lógica en Blockchain)
**Ubicación**: `contracts/src/`
**Blockchain**: Arbitrum Sepolia (testnet)

**Contratos principales**:

1. **ArckanaToken** (`0xaF7B...`)
   - El token que representa tu inversión
   - Similar a acciones de un fondo

2. **PaymentToken** (`0x71E3...`)
   - El token usado para pagar dividendos
   - Similar a USDC (dólares digitales)

3. **DividendPool** (`0xfD0b...`)
   - Gestiona las distribuciones
   - Verifica que puedas reclamar
   - Usa Merkle proofs para validación

4. **ArckanaPaymaster** (`0x648B...`)
   - Paga el gas por ti cuando reclamas
   - Hace que reclamar sea "gratis" para el usuario

### 3. iApp (La Aplicación Confidencial)
**Ubicación**: `iapp/arckana-dividend-calculator/`
**Address**: `0x4dF3...`

**Qué hace**:
- Corre dentro de un TEE (Intel SGX)
- Recibe todos los balances encriptados
- Calcula cuánto le toca a cada holder
- Genera un Merkle tree
- Devuelve solo el Merkle root (resumen matemático)

**Por qué es especial**:
- Nadie puede ver los datos mientras se procesan
- Ni siquiera el servidor que ejecuta el código
- Hardware especial (Intel SGX) garantiza la privacidad

### 4. DataProtector (Sistema de Encriptación)
**Proveedor**: iExec

**Qué hace**:
- Encripta tu balance
- Guarda la clave en un lugar seguro (SMS)
- Solo el TEE puede desencriptar
- Controlas quién puede acceder

---

## Flujo Completo Paso a Paso

### 🎭 Actores

1. **Alice** - Holder con 50% de los tokens
2. **Bob** - Holder con 30% de los tokens
3. **Charlie** - Holder con 20% de los tokens
4. **Admin** - El que gestiona el fondo (tú)

### 📅 Escenario

El fondo generó **$1,000 USD** de ganancias este mes.
Hay que distribuirlo proporcionalmente a todos los holders.

---

### Paso 1️⃣: Holders Protegen sus Balances

**Alice hace esto** (también Bob y Charlie):

1. Va a https://arckana.lat/
2. Conecta su wallet
3. Va a **Tab 1: Protect Balance**
4. Ingresa su balance: `50000` tokens
5. Hace clic en **"🔐 Protect Balance"**

**Qué pasa detrás**:
```
Alice tiene: 50,000 tokens
↓ (encriptación)
DataProtector crea: protected_data_alice = encrypt(50000)
↓
Se guarda en: IPFS (descentralizado)
↓
Se crea contrato: 0xABC... (representa sus datos protegidos)
```

**Resultado**:
- ✅ Balance de Alice está encriptado
- ✅ Nadie puede ver que tiene 50,000 tokens
- ✅ Tiene una dirección única: `0xABC...`

**Bob y Charlie hacen lo mismo**:
- Bob: `30,000 tokens` → `0xDEF...`
- Charlie: `20,000 tokens` → `0xGHI...`

---

### Paso 2️⃣: Holders Autorizan el Procesamiento

**Alice hace esto** (también Bob y Charlie):

1. Ve el botón **"📋 Grant Access for Distribution"**
2. Hace clic
3. Confirma en MetaMask

**Qué pasa detrás**:
```
Alice autoriza:
"El iApp (0x4dF3...) puede leer mis datos protegidos (0xABC...)"

Se crea una "orden de acceso" en iExec:
- Dataset: 0xABC... (datos de Alice)
- App autorizada: 0x4dF3... (el iApp)
- Número de accesos: 1000 (puede usarse múltiples veces)
```

**Resultado**:
- ✅ El iApp puede acceder a los datos de Alice
- ✅ Pero solo dentro del TEE (ambiente seguro)
- ✅ Nadie más puede ver los datos

**Bob y Charlie también autorizan**.

---

### Paso 3️⃣: Admin Ejecuta la Distribución

**El admin (tú) hace esto**:

1. Va a **Tab 4: Admin Panel**
2. Ve que tiene **$10 USDC** en balance

#### **3a. Aprobar USDC**

3. En **Step 0: Approve USDC**
4. Ingresa: `1000` (para distribuir $1,000)
5. Hace clic en **"✅ Approve USDC"**
6. Confirma en MetaMask
7. Espera confirmación ✅

**Qué pasa**:
```
Wallet admin → PaymentToken.approve(DividendPool, 1000 USDC)
↓
DividendPool puede transferir hasta 1000 USDC del admin
```

#### **3b. Calcular Dividendos**

8. Hace clic en **"⚙️ Run iApp Calculation"**

**Qué pasa detrás** (esto es lo más importante):

```
1. iApp recibe 3 datos protegidos:
   - 0xABC... (Alice)
   - 0xDEF... (Bob)
   - 0xGHI... (Charlie)

2. Dentro del TEE (Intel SGX):
   ┌─────────────────────────────────────────┐
   │  TEE - Ambiente Confidencial            │
   ├─────────────────────────────────────────┤
   │  Desencripta:                           │
   │  - Alice: 50,000 tokens                 │
   │  - Bob: 30,000 tokens                   │
   │  - Charlie: 20,000 tokens               │
   │                                         │
   │  Total: 100,000 tokens                  │
   │                                         │
   │  Calcula proporciones:                  │
   │  - Alice: 50% → $500                    │
   │  - Bob: 30% → $300                      │
   │  - Charlie: 20% → $200                  │
   │                                         │
   │  Genera Merkle Tree:                    │
   │                                         │
   │           ROOT                          │
   │         /      \                        │
   │     H(A+B)    H(C)                      │
   │     /   \                               │
   │   H(A) H(B)                             │
   │                                         │
   │  Donde:                                 │
   │  H(A) = hash(Alice, $500)               │
   │  H(B) = hash(Bob, $300)                 │
   │  H(C) = hash(Charlie, $200)             │
   └─────────────────────────────────────────┘

3. iApp devuelve SOLO:
   Merkle Root = 0x8726d8a8753bf06d688bf43d12df27f3fcbb7600553121de93766d9309681494
```

**Resultado**:
- ✅ Merkle root generado: `0x8726...`
- ✅ Nadie vio los balances individuales
- ✅ Solo el TEE procesó los datos

#### **3c. Publicar Distribución**

9. El Merkle root se auto-completa
10. Ingresa monto total: `1000` USDC
11. Hace clic en **"📤 Start Distribution Round"**
12. Confirma en MetaMask

**Qué pasa**:
```
DividendPool.startDistributionRound(
  merkleRoot: 0x8726...,
  totalPool: 1000 USDC
)
↓
1. Transfiere 1000 USDC del admin al DividendPool
2. Guarda merkleRoot para round #1
3. Marca el round como activo
4. Emite evento: RoundStarted(1, 0x8726..., 1000)
```

**Resultado**:
- ✅ Round #1 creado en blockchain
- ✅ $1,000 USDC depositados
- ✅ Holders pueden reclamar

---

### Paso 4️⃣: Holders Reclaman sus Dividendos

**Alice hace esto** (también Bob y Charlie):

1. Va a **Tab 3: Claim Dividend**
2. Ve: "You have 1 unclaimed dividend"
3. Ve su monto: "$500 USDC"
4. Hace clic en **"💰 Claim Dividend"**

**Qué pasa detrás**:

```
1. Frontend calcula Merkle proof para Alice:

   Para probar que Alice tiene derecho a $500:
   Proof = [H(B), H(A+B)]

   Con esto + Merkle root, se puede verificar:
   hash(hash(hash(Alice, 500), H(B)), H(C)) == 0x8726...

2. Frontend llama:
   DividendPool.claimDividend(
     round: 1,
     amount: 500,
     proof: [H(B), H(A+B)]
   )

3. Contrato verifica:
   ✓ El proof es válido con el merkleRoot
   ✓ Alice no ha reclamado antes
   ✓ Hay suficiente balance

4. Transfiere:
   DividendPool → Alice: 500 USDC

5. Marca:
   hasClaimed[round=1][Alice] = true
```

**Resultado**:
- ✅ Alice recibe $500 USDC
- ✅ Bob puede reclamar sus $300 USDC
- ✅ Charlie puede reclamar sus $200 USDC
- ✅ Nadie sabe cuántos tokens tiene cada uno
- ✅ Todo verificable en blockchain

---

## Ejemplo del Mundo Real

### BlackRock BUIDL Token

Imagina que **BlackRock** tiene un token llamado **BUIDL** que representa inversiones en bonos del gobierno.

**Sin Arckana**:
```
Mes 1: BUIDL genera $10 millones en intereses
↓
Problema:
- Tienes 10,000 holders
- Todos pueden ver cuánto BUIDL tienes
- Si eres una ballena con $50M, todos lo saben
- Costo de distribuir: 10,000 transacciones × $0.50 = $5,000
```

**Con Arckana**:
```
Mes 1: BUIDL genera $10 millones en intereses
↓
Solución:
- Holders encriptan sus balances
- iApp calcula en privado
- 1 transacción para publicar Merkle root
- Holders reclaman individualmente
- Costo total: ~$50 (una sola transacción)
- Privacidad: ✅ Nadie sabe tu balance
```

### Caso de Uso Real

**Inversor Institucional**:
```
Tienes: $100M en BUIDL
Problema: No quieres que competidores sepan tu posición
Solución: Encriptas tu balance con Arckana
Resultado: Recibes dividendos sin revelar tu posición
```

---

## Tecnologías Utilizadas

### 1. iExec DataProtector
**Qué hace**: Encriptación y gestión de acceso a datos
**Por qué**: Permite proteger balances sin depender de una entidad central

### 2. iExec TEE (Intel SGX)
**Qué hace**: Computación confidencial
**Por qué**: Procesa datos sensibles sin que nadie pueda verlos

### 3. Merkle Trees
**Qué hace**: Estructura de datos para verificación eficiente
**Por qué**: Permite verificar inclusión sin revelar todo el dataset

### 4. Arbitrum (Layer 2)
**Qué hace**: Blockchain escalable
**Por qué**: Costos bajos de gas fees

### 5. Account Abstraction (ERC-4337)
**Qué hace**: Gasless transactions
**Por qué**: Los holders no pagan gas al reclamar

### 6. Next.js + RainbowKit + Wagmi
**Qué hace**: Framework web moderno para Web3
**Por qué**: Mejor UX para usuarios

---

## Por Qué es Importante

### 1. **Privacidad Financiera**
En el mundo real, no todos saben cuánto dinero tienes en el banco.
En blockchain, **todo es público por defecto**.
Arckana trae privacidad al mundo on-chain.

### 2. **Institucionalización de Crypto**
Para que grandes instituciones (BlackRock, JP Morgan) usen blockchain, necesitan:
- ✅ Privacidad
- ✅ Eficiencia
- ✅ Compliance

Arckana provee las 3.

### 3. **Escalabilidad**
Distribuir a 10 personas vs 10,000 personas debería costar lo mismo.
Con Arckana, así es.

### 4. **Caso de Uso Real**
No es solo "crypto por crypto".
Es resolver un problema real de fondos tokenizados (RWA).

---

## Arquitectura Visual

```
┌─────────────────────────────────────────────────────────────────┐
│                         USUARIOS                                 │
│  (Alice, Bob, Charlie)                                          │
└────────────┬────────────────────────────────────────────────────┘
             │
             │ 1. Protect Balance
             │ 2. Grant Access
             │ 4. Claim Dividends
             ↓
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Next.js)                          │
│  https://arckana.lat/                                           │
│                                                                  │
│  Components:                                                     │
│  - ProtectBalance    → Encripta balances                        │
│  - GrantAccess       → Autoriza iApp                            │
│  - ClaimDividend     → Reclama con Merkle proof                 │
│  - AdminPanel        → Gestiona distribuciones                  │
└────────────┬────────────────────────────────────────────────────┘
             │
             │ Interactúa con
             ↓
┌─────────────────────────────────────────────────────────────────┐
│                    iExec DataProtector                           │
│  - Encripta datos                                               │
│  - Gestiona permisos                                            │
│  - Almacena en IPFS                                             │
└────────────┬────────────────────────────────────────────────────┘
             │
             │ Procesa en
             ↓
┌─────────────────────────────────────────────────────────────────┐
│                  iApp (TEE - Intel SGX)                          │
│  Address: 0x4dF3...                                             │
│                                                                  │
│  1. Recibe datos protegidos                                     │
│  2. Desencripta en ambiente seguro                              │
│  3. Calcula dividendos                                          │
│  4. Genera Merkle tree                                          │
│  5. Devuelve solo Merkle root                                   │
└────────────┬────────────────────────────────────────────────────┘
             │
             │ Publica en
             ↓
┌─────────────────────────────────────────────────────────────────┐
│              SMART CONTRACTS (Arbitrum Sepolia)                  │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │  DividendPool    │  │  PaymentToken    │                    │
│  │  0xfD0b...       │  │  0x71E3...       │                    │
│  │                  │  │                  │                    │
│  │ - startRound()   │  │ - transfer()     │                    │
│  │ - claimDividend()│  │ - approve()      │                    │
│  │ - verifyProof()  │  │                  │                    │
│  └──────────────────┘  └──────────────────┘                    │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │ ArckanaPaymaster │  │  ArckanaToken    │                    │
│  │  0x648B...       │  │  0xaF7B...       │                    │
│  │                  │  │                  │                    │
│  │ - Paga gas       │  │ - balanceOf()    │                    │
│  │   por usuarios   │  │                  │                    │
│  └──────────────────┘  └──────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Glosario de Términos

**TEE (Trusted Execution Environment)**
Ambiente seguro donde el código se ejecuta de forma confidencial. Ni el dueño del servidor puede ver los datos.

**Merkle Tree**
Estructura de datos en árbol donde cada nodo es el hash de sus hijos. Permite verificar que un elemento está incluido sin revelar todos los elementos.

**Merkle Root**
El hash en la raíz del Merkle tree. Representa todo el dataset de forma compacta.

**Merkle Proof**
Lista de hashes necesarios para verificar que un elemento específico está incluido en el Merkle tree.

**RWA (Real World Assets)**
Activos del mundo real tokenizados en blockchain (ej: bonos, bienes raíces, fondos de inversión).

**Account Abstraction (ERC-4337)**
Estándar que permite wallets más inteligentes, incluyendo transacciones sin gas.

**DataProtector**
SDK de iExec para encriptar y proteger datos, controlando quién puede acceder.

**Smart Contract**
Programa que corre en blockchain de forma automática e inmutable.

**Gas Fees**
Costo de ejecutar transacciones en blockchain.

**IPFS**
Sistema de almacenamiento descentralizado para archivos.

---

## Preguntas Frecuentes

### ¿Es realmente privado?
**Sí.** El TEE (Intel SGX) garantiza que:
- Los datos solo se procesan dentro del enclave seguro
- Ni el servidor ni el admin pueden ver los datos
- Solo el resultado final (Merkle root) se publica

### ¿Puedo confiar en el TEE?
El TEE usa **hardware attestation** de Intel:
- El hardware certifica que el código es correcto
- Cualquiera puede verificar la attestation
- Es el mismo hardware que usa Signal para calls privadas

### ¿Qué pasa si pierdo mi Merkle proof?
El frontend lo guarda localmente y puede regenerarlo consultando el resultado del iApp.

### ¿Cuánto cuesta distribuir?
**Una sola transacción** (~$0.50 en Arbitrum) para publicar el Merkle root, sin importar cuántos holders haya.

### ¿Los holders pagan gas al reclamar?
**No.** El Paymaster (ERC-4337) patrocina las transacciones de claim.

### ¿Qué pasa si un holder no reclama?
Los fondos quedan en el contrato DividendPool hasta que reclame. No expiran.

### ¿Es esto legal?
Sí. La privacidad no es ilegal. Es como tener una cuenta bancaria privada.
Para compliance, el admin puede mantener registros off-chain si es necesario.

---

## Conclusión

**Arckana = Dividendos Privados + Eficientes + Escalables**

Es la infraestructura necesaria para que fondos tokenizados (como BUIDL de BlackRock) puedan distribuir ganancias de forma:
- ✅ **Privada** - Nadie ve tu balance
- ✅ **Eficiente** - Una transacción para todos
- ✅ **Escalable** - 10 o 10,000 holders = mismo costo
- ✅ **Verificable** - Todo en blockchain es auditable

**Construido para el mundo real de finanzas tokenizadas (RWA).**

---

**¿Preguntas?**
Este documento cubre los conceptos principales. Para más detalles técnicos, consulta:
- `TECHNICAL_SPEC.md` - Especificaciones técnicas detalladas
- `QUICK_START.md` - Guía de instalación y uso
- `DEPLOYMENT_SUMMARY.md` - Información de despliegue

**Creado para**: iExec Hack4Privacy 2026
**Última actualización**: 2026-02-03
