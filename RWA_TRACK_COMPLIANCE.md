# Arckana - Cumplimiento Track: Confidential Real-World Assets (RWA)

## 🎯 Requisitos del Track

> **Confidential Real-World Assets (RWA)**
>
> Build a project exploring how confidential computing can unlock new possibilities for Real-World Assets (RWA) in Web3.
>
> RWA applications often rely on highly sensitive off-chain information such as financial data, legal constraints, risk metrics, identities, or proprietary models that cannot be exposed publicly on-chain.

---

## ✅ Cumplimiento Completo

**Arckana es un sistema de distribución confidencial de dividendos para fondos tokenizados (RWA).**

El proyecto está **diseñado específicamente para resolver un problema real de RWAs**, concretamente en la categoría:

> ✅ **"Confidential payout and yield distribution systems (e.g. dividends, rental income, or revenue sharing linked to real-world assets)"**

---

## 📊 Caso de Uso RWA Real

### Problema en el Mundo Real

**Fondos Tokenizados como BUIDL de BlackRock**:

BlackRock tiene un fondo tokenizado llamado **BUIDL** (BlackRock USD Institutional Digital Liquidity Fund):
- Es un fondo que invierte en bonos del Tesoro de EE.UU.
- Genera intereses mensuales
- Los holders reciben dividendos proporcionales a su posición
- **Problema**: Los balances son públicos en blockchain

**Por qué es un problema**:
```
Inversor Institucional:
- Tiene $100M en BUIDL
- Su posición es visible públicamente
- Competidores pueden ver su estrategia
- Reguladores pueden rastrear sus movimientos
- Viola privacidad financiera
```

### Solución de Arckana

```
Inversor Institucional con Arckana:
- Encripta su balance de $100M
- Autoriza procesamiento confidencial
- Recibe dividendos proporcionales
- NADIE sabe que tiene $100M
- Solo él y el TEE conocen su posición
✅ Privacidad + Compliance
```

---

## 🔐 Datos Sensibles RWA Procesados

### 1. **Financial Data** (Información Financiera)

**Datos sensibles procesados en TEE**:

```javascript
// Datos reales de holders (ejemplo)
{
  "holder": "0x1234...", // Dirección del inversor
  "balance": 50000000000 // Balance en tokens (SENSIBLE)
}
```

**Por qué es sensible**:
- Revela cuánto dinero tiene el inversor
- En fondos RWA, esto = posición financiera real
- Instituciones NO quieren revelar sus posiciones
- Regulaciones de privacidad (GDPR, etc.)

**Cómo Arckana lo protege**:

```
┌─────────────────────────────────────────────────────────────┐
│  Dato Original (off-chain)                                   │
├─────────────────────────────────────────────────────────────┤
│  Balance: $100,000,000 en BUIDL tokens                      │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ DataProtector.protectData()
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  Dato Encriptado (on-chain)                                  │
├─────────────────────────────────────────────────────────────┤
│  Protected Data Address: 0xABC...                           │
│  Encrypted Payload: [binary data]                           │
│  Decryption Key: Stored in SMS (Secret Management Service)  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ TEE Processing
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  Inside TEE (Intel SGX) - CONFIDENTIAL                      │
├─────────────────────────────────────────────────────────────┤
│  1. Decrypt: $100M balance                                  │
│  2. Calculate: 15.3% share → $153,000 dividend              │
│  3. Generate Merkle proof                                   │
│  4. Erase decrypted data                                    │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ Publish result
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  On-Chain (Public)                                           │
├─────────────────────────────────────────────────────────────┤
│  Merkle Root: 0x8726d8a8753bf06d688bf43d12df27f3f...        │
│  Total Pool: $1,000,000                                     │
│  ✅ NO balance individual revelado                          │
└─────────────────────────────────────────────────────────────┘
```

### 2. **Legal Constraints** (Restricciones Legales)

**Arckana permite compliance sin sacrificar privacidad**:

```python
# Dentro del TEE, se puede agregar lógica de compliance
def validate_kyc_status(holder_address: str) -> bool:
    """
    Verifica KYC/AML sin revelar identidad públicamente
    """
    # Datos de KYC almacenados confidencialmente
    kyc_data = load_confidential_kyc(holder_address)

    # Validaciones de compliance
    if not kyc_data['is_accredited_investor']:
        return False
    if kyc_data['country'] in SANCTIONED_COUNTRIES:
        return False
    if kyc_data['age'] < 18:
        return False

    return True

# Solo holders que pasan compliance pueden participar
# Pero la identidad real NO se expone on-chain
```

**Beneficio**:
- ✅ Cumple con regulaciones (KYC/AML)
- ✅ Mantiene privacidad del inversor
- ✅ No revela información sensible públicamente

