# Docker Image Troubleshooting para Arckana iApp

## ✅ Estado Actual: Docker Image Funciona Correctamente

El Docker image se construye y ejecuta sin errores. Prueba local exitosa:

```bash
✓ Build completado: test-arckana
✓ Ejecución exitosa con 3 holders
✓ Merkle root generado: 0x8726d8a8753bf06d688bf43d12df27f3fcbb7600553121de93766d9309681494
✓ Proofs generados correctamente
```

## Problemas Comunes y Soluciones

### 1. **Error: "Platform mismatch" o "exec format error"**

**Síntoma:**
```
exec /usr/local/bin/python: exec format error
```

**Causa:** Estás en Windows/WSL pero el image se construyó para una arquitectura diferente.

**Solución:**
```bash
# Construir para múltiples plataformas
docker buildx build --platform linux/amd64,linux/arm64 -t carlosisraelj/arckana-dividend-calculator:3 .

# O específicamente para iExec (linux/amd64)
docker build --platform linux/amd64 -t carlosisraelj/arckana-dividend-calculator:3 .
```

### 2. **Error: "pycryptodome installation failed"**

**Síntoma:**
```
ERROR: Could not build wheels for pycryptodome
```

**Causa:** Faltan dependencias de compilación en Alpine Linux.

**Solución Mejorada del Dockerfile:**
```dockerfile
FROM python:3.13-alpine

# Install build dependencies for pycryptodome
RUN apk add --no-cache gcc musl-dev

# Install Python dependencies
RUN pip install --no-cache-dir pycryptodome

# Create app directory
WORKDIR /app

# Copy application
COPY src/app.py /app/app.py

# Set entrypoint
ENTRYPOINT ["python", "/app/app.py"]
```

### 3. **Error: "ModuleNotFoundError: No module named 'Crypto'"**

**Síntoma:**
```
ModuleNotFoundError: No module named 'Crypto'
```

**Causa:** pycryptodome no se instaló correctamente.

**Verificación:**
```bash
# Probar dentro del container
docker run --rm test-arckana python -c "from Crypto.Hash import keccak; print('OK')"
```

**Solución:**
Asegurarse de que `requirements.txt` tenga:
```
pycryptodome>=3.19.0
```

### 4. **Error: Docker Hub Authentication Failed**

**Síntoma:**
```
unauthorized: authentication required
```

**Solución:**
```bash
# Logout y login nuevamente
docker logout
docker login -u carlosisraelj

# O usar el token directamente
echo "YOUR_DOCKER_TOKEN" | docker login -u carlosisraelj --password-stdin
```

### 5. **Error: "File not found" al hacer COPY**

**Síntoma:**
```
failed to compute cache key: failed to calculate checksum of ref: "/src/app.py": not found
```

**Verificación:**
```bash
# Asegurarse de que el archivo existe
ls -la src/app.py

# Ejecutar docker build desde el directorio correcto
cd /path/to/Arcana/iapp
docker build -t test-arckana .
```

### 6. **Problema: Image demasiado grande**

**Síntoma:**
```
Image size: 200MB+
```

**Optimización del Dockerfile:**
```dockerfile
FROM python:3.13-alpine

# Install dependencies in one layer
RUN apk add --no-cache --virtual .build-deps gcc musl-dev && \
    pip install --no-cache-dir pycryptodome && \
    apk del .build-deps

WORKDIR /app
COPY src/app.py /app/app.py
ENTRYPOINT ["python", "/app/app.py"]
```

## Comandos de Depuración

### Verificar que el image funciona localmente

```bash
# 1. Construir
cd Arcana/iapp
docker build -t test-arckana .

# 2. Preparar datos de prueba
mkdir -p test_run/iexec_in test_run/iexec_out

# 3. Crear protectedData.json
cat > test_run/iexec_in/protectedData.json << 'EOF'
[
  {
    "holder": "0x1234567890123456789012345678901234567890",
    "balance": 50000000000
  },
  {
    "holder": "0x2345678901234567890123456789012345678901",
    "balance": 30000000000
  }
]
EOF

# 4. Crear args.txt
echo "1000000000" > test_run/iexec_in/args.txt

# 5. Ejecutar container
docker run --rm \
  -v "$(pwd)/test_run/iexec_in:/iexec_in" \
  -v "$(pwd)/test_run/iexec_out:/iexec_out" \
  -e IEXEC_IN=/iexec_in \
  -e IEXEC_OUT=/iexec_out \
  test-arckana

# 6. Ver resultados
cat test_run/iexec_out/result.json
```

