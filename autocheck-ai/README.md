# AutoCheck AI — Sistema Inteligente de Apoyo a la Inspección Visual de Vehículos

**Universidad Estatal de Milagro (UNEMI)**  
Facultad de Ciencias e Ingeniería | Carrera de Ingeniería de Software  
**Asignatura:** Construcción de Software (5to Semestre)  
**Docente:** Ing. Rodrigo Josue Guevara Reyes  
**Periodo:** Agosto 2026 – Diciembre 2026 | Milagro, Ecuador  

**Equipo de Desarrollo:**
* Rey Mayorga Vera
* María Alejandra García Roldán
* Oscar Erick Heredero Roman
* Caleb David Cabrera Bajaña
* Damián Fabricio Sánchez Pulla

---

## 📌 Descripción del Proyecto

**AutoCheck AI** es una solución web integral diseñada para estandarizar y automatizar la inspección visual vehicular en centros de inspección vehicular, empresas de mantenimiento, gestoras de flotas y aseguradoras.

El sistema reemplaza el registro fotográfico manual y disperso por un flujo automatizado de alta fidelidad:
1. **Validación Óptica de Calidad (OpenCV):** Evalúa resolución y nitidez mediante la varianza del operador Laplaciano en tiempo real, evitando que fotos desenfocadas o defectuosas ingresen a la fase de inspección.
2. **Inferencia de Daños con Inteligencia Artificial (YOLOv8):** Clasifica automáticamente daños visibles en la carrocería (*Rayón*, *Abolladura*, *Rotura de vidrio*, o *Sin daño*) con cálculo de confianza probabilística y tiempo de respuesta inferior a 8 segundos (cumpliendo con el requerimiento RNF-01).
3. **Historial Estructurado y Comparador Diferencial:** Permite contrastar inspecciones de distintas fechas para un mismo vehículo, resaltando automáticamente la aparición de nuevos daños.
4. **Reportes Técnicos Oficiales en PDF:** Generación de informes individuales y comparativos con membrete institucional, aptos para auditorías y peritajes judiciales.
5. **Sistema de Notificaciones en Tiempo Real:** Notificaciones automáticas a propietarios sobre el resultado de sus inspecciones, avisos a administradores/operadores de nuevas unidades registradas y alertas de seguridad por bloqueo de cuentas.

---

## 🏗️ Arquitectura del Sistema y Estructura del Proyecto

El proyecto sigue una arquitectura **Cliente-Servidor desacoplada** compuesta por un Backend robusto en **Django 5 + Django REST Framework** y una aplicación web interactiva en **React 18 + TypeScript + Vite + Tailwind CSS**:

```
autocheck-ai/
├── backend/                        — Backend API REST en Django 5 + DRF
│   ├── core/                       — Configuración central del proyecto (settings, urls, wsgi)
│   │   └── apps/                   — Micro-aplicaciones modulares
│   │       ├── usuarios/           — RF-01, RF-02, RF-03 (Auth JWT, Roles, Bloqueo 3 intentos)
│   │       ├── vehiculos/          — RF-04, RF-05 (Catálogo, placas únicas, aislamiento)
│   │       ├── imagenes/           — RF-06, RF-07 (Carga JPG/PNG, OpenCV Laplaciano)
│   │       ├── analisis_ia/        — RF-08, RF-09, RF-10 (YOLOv8 detección, SLA < 8s)
│   │       │   └── weights/        — Pesos del modelo entrenado (best.pt)
│   │       ├── historial/          — RF-11, RF-12, RF-13 (Cronológico y Comparativa de daños)
│   │       ├── reportes/           — RF-14, RF-15 (ReportLab PDFs oficiales con membrete)
│   │       └── notificaciones/     — Campana en tiempo real (Inspección, Vehículo, Seguridad)
│   ├── media/                      — Almacenamiento local de fotografías de inspecciones
│   │   └── inspecciones/           — Directorio estructurado de imágenes subidas
│   ├── autocheck_db.sql            — Volcado limpio de PostgreSQL (5 usuarios y 10 vehículos en estado pendiente)
│   ├── .env.example                — Plantilla de variables de entorno para base de datos y Django
│   ├── manage.py                   — Gestor de comandos Django
│   ├── requirements.txt            — Dependencias Python
│   └── yolov8n.pt                  — Pesos del modelo base YOLOv8
│
├── frontend/                       — Frontend Single Page Application (SPA)
│   ├── src/
│   │   ├── components/             — Componentes reutilizables (NotificationBell, Modales, etc.)
│   │   ├── context/                — Contexto de autenticación y estado global (AuthContext)
│   │   ├── pages/                  — Vistas del sistema según roles y flujos
│   │   └── services/               — Cliente HTTP Axios configurado con interceptores JWT
│   ├── package.json                — Dependencias Node.js
│   ├── tailwind.config.js          — Sistema de diseño, paleta corporativa y breakpoints
│   └── vite.config.ts              — Configuración de compilador y red local Vite
│
├── .gitignore                      — Reglas de exclusión de archivos temporales para Git
└── README.md                       — Documentación técnica y manual de despliegue
```

