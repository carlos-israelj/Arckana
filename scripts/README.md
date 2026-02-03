# Arckana Distribution Scripts

Scripts para ejecutar la distribución de dividendos desde el backend.

## Configuración

1. **Instalar dependencias**:
```bash
cd scripts
npm install
```

2. **Configurar variables de entorno**:
```bash
cp .env.example .env
# Edita .env y agrega tu ADMIN_PRIVATE_KEY
```

## Uso

### Ejecutar Distribución

```bash
# Distribuir 1000 USDC (6 decimals = 1000000000)
node run-distribution.js 1000000000

# O usando npm script
npm run distribute 1000000000
```

## Flujo Completo

El script `run-distribution.js` realiza:

1. ✅ **Verificar balance** - Confirma que el admin tiene suficiente PaymentToken
2. ✅ **Aprobar contrato** - Autoriza DividendPool a transferir tokens
3. ⏳ **Obtener datos protegidos** - Consulta DataProtector por balances con acceso concedido
4. ⏳ **Ejecutar iApp** - Corre el cálculo de dividendos en TEE
5. ✅ **Publicar Merkle root** - Llama a `startDistributionRound()` en el contrato
6. ✅ **Verificar** - Confirma que la ronda fue creada correctamente

## Estado Actual

**Funcionalidades Implementadas:**
- ✅ Aprobación de tokens
- ✅ Publicación de Merkle root
- ✅ Verificación de balance

**Pendiente (requiere integración completa con DataProtector):**
- ⏳ Query de protected data con acceso concedido
- ⏳ Ejecución automática del iApp
- ⏳ Espera y obtención de resultados del iApp

## Workaround Actual

Por ahora, el script usa un Merkle root pre-calculado de las pruebas manuales. Para usar con datos reales:

1. Ejecuta el iApp localmente o en iExec
2. Obtén el Merkle root del resultado
3. Reemplaza el valor en el script (línea ~110)
4. Ejecuta el script para publicar

## Ejemplo Completo

```bash
# 1. Asegurar que tienes PaymentToken
# Mintea o consigue testnet USDC en tu wallet admin

# 2. Configurar .env con tu private key
echo "ADMIN_PRIVATE_KEY=0x..." > .env

# 3. Ejecutar distribución de 1000 USDC
node run-distribution.js 1000000000

# 4. Verificar en block explorer
# https://sepolia.arbiscan.io/address/0xfD0b399898efC0186E32eb81B630d7Cf7Bb6f217
```

## Output Esperado

```
🚀 Arckana Distribution Runner

═══════════════════════════════════════════════════════

📋 Configuration:
   Admin Address: 0x1234...
   iApp Address: 0x4dF3...
   Total Pool: 1000000000 (1000.0 USDC)

💰 Step 1: Checking PaymentToken balance...
   Balance: 5000.0 USDC
   ✅ Sufficient balance

🔓 Step 2: Approving DividendPool...
   Transaction: 0xabc123...
   ✅ Approval confirmed

🔍 Step 3: Fetching protected data...
   Note: This requires DataProtector SDK integration
   For now, using manual test data

⚙️  Step 4: Running iApp in TEE...
   Note: Full iApp execution requires DataProtector integration
   Using pre-computed Merkle root from test execution

   Merkle Root: 0x8726...

📤 Step 5: Publishing distribution round...
   Current Round: 0
   Starting Round: 1
   Transaction: 0xdef456...
   ✅ Distribution round started!
   Block: 12345678
   Gas Used: 89432

✅ Step 6: Verification
   New Round: 1
   Merkle Root: 0x8726...
   Total Pool: 1000.0 USDC

═══════════════════════════════════════════════════════
✅ Distribution Complete!

📊 Summary:
   Round: 1
   Amount: 1000.0 USDC
   Transaction: https://sepolia.arbiscan.io/tx/0xdef456...

💡 Next Steps:
   1. Token holders can now claim their dividends
   2. Check frontend at https://arckana.lat/
   3. Verify on block explorer
```

## Seguridad

⚠️ **IMPORTANTE:**
- Nunca commits la private key al repositorio
- Usa variables de entorno o un gestor de secretos
- Este script es solo para testnet
- En producción, usa un servicio de firma remota (KMS, HSM, etc.)

## Troubleshooting

### Error: ADMIN_PRIVATE_KEY not found
```bash
export ADMIN_PRIVATE_KEY=0x...
# O crea archivo .env
```

### Error: Insufficient balance
Tu wallet admin necesita:
- PaymentToken (USDC testnet) para distribuir
- ETH (Arbitrum Sepolia) para gas

### Error: Approval failed
Verifica que la dirección del contrato sea correcta y que tengas ETH para gas.
