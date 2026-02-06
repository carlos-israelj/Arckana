# 🧪 Flujo de Testing Completo - Arckana

## 📋 Guía Paso a Paso para Probar la Aplicación

---

## ⚙️ **Pre-requisitos**

### 1. Verificar Servidor

```bash
# El servidor debe estar corriendo
# Si no está corriendo, ejecuta:
cd /mnt/c/Users/CarlosIsraelJiménezJ/Documents/iExecPrueba/Arcana/frontend
npm run dev
```

✅ **Servidor corriendo en:** http://localhost:3000

### 2. Configuración de Wallet

**Metamask debe tener:**
- ✅ Red Arbitrum Sepolia agregada
- ✅ Wallet conectado
- ✅ Un poco de ETH para gas (opcional con Paymaster)

**Agregar Arbitrum Sepolia a Metamask:**
```
Network Name: Arbitrum Sepolia
RPC URL: https://sepolia-rollup.arbitrum.io/rpc
Chain ID: 421614
Currency Symbol: ETH
Block Explorer: https://sepolia.arbiscan.io
```

### 3. Wallets Necesarias

**Para testing completo necesitas:**
1. **Wallet Admin:** `0x648a3e5510f55B4995fA5A22cCD62e2586ACb901` (ya configurada)
2. **Wallet User 1:** Tu wallet actual (para probar como holder)
3. **Wallet User 2 (opcional):** Otra wallet para probar múltiples holders

---

## 🎯 **FLUJO COMPLETO DE TESTING**

---

## **PASO 1: Abrir la Aplicación**

```bash
# Abrir navegador
http://localhost:3000
```

**Verificar:**
- ✅ La página carga correctamente
- ✅ Se ven los 5 tabs: Get Tokens, Protect Balance, Distribution, Claim, Admin
- ✅ Botón "Connect Wallet" visible

---

## **PASO 2: Conectar Wallet**

### 2.1 Click en "Connect Wallet"
- Se abre modal de RainbowKit
- Seleccionar **Metamask**
- Aprobar conexión

### 2.2 Cambiar a Arbitrum Sepolia
- En Metamask, cambiar red a **Arbitrum Sepolia**
- La página debe detectar el cambio automáticamente

**Verificar:**
- ✅ Wallet conectado (dirección visible arriba)
- ✅ Red: Arbitrum Sepolia
- ✅ Tabs ahora accesibles

---

## **PASO 3: Tab 0 - Get Tokens** 🎁

### 3.1 Mint ARCANA Tokens

**Input:**
- Amount: `1000`

**Acción:**
- Click en **"Mint ARCANA"**
- Metamask abre
- Aprobar transacción
- Esperar confirmación

**Verificar:**
- ✅ Alert de éxito
- ✅ Balance de ARCANA actualizado: `1000.000000`

### 3.2 Mint USDC (Payment Token)

**Input:**
- Amount: `2000` (para que admin pueda distribuir)

**Acción:**
- Click en **"Mint USDC"**
- Aprobar transacción
- Esperar confirmación

**Verificar:**
- ✅ Balance de USDC actualizado: `2000.000000`

**📸 Screenshot recomendado:** Balance de tokens

---

## **PASO 4: Tab 1 - Protect Balance** 🔐

### 4.1 Proteger Balance

**Input:**
- Your ARCANA Token Balance: `1000`

**Acción:**
- Click en **"🔐 Protect Balance"**
- Se abre transacción de DataProtector
- Aprobar en Metamask

**Proceso (2-3 minutos):**
```
Status updates que verás:
1. "Encrypting data..." ⏳
2. "Publishing to blockchain..." ⏳
3. "Generating encryption key..." ⏳
4. "Storing protected data..." ⏳
5. "✓ Balance Protected!" ✅
```

**Resultado:**
- Alert: "Balance protected successfully!"
- Protected Data Address mostrado
- Ejemplo: `0xabc123...def789`

**Verificar:**
- ✅ Green box con "✓ Balance Protected!"
- ✅ Protected Data Address visible
- ✅ Botón "📋 Grant Access for Distribution" ahora disponible

**Console Log esperado:**
```javascript
Protected data created: {
  address: '0x...',
  name: 'Arckana Balance - 0x648a3e',
  ...
}
```

### 4.2 Grant Access

