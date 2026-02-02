# 🚀 Deploy Arckana a Vercel - AHORA

## ✅ Código ya está en GitHub!

Tu repositorio: **https://github.com/carlos-israelj/Arckana**

---

## 📋 Pasos para Deploy (15 minutos)

### Paso 1: Ve a Vercel (2 minutos)

1. Abre tu navegador
2. Ve a: **https://vercel.com/**
3. Click en **"Sign Up"** o **"Login"**
4. Selecciona **"Continue with GitHub"**
5. Autoriza Vercel para acceder a tu GitHub

---

### Paso 2: Importa el Proyecto (3 minutos)

1. En Vercel dashboard, click **"Add New..."** en la esquina superior derecha
2. Selecciona **"Project"**
3. Verás lista de tus repositorios de GitHub
4. Busca: **"Arckana"**
5. Click en **"Import"** junto a Arckana

---

### Paso 3: Configurar Proyecto (5 minutos)

#### 3.1 Framework Preset
- Vercel detectará automáticamente: **Next.js** ✅
- Si no, selecciona "Next.js" del dropdown

#### 3.2 Root Directory
**MUY IMPORTANTE**:
1. Click en **"Edit"** al lado de "Root Directory"
2. Escribe: **`frontend`**
3. Click **"Continue"**

#### 3.3 Build Settings
Dejar como está (auto-detectado):
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

---

### Paso 4: Variables de Entorno (5 minutos)

**MUY IMPORTANTE**: Click en **"Environment Variables"**

Agregar las siguientes variables **UNA POR UNA**:

#### Variable 1
```
Name: NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
Value: your_walletconnect_project_id
```
Select: ☑️ Production ☑️ Preview ☑️ Development
Click **"Add"**

#### Variable 2
```
Name: NEXT_PUBLIC_ARCANA_TOKEN_ADDRESS
Value: 0xaF7B67b88128820Fae205A07aDC055ed509Bdb12
```
Select: ☑️ Production ☑️ Preview ☑️ Development
Click **"Add"**

#### Variable 3
```
Name: NEXT_PUBLIC_DIVIDEND_POOL_ADDRESS
Value: 0xfD0b399898efC0186E32eb81B630d7Cf7Bb6f217
```
Select: ☑️ Production ☑️ Preview ☑️ Development
Click **"Add"**

#### Variable 4
```
Name: NEXT_PUBLIC_PAYMASTER_ADDRESS
Value: 0x648B7FfD8a5Dd9C901B6569E7a0DC9A2eAF4c9F1
```
Select: ☑️ Production ☑️ Preview ☑️ Development
Click **"Add"**

#### Variable 5
```
Name: NEXT_PUBLIC_PAYMENT_TOKEN_ADDRESS
Value: 0x71E3a04c9Ecc624656334756f70dAAA1fc4F985D
```
Select: ☑️ Production ☑️ Preview ☑️ Development
Click **"Add"**

#### Variable 6
```
Name: NEXT_PUBLIC_IAPP_ADDRESS
Value: 0x4dF342F232BD89705090c00081924555E849FDb5
```
Select: ☑️ Production ☑️ Preview ☑️ Development
Click **"Add"**

#### Variable 7
```
Name: NEXT_PUBLIC_RPC_URL
Value: https://sepolia-rollup.arbitrum.io/rpc
```
Select: ☑️ Production ☑️ Preview ☑️ Development
Click **"Add"**

#### Variable 8
```
Name: NEXT_PUBLIC_IEXEC_CHAIN_ID
Value: 421614
```
Select: ☑️ Production ☑️ Preview ☑️ Development
Click **"Add"**

---

### Paso 5: Deploy! (1 minuto)

1. Revisa que todo esté configurado:
   - ✅ Framework: Next.js
   - ✅ Root Directory: `frontend`
   - ✅ 8 variables de entorno agregadas

2. Click en el gran botón azul: **"Deploy"**

3. Verás pantalla de build en tiempo real

---

### Paso 6: Esperar Build (3-5 minutos)

Verás logs en tiempo real:
```
Cloning repository...
Installing dependencies...
Running "npm install"
...
Building...
Running "npm run build"
...
Deploying...
✓ Build completed
```

**Tiempo estimado**: 3-5 minutos

---

### Paso 7: ¡LISTO! 🎉

Cuando termine verás:

```
🎉 Congratulations! Your project has been deployed.
```

Tu URL será algo como:
```
https://arckana.vercel.app
https://arckana-carlos-israelj.vercel.app
https://arckana-git-main-carlos-israelj.vercel.app
```

---

## 🧪 Testing del Deploy