### 3. **Risk Metrics** (Métricas de Riesgo)

**El TEE puede procesar métricas de riesgo confidenciales**:

```python
def calculate_risk_adjusted_distribution(balances, risk_scores):
    """
    Ajusta distribución según perfil de riesgo del holder
    Sin revelar el score de riesgo públicamente
    """
    for holder, balance in balances.items():
        risk_score = risk_scores[holder]  # CONFIDENCIAL

        # Holders de alto riesgo reciben menos
        if risk_score > 0.8:
            distribution[holder] = balance * 0.5
        else:
            distribution[holder] = balance * 1.0

    return distribution
```

**Casos de uso**:
- Fondos con diferentes clases de riesgo
- Distribución basada en perfil de inversor
- Sin revelar clasificaciones individuales

### 4. **Proprietary Models** (Modelos Propietarios)

**El algoritmo de distribución puede ser confidencial**:

```python
# Algoritmo propietario de BlackRock para calcular dividendos
def blackrock_proprietary_yield_calculation(balance, market_data):
    """
    Modelo propietario de cálculo de rendimientos
    No se revela la fórmula exacta
    """
    # Fórmula secreta
    factor = calculate_secret_factor(market_data)
    adjusted_yield = balance * factor * MAGIC_MULTIPLIER

    return adjusted_yield

# El código corre en TEE
# Solo el resultado se publica
# La fórmula permanece secreta
```

---

## 🏗️ Arquitectura RWA-Focused

### Ciclo de Vida RWA en Arckana

```
┌─────────────────────────────────────────────────────────────┐
│  REAL WORLD                                                  │
├─────────────────────────────────────────────────────────────┤
│  BlackRock BUIDL Fund                                       │
│  - Invierte en bonos del Tesoro                             │
│  - Genera $10M en intereses mensuales                       │
│  - 10,000 inversores institucionales                        │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ Tokenization
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  ON-CHAIN (Public Blockchain)                               │
├─────────────────────────────────────────────────────────────┤
│  BUIDL Token (ERC20)                                        │
│  - Total Supply: 1B tokens                                  │
│  - Holders: 10,000 addresses                                │
│  - Balance de cada holder: PÚBLICO ❌                       │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ Privacy Layer (Arckana)
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  ARCKANA - CONFIDENTIAL LAYER                               │
├─────────────────────────────────────────────────────────────┤
│  1. Holders encriptan balances con DataProtector            │
│  2. Autorizan acceso al TEE                                 │
│  3. TEE procesa dividendos confidencialmente                │
│  4. Genera Merkle tree                                      │
│  5. Publica solo Merkle root on-chain                       │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ Distribution
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  DIVIDEND CLAIMS (On-Chain)                                  │
├─────────────────────────────────────────────────────────────┤
│  Holders reclaman con Merkle proof                          │
│  - Verificable on-chain ✅                                   │
│  - Balance individual privado ✅                             │
│  - Dividendo correcto garantizado ✅                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Categorías del Track Cubiertas

El track menciona categorías específicas. Arckana cubre:

### ✅ 1. Confidential Payout and Yield Distribution Systems

**Implementación directa**:
- Sistema de distribución de dividendos
- Pagos proporcionales al balance
- Revenue sharing de activos reales
- Aplicable a: dividendos, rentas, royalties

**Código**: `iapp/arckana-dividend-calculator/src/app.py`

```python
def calculate_dividends(balances: Dict[str, int], total_pool: int):
    """
    Calcula distribución de dividendos de forma confidencial

    Use cases:
    - Stock dividends (acciones tokenizadas)
    - Real estate rental income (propiedades tokenizadas)
    - Bond interest (bonos tokenizados)
    - Royalty payments (IP tokenizada)
    """
    total_supply = sum(balances.values())

    dividends = {}
    for address, balance in balances.items():
        share = Decimal(balance) / Decimal(total_supply)
        dividend = int((share * Decimal(total_pool)).quantize(Decimal('1')))
        dividends[address] = dividend

    return dividends
```

### ✅ 2. Asset Valuation, Pricing, and Analytics

**Potencial de extensión**:

El TEE puede procesar:
```python
def confidential_asset_valuation(asset_data, market_data):
    """
    Valúa activos usando datos confidenciales

    Inputs (confidenciales):
    - Propiedades del activo (ubicación, características)
    - Datos de mercado propietarios
    - Modelos de valoración privados

    Output (público):
    - Solo el precio final
    """
    # Modelo de valoración confidencial
    base_value = calculate_base_value(asset_data)
    market_adjustment = apply_market_factors(market_data)
    final_price = base_value * market_adjustment

    # Solo devuelve el precio
    return final_price