---

## 💻 Requisitos Previos del Sistema

Para levantar el proyecto en una nueva computadora, es necesario contar con el siguiente software instalado:

1. **Python 3.12 o superior**:
   * Descargar desde: [python.org](https://www.python.org/downloads/)
   * ⚠️ **Muy Importante:** Durante la instalación en Windows, marcar la casilla **"Add python.exe to PATH"**.
2. **Node.js 18 o 20 LTS** (incluye `npm`):
   * Descargar desde: [nodejs.org](https://nodejs.org/)
3. **PostgreSQL 15, 16, 17 o 18**:
   * Descargar desde: [postgresql.org](https://www.postgresql.org/download/)
   * Durante la instalación, establecer la contraseña para el superusuario `postgres` (ejemplo recomendado: `admin2005` o la de tu preferencia).
4. **Git** (opcional, para clonar el repositorio).

---

## 🚀 Guía de Despliegue Paso a Paso (En otra máquina)

Sigue estos pasos en orden secuencial para poner en marcha el sistema desde cero:

### Paso 1: Clonar o Descargar el Proyecto
Abre tu terminal y ubícate en la carpeta raíz del proyecto `autocheck-ai`:
```bash
git clone <URL_DEL_REPOSITORIO>
cd autocheck-ai
```
*(O si recibiste la carpeta comprimida, simplemente extráela y abre la terminal dentro de `autocheck-ai`).*

---

### Paso 2: Crear la Base de Datos en PostgreSQL
1. Abre **pgAdmin** o la consola **psql** en la nueva máquina.
2. Crea una base de datos vacía llamada `autocheck_db`:
   ```sql
   CREATE DATABASE autocheck_db;
   ```

---

### Paso 3: Configurar y Levantar el Backend (Django REST Framework)

1. Abre una terminal y navega a la carpeta `backend`:
   ```bash
   cd autocheck-ai/backend
   ```

2. Crea el entorno virtual de Python:
   ```bash
   python -m venv .venv
   ```

3. Activa el entorno virtual:
   * **En Windows (PowerShell):**
     ```powershell
     .\.venv\Scripts\Activate.ps1
     ```
     *(Si PowerShell bloquea la ejecución de scripts, ejecuta antes: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`)*
   * **En Windows (CMD / Símbolo del sistema):**
     ```cmd
     .\.venv\Scripts\activate.bat
     ```
   * **En Linux / macOS:**
     ```bash
     source .venv/bin/activate
     ```

4. Instala todas las dependencias del backend:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

5. Configura las variables de entorno en el archivo `.env`:  
   Revisa el archivo `backend/.env` (o crea uno a partir de `backend/.env.example`) y asegúrate de que coincida con la contraseña de tu PostgreSQL local:
   ```env
   DB_NAME=autocheck_db
   DB_USER=postgres
   DB_PASSWORD=admin2005
   DB_HOST=localhost
   DB_PORT=5432

   SECRET_KEY=django-insecure-autocheck-ai-unemi-2026-key-$9x2#h!
   DEBUG=True
   ```
   *(Si tu usuario `postgres` tiene una contraseña distinta a `admin2005`, cámbiala en `DB_PASSWORD`).*

6. Cargar la base de datos limpia con los 5 usuarios del equipo y los 10 vehículos del catálogo:  
   Importa el archivo `autocheck_db.sql` usando el método que prefieras (este archivo incluye la estructura completa, los 5 usuarios con credenciales y los 10 vehículos en estado **Pendiente**, sin inspecciones previas, listos para la demostración en vivo):

   * **Opción A (Recomendada - Gráfica vía pgAdmin 4):**
     1. En pgAdmin, haz clic derecho sobre la base `autocheck_db` y abre **Query Tool**.
     2. Haz clic en el ícono de carpeta **Open file** y selecciona el archivo `backend/autocheck_db.sql`.
     3. Presiona la tecla **F5** (o el botón Ejecutar). La base de datos quedará completamente montada con su estructura, tablas, los 5 usuarios y los 10 vehículos en 2 segundos.

   * **Opción B (Por consola con psql):**
     ```bash
     psql -U postgres -d autocheck_db -f autocheck_db.sql
     ```

     **Opcion c**
     ```& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d autocheck_db -f autocheck_db.sql
     ```

7. Iniciar el servidor del Backend:
   ```bash
   python manage.py runserver 0.0.0.0:8000
   ```
   El backend quedará escuchando en `http://localhost:8000/` y en la red local.

---

### Paso 4: Configurar y Levantar el Frontend (React + Vite)

1. Abre **otra ventana de terminal** y navega a la carpeta `frontend`:
   ```bash
   cd autocheck-ai/frontend
   ```

2. Instala los paquetes de Node.js:
   ```bash
   npm install
   ```

3. Inicia el servidor de desarrollo del Frontend:
   ```bash
   npm run dev
   ```

4. Abre tu navegador web e ingresa a:
   ```
   http://localhost:5173/
   ```

---

## 👥 Cuentas de Acceso Preconfiguradas

La base de datos cuenta con los 5 usuarios del equipo registrados y listos para iniciar sesión:

| Usuario / Correo | Nombre | Rol | Contraseña | Capacidades Principales |
| :--- | :--- | :---: | :---: | :--- |
| `r.mayorga@autocheck.ai` | Rey Mayorga | **ADMINISTRADOR** | `admin100` | Control total, gestión de roles y usuarios, desbloqueo de cuentas, generación de reportes PDF oficiales. |
| `a.garcia@autocheck.ai` | Alejandra García | **OPERADOR** | `oper200` | Registro técnico de vehículos, carga de fotografías, ejecución de análisis con IA, comparación de inspecciones. |
| `d.sanchez@autocheck.ai` | Damian Sánchez | **PROPIETARIO** | `propie300` | Registro de vehículo propio, consulta de historial particular, recepción de notificaciones de inspección. |
| `o.heredero@autocheck.ai` | Oscar Heredero | **PROPIETARIO** | `propie400` | Registro de vehículo propio, consulta de historial particular, recepción de notificaciones de inspección. |
| `c.cabrera@autocheck.ai` | Caleb Cabrera | **PROPIETARIO** | `propie500` | Registro de vehículo propio, consulta de historial particular, recepción de notificaciones de inspección. |

> **Nota de Seguridad (RF-02):** Si se ingresa una contraseña incorrecta 3 veces consecutivas, el sistema bloquea automáticamente la cuenta por seguridad y envía una notificación inmediata al Administrador. El Administrador puede desbloquearla en cualquier momento desde el módulo **Usuarios y roles**.

### 🚗 Catálogo Inicial de Vehículos (10 Unidades en Estado Pendiente)

La base de datos precarga 10 vehículos distribuidos entre los propietarios, todos en estado **`PENDIENTE`** y sin inspecciones previas, listos para ejecutar pruebas en vivo desde cero:

| ID | Placa | Marca y Modelo | Año | Propietario Asignado | Estado Inicial |
| :---: | :---: | :--- | :---: | :--- | :---: |
| 1 | `PBX-4521` | Chevrolet D-Max | 2021 | Damian Sánchez (`d.sanchez@autocheck.ai`) | `PENDIENTE` |
| 2 | `GSK-8910` | Toyota Hilux | 2022 | Damian Sánchez (`d.sanchez@autocheck.ai`) | `PENDIENTE` |
| 3 | `TBA-3320` | Kia Sportage | 2020 | Damian Sánchez (`d.sanchez@autocheck.ai`) | `PENDIENTE` |
| 4 | `ABM-7814` | Hyundai Tucson | 2019 | Damian Sánchez (`d.sanchez@autocheck.ai`) | `PENDIENTE` |
| 5 | `PCD-5412` | Nissan Versa | 2023 | Oscar Heredero (`o.heredero@autocheck.ai`) | `PENDIENTE` |
| 6 | `MDD-6321` | Renault Duster | 2018 | Oscar Heredero (`o.heredero@autocheck.ai`) | `PENDIENTE` |
| 7 | `GYE-9041` | Suzuki Grand Vitara | 2021 | Oscar Heredero (`o.heredero@autocheck.ai`) | `PENDIENTE` |
| 8 | `PCA-1123` | Mazda CX-5 | 2022 | Caleb Cabrera (`c.cabrera@autocheck.ai`) | `PENDIENTE` |
| 9 | `AFB-4509` | Ford F-150 | 2020 | Caleb Cabrera (`c.cabrera@autocheck.ai`) | `PENDIENTE` |
| 10 | `TBD-7788` | Chevrolet Sail | 2019 | Caleb Cabrera (`c.cabrera@autocheck.ai`) | `PENDIENTE` |

---

## 📱 Acceso Móvil (Captura en tiempo real en campo / estación de inspección)

AutoCheck AI está completamente adaptado para dispositivos móviles:
1. Conecta tu teléfono celular a la **misma red Wi-Fi** que la computadora donde corren los servidores.
2. Identifica la dirección IP local de tu computadora ejecutando `ipconfig` en Windows (ejemplo: `192.168.1.15`).
3. Abre el navegador de tu teléfono e ingresa a:
   ```
   http://192.168.1.15:5173/
   ```
4. Inicia sesión con la cuenta de operador (`a.garcia@autocheck.ai` / `oper200`) o con la cuenta de Administrador (`r.mayorga@autocheck.ai` / `admin100`).
5. En el módulo de inspección, podrás usar directamente la cámara de tu teléfono para capturar las zonas del vehículo.

---

## 🧪 Pruebas y Validación Rápida del Sistema

Para verificar que todos los módulos y requerimientos funcionan correctamente en la nueva máquina:

1. **Flujo de Seguridad (RF-02):**
   * En el Login, ingresa `r.mayorga@autocheck.ai` con una contraseña errónea 3 veces. El sistema bloqueará la cuenta e informará el motivo.
   * Inicia sesión con la cuenta de operador `a.garcia@autocheck.ai` (no podrá acceder al módulo de roles).
   * Inicia sesión con Administrador para desbloquear la cuenta con un solo clic.
2. **Flujo de Registro y Notificación (RF-04):**
   * Inicia sesión como Propietario (`d.sanchez@autocheck.ai`).
   * Registra un vehículo (ejemplo: `PDG-3829`, Toyota RAV4, 2022).
   * Entra con la cuenta de Operador o Administrador: verás inmediatamente la notificación de *"Nueva unidad registrada"* en la campana.
3. **Flujo de Calidad e Inspección IA (RF-06 a RF-10):**
   * Como Operador, selecciona el vehículo pendiente y presiona *"Cargar fotos"*.
   * Si intentas subir una imagen borrosa, el sistema la rechazará mediante OpenCV mostrando la pantalla de *"Error al procesar la imagen"* con botón *"Volver a intentar"*.
   * Sube una foto nítida de la carrocería y presiona *"Analizar con IA"*.
   * YOLOv8 detectará los daños, mostrará las tarjetas de diagnóstico y el propietario recibirá en su campana la alerta de *"Inspección con IA completada"*.
4. **Flujo de Reportes PDF (RF-14 y RF-15):**
   * Inicia sesión como Administrador (`r.mayorga@autocheck.ai`).
   * Dirígete a *"Generar reporte"* y descarga el Reporte Individual o Comparativo en formato PDF.

---

## 📄 Licencia y Derechos

Proyecto desarrollado con fines académicos para la asignatura de **Construcción de Software** en la **Universidad Estatal de Milagro (UNEMI)**. Todos los derechos reservados por el equipo de desarrollo.