**Acción:**
- Click en **"📋 Grant Access for Distribution"**
- Aprobar transacción en Metamask

**Proceso (2-3 minutos):**
```
Status updates:
1. "Creating access grant..." ⏳
2. "Publishing grant on-chain..." ⏳
3. "✓ Access Granted!" ✅
```

**Resultado:**
- Alert: "Access granted! Your balance is ready for the next distribution."

**Verificar:**
- ✅ Transacción confirmada
- ✅ No hay errores en console

**Console Log esperado:**
```javascript
Access granted: {
  transactionHash: '0x...',
  grantedAccess: true,
  ...
}
```

**📸 Screenshot recomendado:** Protected data + Grant access success

---

## **PASO 5: Tab 4 - Admin Panel** ⚙️

### ⚠️ **IMPORTANTE: Cambiar a Wallet Admin**

**Antes de continuar:**
1. En Metamask, cambiar a la wallet admin:
   - `0x648a3e5510f55B4995fA5A22cCD62e2586ACb901`
2. O importar la private key en Metamask
3. Refrescar la página si es necesario

**Verificar:**
- ✅ Admin Panel ahora accesible (no muestra "Admin Access Required")

---

### 5.1 Step 0: Approve USDC

**Información visible:**
- 💰 Your USDC Balance: `2000` (o el que tengas)
- 📊 Current Round: `0` (si es primera vez)
- 📝 Allowance Status: `0 USDC` (en amarillo)

**Input:**
- Amount to Approve (USDC): `1000`

**Acción:**
- Click en **"✅ Approve USDC"**
- Aprobar en Metamask
- Esperar confirmación (5-10 segundos)

**Resultado:**
- ✅ Green box: "✓ Approval successful!"
- Link a Arbiscan
- Allowance Status ahora: `1000 USDC` (en verde)

**Verificar:**
- ✅ Allowance actualizado
- ✅ Green indicator

---

### 5.2 Step 1: Run iApp Calculation

**Input:**
- Total Distribution Pool (USDC): `1000`
  - Esto es lo que se va a distribuir entre todos los holders

**Acción:**
- Click en **"⚙️ Run iApp Calculation"**

**Proceso (3-5 minutos):**

```
Status updates que verás:
1. "Fetching protected data..." ⏳
2. "Found X protected data items. Preparing execution..." ⏳
3. "Executing iApp in TEE..." ⏳
4. "Task submitted to workerpool..." ⏳
5. "Fetching task result..." ⏳
```

**Console Logs esperados:**
```javascript
Protected data list: [{address: '0x...', ...}]
Total pool in base units: 1000000000
Protected data addresses: ['0x...']
iApp Status: Executing task in TEE, Done: false
Task ID: 0x1234567890abcdef...
```

**Escenario 1: Éxito Inmediato (ideal)**

Alert:
```
iApp Execution Complete! ✅

Merkle Root: 0x8726d8a8753bf06d688bf43d12df27f3fcbb7600553121de93766d9309681494

Holders: 1
Total Distributed: 1000 USDC

The Merkle root has been set automatically.
You can now proceed to Step 2 to start the distribution round.
```

**Verificar:**
- ✅ Green box con "✓ Merkle Root Set"
- ✅ Merkle Root visible en el campo
- ✅ Console log: "Saved distribution data for claims"

**Escenario 2: Task Pendiente (común)**

Alert:
```
iApp Execution Started! ⏳

Task ID: 0x1234...

The task is processing in the TEE.
Please wait a few minutes and check the iExec Explorer:

https://explorer.iex.ec/bellecour/task/0x1234...

Once complete, you can manually enter the Merkle root.
```

**Qué hacer:**
1. Copiar el Task ID
2. Abrir el link del iExec Explorer
3. Esperar 2-5 minutos
4. Refrescar la página del explorer
5. Cuando status = "COMPLETED":
   - Click en "Result"
   - Buscar `merkle_root: "0x..."`
   - Copiar el hash completo
6. Pegar en el campo "Merkle Root" en la app

**Verificar en iExec Explorer:**
- ✅ Task Status: COMPLETED
- ✅ Result visible
- ✅ merkle_root presente

---

### 5.3 Step 2: Start Distribution Round

**Verificar antes:**
- ✅ Total Distribution Pool tiene valor (ej: `1000`)
- ✅ Merkle Root tiene valor (ej: `0x8726...`)
- ✅ Allowance es suficiente (≥ 1000 USDC)