### Debugging dentro del container

```bash
# Entrar al container en modo interactivo
docker run -it --rm \
  -v "$(pwd)/test_run/iexec_in:/iexec_in" \
  -v "$(pwd)/test_run/iexec_out:/iexec_out" \
  -e IEXEC_IN=/iexec_in \
  -e IEXEC_OUT=/iexec_out \
  --entrypoint /bin/sh \
  test-arckana

# Dentro del container:
# python app.py  # Ejecutar manualmente
# ls -la /iexec_in  # Ver inputs
# cat /iexec_in/protectedData.json  # Ver datos
```

### Verificar tamaño del image

```bash
docker images test-arckana
# REPOSITORY     TAG       IMAGE ID       CREATED          SIZE
# test-arckana   latest    67328217b563   10 minutes ago   65.2MB
```

## Build y Push Correcto para iExec

### Paso 1: Build multi-plataforma

```bash
cd Arcana/iapp

# Build para linux/amd64 (requerido por iExec)
docker build --platform linux/amd64 -t carlosisraelj/arckana-dividend-calculator:3 .
```

### Paso 2: Tag correctamente

```bash
# Tag con versión específica
docker tag test-arckana carlosisraelj/arckana-dividend-calculator:3

# Tag como latest
docker tag test-arckana carlosisraelj/arckana-dividend-calculator:latest
```

### Paso 3: Push a Docker Hub

```bash
# Push versión específica
docker push carlosisraelj/arckana-dividend-calculator:3

# Push latest
docker push carlosisraelj/arckana-dividend-calculator:latest
```

### Paso 4: Verificar en Docker Hub

Visita: https://hub.docker.com/r/carlosisraelj/arckana-dividend-calculator/tags

## Configuración para iExec

Después del push exitoso, actualiza `iexec.json`:

```json
{
  "description": "Arckana - Confidential Dividend Distribution Calculator",
  "license": "MIT",
  "author": "Arckana Team",
  "app": {
    "owner": "0x648a3e5510f55B4995fA5A22cCD62e2586ACb901",
    "name": "arckana-dividend-calculator",
    "type": "DOCKER",
    "multiaddr": "docker.io/carlosisraelj/arckana-dividend-calculator:3",
    "checksum": "0x0000000000000000000000000000000000000000000000000000000000000000",
    "mrenclave": {
      "provider": "SCONE",
      "version": "v5",
      "entrypoint": "python /app/app.py",
      "heapSize": 1073741824,
      "fingerprint": ""
    }
  }
}
```

## Checklist Pre-Deployment

- [x] ✅ Dockerfile se construye sin errores
- [x] ✅ Docker image ejecuta correctamente localmente
- [x] ✅ Genera `result.json` y `computed.json` válidos
- [x] ✅ Merkle root se genera correctamente
- [x] ✅ Proofs son válidos para cada holder
- [ ] 🔄 Image pushed a Docker Hub con tag correcto
- [ ] 🔄 `iexec.json` actualizado con multiaddr correcto
- [ ] 🔄 `iapp deploy` ejecutado exitosamente

## Siguiente Paso: Deployment

Una vez que el Docker image esté verificado localmente:

```bash
# 1. Build final
docker build --platform linux/amd64 -t carlosisraelj/arckana-dividend-calculator:3 .

# 2. Push
docker push carlosisraelj/arckana-dividend-calculator:3

# 3. Deploy con iApp CLI
cd Arcana/iapp
iapp deploy --chain arbitrum-sepolia-testnet
```

## Logs y Debugging de Deployment

Si el deployment falla, revisa:

```bash
# Logs de iApp CLI
~/.iexec/logs/

# Estado de la wallet
iapp wallet select

# Balance de RLC
# Visita: https://explorer.iex.ec/arbitrum-sepolia-testnet
```

---

**Estado:** ✅ Docker Image Verificado y Funcionando
**Próximo Paso:** Push a Docker Hub y deploy con `iapp deploy`