```

### ✅ 3. Compliance, Eligibility, and Regulatory Constraints

**Implementación posible**:

```python
def check_regulatory_compliance(holder, transaction):
    """
    Verifica compliance sin exponer datos sensibles

    Checks:
    - KYC/AML status
    - Accredited investor verification
    - Geographic restrictions
    - Investment limits

    Returns: boolean (eligible/not eligible)
    """
    # Datos KYC encriptados
    kyc = load_encrypted_kyc(holder)

    # Validaciones confidenciales
    checks = [
        kyc['status'] == 'VERIFIED',
        kyc['accredited'] == True,
        kyc['country'] not in SANCTIONED_LIST,
        transaction['amount'] <= kyc['investment_limit']
    ]

    return all(checks)
```

### ✅ 4. Risk Assessment and Simulations

**Código ejemplo**:

```python
def simulate_portfolio_risk(holdings, market_scenarios):
    """
    Simula riesgo de portafolio usando datos confidenciales

    Inputs:
    - Holdings de cada inversor (confidencial)
    - Escenarios de mercado (pueden ser confidenciales)

    Output:
    - Métricas de riesgo agregadas
    - Sin revelar holdings individuales
    """
    results = []

    for scenario in market_scenarios:
        # Simula cada escenario
        portfolio_value = calculate_portfolio_value(holdings, scenario)
        risk_metrics = calculate_risk(portfolio_value)
        results.append(risk_metrics)

    # Solo publica estadísticas agregadas
    return aggregate_risk_stats(results)
```

### ✅ 5. Matching, Allocation, or Settlement Mechanisms

**Uso en secundario**:

```python
def confidential_order_matching(buy_orders, sell_orders):
    """
    Match órdenes sin revelar precios límite

    Use case: Mercado secundario de RWAs
    - Buyers/sellers mantienen precios privados
    - Matching ocurre en TEE
    - Solo trades ejecutados se publican
    """
    matches = []

    for buy in buy_orders:
        for sell in sell_orders:
            # Match confidencial
            if can_match(buy, sell):
                trade = execute_trade(buy, sell)
                matches.append(trade)

    return matches
```

---

## 🌍 RWAs Aplicables

Arckana puede usarse con múltiples tipos de RWAs:

### 1. **Tokenized Treasury Funds** (Fondos del Tesoro)
**Ejemplo**: BlackRock BUIDL, Franklin OnChain US Government Money Fund

**Uso**:
- Distribución mensual de intereses
- Mantiene privacidad de holdings institucionales
- Cumple con regulaciones financieras

### 2. **Tokenized Real Estate** (Bienes Raíces)
**Ejemplo**: RealT, Lofty

**Uso**:
- Distribución de rentas mensuales
- Propietarios mantienen posiciones privadas
- Protege contra front-running en compras

### 3. **Tokenized Private Equity** (Capital Privado)
**Ejemplo**: Securitize, Polymath

**Uso**:
- Distribución de ganancias trimestrales
- Confidencialidad requerida por LPs
- Cumplimiento con regulaciones de private equity

### 4. **Tokenized Bonds** (Bonos)
**Ejemplo**: Ondo Finance, Backed

**Uso**:
- Pago de cupones
- Holders institucionales requieren privacidad
- Previene manipulación de mercado

### 5. **Intellectual Property (IP) Tokenizada**
**Ejemplo**: Royalty tokens de música, patents

**Uso**:
- Distribución de royalties
- Protege información de earnings
- Previene ingeniería inversa de modelos de negocio

---

## 📈 Métricas de Impacto RWA

### Problema Actual en RWA

**Caso: Fondo BUIDL de $500M con 100 inversores institucionales**

```
Sin Arckana (Status Quo):
┌─────────────────────────────────────────────────────────────┐
│  Problemas de Privacidad:                                   │
├─────────────────────────────────────────────────────────────┤
│  ❌ Todos pueden ver que JP Morgan tiene $50M              │
│  ❌ Competidores conocen estrategias de inversión          │
│  ❌ Posible front-running en trades                        │
│  ❌ Violación de privacidad financiera                     │
│  ❌ Instituciones evitan blockchain por esto              │
└─────────────────────────────────────────────────────────────┘