### 1. Abre tu URL de Vercel

Click en **"Visit"** o copia la URL y pégala en tu navegador

### 2. Verifica que cargue

Deberías ver:
- ✅ Página de Arckana
- ✅ Título "Private Yield Distribution"
- ✅ Botón "Connect Wallet"

### 3. Conecta tu Wallet

1. Click en "Connect Wallet"
2. Selecciona MetaMask (u otro)
3. Aprobar conexión
4. Cambiar a Arbitrum Sepolia si es necesario

### 4. Prueba los Componentes

- **Protect Balance**: Debería renderizar
- **Distribution Status**: Debería mostrar info
- **Claim Dividend**: Debería mostrar formulario

---

## 🔧 Si algo falla

### Build Failed

1. Click en **"View Build Logs"**
2. Busca el error
3. Común: Missing environment variable
   - Solución: Agrega la variable faltante en Settings → Environment Variables
   - Redeploy: Deployments → ... → Redeploy

### Page Won't Load

1. Verifica que Root Directory sea `frontend`
2. Ve a Project Settings → General
3. Edita "Root Directory" si es necesario
4. Redeploy

### Variables Not Working

1. Ve a Settings → Environment Variables
2. Verifica que TODAS empiecen con `NEXT_PUBLIC_`
3. Verifica que estén seleccionadas Production, Preview, Development
4. Redeploy después de cambios

---

## 📝 Nota Sobre WalletConnect

Si no tienes un WalletConnect Project ID:

**Opción 1: Obtener uno (2 minutos)**
1. Ve a https://cloud.walletconnect.com/
2. Sign up gratis
3. Create New Project
4. Nombre: "Arckana"
5. Copia el Project ID
6. Actualiza variable en Vercel:
   - Settings → Environment Variables
   - Edit `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
   - Pega tu ID real
   - Save
   - Redeploy

**Opción 2: Usar placeholder temporalmente**
- Deja el valor como `your_walletconnect_project_id`
- La app funcionará pero WalletConnect puede no funcionar perfecto
- Actualiza después

---

## 🎯 Checklist Final

Antes de considerar completo:

- [ ] Deploy exitoso en Vercel
- [ ] URL pública accessible
- [ ] Página carga correctamente
- [ ] Wallet se puede conectar
- [ ] Componentes se ven bien
- [ ] No hay errores en console (F12)

---

## 📊 URLs Importantes

Después del deploy, tendrás:

**URL de Producción**: https://arckana.vercel.app (ejemplo)
- Para demos y presentaciones
- Para judges del hackathon
- Para tu submission

**Dashboard de Vercel**: https://vercel.com/[tu-usuario]/arckana
- Monitorear analytics
- Ver logs
- Redeploy si es necesario

**GitHub**: https://github.com/carlos-israelj/Arckana
- Código fuente
- Para reference en submission

---

## 🚀 Próximos Pasos Después de Deploy

1. **Prueba tu URL pública** (10 min)
   - Navega por toda la app
   - Conecta wallet
   - Prueba cada componente
   - Verifica que todo funcione

2. **Graba Demo Video** (30 min)
   - Usa tu URL de Vercel
   - Muestra el flujo completo
   - Explica la arquitectura
   - 3-5 minutos de duración

3. **Prepara Submission** (15 min)
   - URL live: Tu URL de Vercel
   - GitHub: https://github.com/carlos-israelj/Arckana
   - Smart contracts: Ver DEPLOYMENT_SUMMARY.md
   - iApp: 0x4dF342F232BD89705090c00081924555E849FDb5

---

## 💡 Tips

### Auto-Deploy
- Cada vez que hagas `git push` a GitHub
- Vercel automáticamente rebuild y redeploy
- Sin hacer nada manual

### Preview Deployments
- Cada branch get su propia URL
- Prueba features antes de merge
- No afecta producción

### Custom Domain (Opcional)
- Si tienes dominio: arckana.com
- Settings → Domains → Add Domain
- Gratis con Vercel

---

## ✅ Listo para Hackathon

Una vez deployed, tu proyecto estará:
- ✅ 100% funcional online
- ✅ Accesible públicamente
- ✅ Con HTTPS automático
- ✅ Listo para demostrar
- ✅ Listo para judges

---

## 🎉 ¡Empieza Ahora!

**Ve a**: https://vercel.com/

**Tiempo total**: 15 minutos

**Resultado**: Frontend live y funcionando

---

**¿Alguna duda? Revisa VERCEL_DEPLOYMENT_GUIDE.md para más detalles**

**¡Éxito con tu deployment! 🚀**
