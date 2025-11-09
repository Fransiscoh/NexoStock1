# NexoStock

Sistema completo de gestión de inventario, control de ventas y administración de proveedores.

## Características

- **Control de Stock**: Gestión completa de inventario de productos
- **Agregar Productos**: Sistema flexible para agregar productos con marcas y categorías
- **Facturador**: Interfaz intuitiva para procesar ventas
- **Control de Ventas**: Dashboard de ventas con cierre de caja diario
- **Armado de Mix**: Crea paquetes personalizados de productos
- **Fraccionador**: Divide productos en porciones más pequeñas
- **Gestión de Proveedores**: Registra contacto, email, teléfono y dirección de proveedores
- **Historial de Cierres**: Consulta todos los cierres de caja realizados
- **Modo Oscuro/Claro**: Interfaz adaptable a preferencias del usuario

## Instalación

### Opción 1: Usando npm/pnpm

\`\`\`bash
# Instalar dependencias
npm install
# o
pnpm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build
npm start
\`\`\`

### Opción 2: Descargar ZIP desde v0

1. Abre tu proyecto en v0
2. Haz clic en los tres puntos (⋮) en la esquina superior derecha
3. Selecciona "Download ZIP"
4. Sigue el asistente de instalación

## Despliegue en Vercel

### Opción 1: Conectar con GitHub (Recomendado)

1. Sube tu proyecto a GitHub
2. Ve a [vercel.com](https://vercel.com)
3. Haz clic en "New Project"
4. Selecciona tu repositorio
5. Vercel detectará la configuración automáticamente
6. Haz clic en "Deploy"

### Opción 2: Vercel CLI

\`\`\`bash
# Instalar Vercel CLI
npm install -g vercel

# Desplegar
vercel
\`\`\`

### Opción 3: Desplegar desde v0

1. En v0, haz clic en "Publish" en la esquina superior derecha
2. Conecta tu cuenta de Vercel
3. Sigue los pasos indicados

## Estructura del Proyecto

\`\`\`
nexostock/
├── app/                    # Aplicación Next.js (futuro)
├── components/             # Componentes React
├── frontend/              # Archivos HTML/CSS/JS estáticos
│   ├── index.html         # Dashboard principal
│   ├── login.html         # Página de login
│   ├── register.html      # Página de registro
│   └── assets/
│       ├── js/            # JavaScript
│       └── styles/        # CSS
├── public/                # Archivos públicos estáticos
├── scripts/               # Scripts SQL
├── package.json           # Dependencias
├── vercel.json            # Configuración de Vercel
├── next.config.mjs        # Configuración Next.js
└── README.md              # Este archivo
\`\`\`

## Configuración de Variables de Entorno

Copia `.env.example` a `.env.local` y configura tus variables:

\`\`\`bash
cp .env.example .env.local
\`\`\`

## Almacenamiento de Datos

Por defecto, NexoStock almacena todos los datos en **localStorage** del navegador. Esto es ideal para desarrollo local.

Para producción con base de datos, considera usar:
- Supabase
- Firebase
- PostgreSQL con Neon
- MongoDB

## Uso

1. **Crear cuenta**: Ve a la página de registro
2. **Iniciar sesión**: Usa las credenciales de prueba
   - Email: `admin@stock.com`
   - Contraseña: `admin123`
3. **Explorar funcionalidades**: Navega por los tabs disponibles

## Desarrollo

\`\`\`bash
# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo
npm run dev

# Acceder a
# http://localhost:3000
\`\`\`

## Build para Producción

\`\`\`bash
npm run build
npm start
\`\`\`

## Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Framework**: Next.js 14
- **UI Components**: shadcn/ui, Radix UI
- **Estilos**: Tailwind CSS
- **Iconos**: Font Awesome 6
- **Almacenamiento**: localStorage (por defecto)

## Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## Soporte

Para reportar problemas o sugerencias, crea un issue en GitHub o contacta al equipo de desarrollo.

## Versión

**NexoStock v1.0.0** - Noviembre 2025