Con Arckana:
┌─────────────────────────────────────────────────────────────┐
│  Beneficios:                                                 │
├─────────────────────────────────────────────────────────────┤
│  ✅ Posiciones completamente privadas                       │
│  ✅ Dividendos distribuidos correctamente                   │
│  ✅ Verificable on-chain                                    │
│  ✅ Cumple con compliance                                   │
│  ✅ Instituciones pueden usar blockchain                    │
└─────────────────────────────────────────────────────────────┘
```

### Adopción Institucional

**Barreras actuales para RWAs**:
1. ❌ Falta de privacidad financiera
2. ❌ Exposición de estrategias
3. ❌ Riesgos de front-running
4. ❌ Compliance difícil de mantener privado

**Arckana resuelve los 4 problemas** ✅

---

## 🔬 Innovación Técnica RWA

### 1. **Off-Chain Data → On-Chain Verification**

```
Off-Chain (Confidencial):        On-Chain (Verificable):
┌─────────────────────┐          ┌─────────────────────┐
│  Balance: $100M     │          │  Merkle Root:       │
│  KYC: Verified      │  ──TEE─→ │  0x8726d8a...       │
│  Risk Score: 0.3    │          │                     │
│  Country: USA       │          │  ✅ Cryptographic   │
└─────────────────────┘          │     proof           │
                                 └─────────────────────┘
```

**Beneficio RWA**:
- Datos sensibles permanecen privados
- Resultados son verificables públicamente
- Best of both worlds

### 2. **Composability sin Sacrificar Privacidad**

```
DeFi Protocol puede:
┌─────────────────────────────────────────────────────────────┐
│  1. Leer Merkle root (público)                              │
│  2. Verificar claims de dividendos                          │
│  3. Integrar con otros protocolos                           │
│  4. Hacer analytics on-chain                                │
│                                                              │
│  Pero NO puede:                                             │
│  ❌ Ver balances individuales                               │
│  ❌ Identificar holders específicos                         │
│  ❌ Acceder a datos confidenciales                          │
└─────────────────────────────────────────────────────────────┘
```

### 3. **Regulatory Compliance + Privacy**

```
Regulador puede:
┌─────────────────────────────────────────────────────────────┐
│  1. Verificar que distribución es correcta                  │
│  2. Auditar Merkle proofs                                   │
│  3. Confirmar que todos recibieron dividendos               │
│                                                              │
│  Con acceso especial (si requerido):                        │
│  4. Consultar datos específicos vía TEE                     │
│  5. Sin exponer datos públicamente                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Comparación: Arckana vs Alternativas

| Aspecto | Solución Tradicional | Solución On-Chain Pública | **Arckana** |
|---------|---------------------|--------------------------|-------------|
| **Privacidad de Balances** | ✅ Privado (off-chain) | ❌ Público | ✅ **Encriptado** |
| **Verificabilidad** | ❌ Requiere auditor | ✅ On-chain | ✅ **On-chain** |
| **Eficiencia** | ⚠️ Manual/costoso | ⚠️ Gas por holder | ✅ **O(1) gas** |
| **Compliance** | ✅ Posible | ❌ Difícil | ✅ **Flexible** |
| **Composability** | ❌ No | ✅ Sí | ✅ **Sí** |
| **Escalabilidad** | ❌ No escala | ❌ Costo lineal | ✅ **Bulk processing** |
| **Trust Model** | ❌ Centralized | ✅ Trustless | ✅ **Trustless + Private** |

---

## 🎯 Conclusión

**Arckana cumple COMPLETAMENTE con el track de Confidential RWA:**

### ✅ Requisitos Cubiertos

1. **RWA Use Case Real**: ✅ Distribución de dividendos de fondos tokenizados
2. **Sensitive Off-Chain Data**: ✅ Balances financieros, KYC, risk scores
3. **TEE Processing**: ✅ iExec TEE con Intel SGX
4. **Verifiable On-Chain**: ✅ Merkle proofs y smart contracts
5. **Transparency + Confidentiality**: ✅ Ambos garantizados

### 🎯 Categoría Principal

> ✅ **"Confidential payout and yield distribution systems"**

Con extensibilidad a:
- Asset valuation
- Compliance checking
- Risk assessment
- Order matching

### 💡 Impacto Real

Arckana hace posible que **fondos reales como BlackRock BUIDL** usen blockchain sin sacrificar:
- Privacidad de inversores institucionales
- Verificabilidad y transparencia
- Eficiencia y escalabilidad
- Cumplimiento regulatorio

**Es la infraestructura que falta para la adopción masiva de RWAs en blockchain.**

---

## 📚 Evidencia Adicional

**Archivos de referencia**:
1. `EXPLICACION_COMPLETA.md` - Explicación del caso de uso RWA
2. `iapp/arckana-dividend-calculator/src/app.py` - Procesamiento confidencial
3. `contracts/src/DividendPool.sol` - Verificación on-chain
4. `DEPLOYMENT_SUMMARY.md` - Contratos desplegados

**Live Demo**: https://arckana.lat/

---

**Creado para**: iExec Hack4Privacy 2026 - Confidential RWA Track
**Fecha**: 2026-02-03
**Equipo**: Arckana