**Acción:**
- Click en **"📤 Start Distribution Round"**
- Aprobar en Metamask
- Esperar confirmación (10-15 segundos)

**Resultado:**
- ✅ Green box: "✓ Distribution Started!"
- Current Round aumenta: `0` → `1`
- Link a Arbiscan con la transacción

**Verificar:**
- ✅ Transaction confirmed on Arbiscan
- ✅ Event "RoundStarted" visible
- ✅ Current Round actualizado

**Console Log esperado:**
```javascript
Distribution round started successfully
Round: 1
Merkle Root: 0x8726...
```

**📸 Screenshot recomendado:** Distribution started success

---

## **PASO 6: Cambiar a Wallet de Usuario**

**Acción:**
1. En Metamask, cambiar de vuelta a tu wallet original (la que protegió el balance)
2. Refrescar la página si es necesario

---

## **PASO 7: Tab 3 - Claim Dividend** 💰

### 7.1 Verificar Claim Data

**Al abrir Tab 3, deberías ver automáticamente:**

```
Current Round: 1

Your Dividend: $1000.00
Proof: 2 elements (puede variar)
```

**Escenario 1: Data Cargada Automáticamente ✅**

- El monto del dividendo se muestra
- Botón "💰 Claim Dividend (Gasless)" habilitado

**Escenario 2: No Claim Data Found ⚠️**

**Qué hacer:**
1. Click en **"🔄 Refresh Claim Data"**
2. Esperar 2 segundos
3. Si aparece alert "Claim data found and loaded successfully!" ✅
4. Si no, revisar:
   - ¿Admin ejecutó la distribución?
   - ¿Hay data en localStorage?

**Para verificar localStorage manualmente:**
```javascript
// Abrir Console (F12)
localStorage.getItem('arckana-distribution')
// Debe mostrar JSON con distribution data
```

**Escenario 3: Entrada Manual (último recurso)**

1. Click en **"📝 Enter Claim Data Manually"**
2. Buscar en iExec Explorer el resultado del task
3. Encontrar tu address en el array `distribution`
4. Copiar `amount` y `proof`
5. Pegar cuando se pida

---

### 7.2 Claim Dividend

**Acción:**
- Click en **"💰 Claim Dividend (Gasless)"**
- Aprobar en Metamask
- Esperar confirmación (10-15 segundos)

**Resultado:**
- ✅ Green box: "✓ Dividend Claimed!"
- "Your dividend has been successfully transferred to your wallet."

**Verificar:**
- ✅ USDC Balance aumentó en `1000`
- ✅ Transaction en Arbiscan
- ✅ Event "DividendClaimed" visible

**Si intentas reclamar de nuevo:**
- ⚠️ "✓ Already Claimed!"

**📸 Screenshot recomendado:** Dividend claimed success

---

## **PASO 8: Tab 2 - Distribution Status** 📊

**Verificar información:**
- Current Round: `1`
- Merkle Root: `0x8726...`
- Total Pool: `1000.000000 USDC`
- Status: Round activo

**Opciones:**
- Ver detalles del round
- Link a Arbiscan para verificar

**📸 Screenshot recomendado:** Distribution status

---

## ✅ **CHECKLIST DE VERIFICACIÓN COMPLETA**

### Pre-requisitos
- [ ] Servidor corriendo en http://localhost:3000
- [ ] Metamask instalado y configurado
- [ ] Arbitrum Sepolia agregado
- [ ] Wallet con balance

### Flujo Usuario
- [ ] Wallet conectado
- [ ] ARCANA tokens minteados
- [ ] Balance protegido con DataProtector
- [ ] Access granted al iApp
- [ ] Protected Data address visible

### Flujo Admin
- [ ] Wallet admin conectado
- [ ] Admin Panel accesible
- [ ] USDC aprobado al DividendPool
- [ ] iApp ejecutado en TEE
- [ ] Merkle root obtenido
- [ ] Distribution round iniciado on-chain

### Flujo Claim
- [ ] Volver a wallet de usuario
- [ ] Claim data cargada automáticamente
- [ ] Dividendo reclamado exitosamente
- [ ] USDC recibido en wallet
- [ ] No se puede reclamar dos veces

---

## 📊 **Resultado Final Esperado**

### Balances Finales:

