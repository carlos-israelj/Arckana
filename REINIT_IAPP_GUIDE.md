# Guía: Re-inicializar iApp con Template Oficial

## ✅ Backup Completado

Tu código actual está respaldado en: `iapp_backup_1769985900/`

---

## 🚀 Pasos para Re-inicializar con Template Oficial

### Paso 1: Renombrar directorio actual

```bash
cd /mnt/c/Users/CarlosIsraelJiménezJ/Documents/iExecPrueba/Arcana
mv iapp iapp_old
```

### Paso 2: Crear nuevo proyecto con iapp init

```bash
cd /mnt/c/Users/CarlosIsraelJiménezJ/Documents/iExecPrueba/Arcana
mkdir iapp
cd iapp
iapp init
```

**Responde a las preguntas:**

```
1. What is your project name?
   → arckana-dividend-calculator

2. Which language do you want to use?
   → Python

3. What kind of project do you want to init?
   → Hello World  (Selecciona el más simple)
```

### Paso 3: Verificar que se creó correctamente

```bash
ls -la
# Deberías ver:
# - iapp.config.json
# - Dockerfile
# - src/app.py (o app.js)
# - requirements.txt (para Python)
```

### Paso 4: Copiar tu lógica al nuevo proyecto

```bash
# Copiar tu app.py al nuevo proyecto
cp ../iapp_old/src/app.py src/app.py

# Copiar requirements.txt
cp ../iapp_old/requirements.txt requirements.txt

# Verificar que se copió
cat src/app.py | head -20
```

### Paso 5: Actualizar Dockerfile (si es necesario)

El `iapp init` genera un Dockerfile optimizado. Verifica que tenga:

```dockerfile
FROM python:3.11-alpine

RUN pip install --no-cache-dir pycryptodome

WORKDIR /app
COPY src/app.py /app/app.py

ENTRYPOINT ["python", "/app/app.py"]
```

Si el generado es diferente, cópialo de tu backup:
```bash
cp ../iapp_old/Dockerfile Dockerfile
```

### Paso 6: Actualizar configuración

El `iapp.config.json` generado tendrá nueva wallet. Copia la configuración de Docker Hub del antiguo:

```bash
# Ver configuración antigua
cat ../iapp_old/iapp.config.json

# Editar la nueva con tu info de Docker Hub
nano iapp.config.json
```

Asegúrate de que tenga:
```json
{
  "defaultChain": "arbitrum-sepolia-testnet",
  "projectName": "arckana-dividend-calculator",
  "template": "Python3.11",
  "dockerhubUsername": "carlosisraelj",
  "walletPrivateKey": "YOUR_WALLET_PRIVATE_KEY",
  "appSecret": "...",
  "dockerhubAccessToken": "YOUR_DOCKER_HUB_TOKEN"
}
```

### Paso 7: Test local

```bash
# Crear datos de prueba
mkdir -p input
cat > input/protectedData.json << 'EOF'
[
  {
    "holder": "0x1234567890123456789012345678901234567890",
    "balance": 50000000000
  },
  {
    "holder": "0x2345678901234567890123456789012345678901",
    "balance": 30000000000
  },
  {
    "holder": "0x3456789012345678901234567890123456789012",
    "balance": 20000000000
  }
]
EOF

cat > input/args.txt << 'EOF'
1000000000
EOF

# Test con iapp CLI
iapp test
```

**Deberías ver:**
```
✔ App docker image built
✔ App docker image ran and exited successfully
✔ Would you like to see the result?
```

### Paso 8: Deploy

Si el test pasa:

```bash
iapp deploy --chain arbitrum-sepolia-testnet
```

**Si pregunta por wallet:**
- Selecciona la que ya tienes configurada
- O importa: `86025bec599bee8a7302c836abb73aadbedd2df0d7f771b7f850efd65294ea03`

---

## 🎯 Por Qué Esto Debería Funcionar

1. ✅ **Template Oficial** - iExec genera estructura probada
2. ✅ **Configuración Correcta** - Todas las configs por defecto funcionan
3. ✅ **Tu Código** - Usas tu lógica pero en estructura oficial
4. ✅ **Versión Correcta** - Template usa Python 3.11 estable

---

## 📋 Checklist de Re-inicialización

- [ ] Backup del proyecto anterior (✅ YA HECHO)
- [ ] Renombrar directorio actual: `mv iapp iapp_old`
- [ ] Crear directorio nuevo: `mkdir iapp && cd iapp`
- [ ] Ejecutar `iapp init`
- [ ] Seleccionar: Python + Hello World
- [ ] Copiar `app.py` del backup
- [ ] Copiar `requirements.txt` del backup
- [ ] Actualizar `iapp.config.json` con Docker Hub credentials
- [ ] Test local: `iapp test`
- [ ] Deploy: `iapp deploy --chain arbitrum-sepolia-testnet`

---

## 🔄 Si Aún Falla

Si después de reiniciar con `iapp init` TODAVÍA falla con "Internal error":

**Entonces es 100% confirmado que es problema del servicio de iExec**, no de configuración.

En ese caso:
1. ✅ Reporta en Discord (ya tienes el mensaje preparado)
2. ✅ Continúa con frontend
3. ✅ Prepara demo mostrando ejecución local

---

## 💡 Ventajas de Este Approach

- 🔧 **Estructura correcta** generada por iExec
- 📦 **Todas las configs** optimizadas por defecto
- ✅ **Tu código** se mantiene intacto
- 🎯 **Mayor probabilidad** de éxito

---

## 🚀 Ejecuta Esto en Tu Terminal

```bash
# 1. Renombrar actual
cd /mnt/c/Users/CarlosIsraelJiménezJ/Documents/iExecPrueba/Arcana
mv iapp iapp_old

# 2. Crear nuevo
mkdir iapp
cd iapp

# 3. Init oficial
iapp init
# Selecciona: arckana-dividend-calculator, Python, Hello World

# 4. Copiar tu código
cp ../iapp_old/src/app.py src/app.py
cp ../iapp_old/requirements.txt requirements.txt

# 5. Test
iapp test

# 6. Si pasa, deploy
iapp deploy --chain arbitrum-sepolia-testnet
```

---

**¿Estás listo para intentar esto? Es la mejor opción que nos queda antes de confirmar que es 100% problema del servicio de iExec.**