**Usuario (Holder):**
- ARCANA: `1000` (sin cambio, solo protegido)
- USDC: `1000` (recibido como dividendo)

**Admin:**
- USDC: `1000` (empezó con 2000, distribuyó 1000)

### On-Chain:
- Round 1 creado ✅
- Merkle root publicado ✅
- Claim registrado ✅

---

## 🎥 **Puntos para Demo Video**

### Scene 1: Introducción (30 seg)
- Mostrar problema: dividendos públicos
- Presentar Arckana como solución

### Scene 2: Protect Balance (1 min)
- Conectar wallet
- Proteger balance con DataProtector
- Mostrar que datos están encriptados

### Scene 3: Admin Distribution (1.5 min)
- Cambiar a admin wallet
- Aprobar USDC
- Ejecutar iApp en TEE
- Mostrar Merkle root automático
- Iniciar distribution round

### Scene 4: Claim (1 min)
- Cambiar a user wallet
- Mostrar claim data automático
- Reclamar dividendo gasless
- Verificar USDC recibido

### Scene 5: Verificación (30 seg)
- Mostrar transacciones en Arbiscan
- Mostrar task en iExec Explorer
- Destacar privacidad: solo Merkle root público

### Scene 6: Conclusión (30 seg)
- Recap de beneficios
- Tracks del hackathon cubiertos
- Call to action

---

## 🐛 **Troubleshooting Común**

### Error: "Network mismatch"
**Solución:** Cambiar a Arbitrum Sepolia en Metamask

### Error: "Insufficient allowance"
**Solución:** Ejecutar Step 0 (Approve USDC) de nuevo

### Error: "No protected data found"
**Solución:** Ir a Tab 1 y proteger balance primero

### Error: "Admin access required"
**Solución:** Conectar con wallet admin configurada

### Error: Task no completa
**Solución:** Esperar 2-5 minutos, verificar en iExec Explorer

### Error: "Already claimed"
**Solución:** Ya reclamaste para este round, todo OK

### Claim data no aparece
**Solución 1:** Click en "Refresh"
**Solución 2:** Verificar que admin ejecutó distribución
**Solución 3:** Entrada manual desde iExec Explorer

---

## 📝 **Notas Importantes**

### Timing
- **Protect Balance:** 2-3 minutos
- **Grant Access:** 2-3 minutos
- **iApp Execution:** 3-5 minutos
- **Total tiempo:** ~10-15 minutos

### Gas Fees
- Todas las transacciones requieren ETH en Arbitrum Sepolia
- Excepto el claim (gasless con Paymaster)

### Límites
- Solo puedes reclamar una vez por round
- El Merkle root es inmutable una vez publicado
- Protected data persiste entre sesiones

---

## 🎯 **Testing Avanzado (Opcional)**

### Múltiples Holders

**Para probar con 2+ holders:**

1. Wallet User 1:
   - Mint 1000 ARCANA
   - Protect balance (1000)
   - Grant access

2. Wallet User 2:
   - Mint 500 ARCANA
   - Protect balance (500)
   - Grant access

3. Admin:
   - Approve 1500 USDC
   - Run iApp (total pool: 1500)
   - Distribution:
     - User 1: 1000 USDC (66.67%)
     - User 2: 500 USDC (33.33%)

4. Cada usuario reclama su parte

**Verificar:**
- ✅ Distribución proporcional correcta
- ✅ Merkle proofs diferentes por usuario
- ✅ Ambos pueden reclamar

---

## 📸 **Screenshots Recomendados**

1. Homepage con tabs
2. Connected wallet
3. Token balances (Get Tokens)
4. Protected data success
5. Grant access success
6. Admin panel overview
7. iApp execution in progress
8. Merkle root obtained
9. Distribution round started
10. Claim data loaded
11. Dividend claimed
12. Final balances

---

## ✅ **Conclusión**

**Si completaste todos los pasos:**
- 🎉 ¡Felicitaciones! El flujo completo funciona
- 📹 Ya puedes grabar el demo video
- 🚀 Ready para deploy a Vercel
- 📝 Ready para submission al hackathon

**Tiempo estimado de testing:** 15-20 minutos

**Próximo paso:** Grabar demo video siguiendo el flujo

---

**¡Éxito con tu testing! 🚀**

Si encuentras algún problema, revisa la sección de Troubleshooting o los logs en la consola.
