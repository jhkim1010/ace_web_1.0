# Colibri - Sistema de Autenticación de Usuarios

Sistema de autenticación de usuarios compuesto por un frontend React + TypeScript y un backend Node.js + Express.

## 🚀 Inicio Rápido

### 1. Instalación de Dependencias
```bash
npm run install-all
```

### 2. Configuración de Base de Datos
PostgreSQL debe estar instalado.
```bash
# Ejecutar esquema después de conectar PostgreSQL
psql -h localhost -U postgres -d colibri -f colibri_web_backend/schema.sql
```

### 3. Ejecutar Servidor de Desarrollo
```bash
npm run dev
```

¡Con este comando, el backend (puerto 4000) y frontend (puerto 3000) se ejecutan simultáneamente!

## 📁 Estructura del Proyecto

```
ACE1/
├── package.json                  # Configuración del paquete raíz
├── README.md                    # Documentación del proyecto
├── README_spanish.md            # Documentación en español
├── .gitignore                   # Archivos ignorados por Git
├── colibri_web_backend/         # Servidor Node.js + Express
│   ├── index.js                 # Archivo principal del servidor
│   ├── schema.sql               # Esquema de base de datos
│   └── package.json             # Dependencias del backend
└── colibri_web_frontend/        # Cliente React + TypeScript
    ├── src/
    │   ├── App.tsx              # Componente principal de la app
    │   ├── Login.tsx            # Componente de login/registro
    │   ├── MainPage.tsx         # Componente de página principal
    │   ├── LanguageSelector.tsx # Componente selector de idioma
    │   ├── i18n.ts              # Configuración multilingüe
    │   └── locales/             # Archivos de traducción
    │       ├── en/translation.json
    │       ├── es/translation.json
    │       └── ko/translation.json
    └── package.json             # Dependencias del frontend
```

## 🛠️ Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run install-all` | Instalar todas las dependencias (backend + frontend) |
| `npm run dev` | Ejecutar servidores de desarrollo simultáneamente (backend + frontend) |
| `npm run server` | Ejecutar solo el servidor backend |
| `npm run client` | Ejecutar solo el servidor frontend |
| `npm run build` | Construir el frontend |

## 🔧 Stack Tecnológico

### Backend
- **Node.js** + **Express.js**
- **PostgreSQL** (base de datos)
- **JWT** (tokens de autenticación)
- **CORS** (solicitudes cross-origin)

### Frontend
- **React 19** + **TypeScript**
- **React Router** (enrutamiento)
- **React i18next** (soporte multilingüe)
- **LocalStorage** (almacenamiento de tokens)

## 📊 Estructura de Base de Datos

### Tabla companies
```sql
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla users
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    ref_id_company INTEGER NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(username, ref_id_company),
    CONSTRAINT fk_users_company FOREIGN KEY (ref_id_company) REFERENCES companies(id) ON DELETE CASCADE
);
```

## 🎯 Funcionalidades Principales

- ✅ Login con formato usuario@empresa
- ✅ Registro e inicio de sesión
- ✅ Autenticación basada en tokens JWT
- ✅ Redirección automática a página principal
- ✅ Funcionalidad de logout
- ✅ Diseño UI responsivo
- ✅ Soporte multilingüe (inglés, español, coreano)
- ✅ Detección y selección automática de idioma

## 🔐 Cómo Usar

1. **Registro**: Ingresar en formato `usuario@empresa`
2. **Login**: Iniciar sesión con la cuenta registrada
3. **Página Principal**: Redirección automática después del login exitoso
4. **Cambio de Idioma**: Hacer clic en el botón de selección de idioma en la esquina superior derecha
5. **Logout**: Botón en la esquina superior derecha para cerrar sesión

## 🌍 Idiomas Soportados

- 🇺🇸 **English** (Inglés)
- 🇪🇸 **Español** (Español)
- 🇰🇷 **한국어** (Coreano)

## 🚨 Notas Importantes

- El servidor PostgreSQL debe estar ejecutándose
- La base de datos `colibri` debe estar creada
- El servidor backend usa el puerto 4000, el frontend usa el puerto 3000

## 📝 Características del Sistema

### Autenticación
- Formato de usuario único: `usuario@empresa`
- Validación de contraseñas duplicadas en registro
- Tokens JWT para sesiones seguras
- Almacenamiento local de credenciales

### Interfaz de Usuario
- Diseño moderno y responsivo
- Soporte completo para múltiples idiomas
- Navegación intuitiva
- Mensajes de estado claros

### Base de Datos
- Estructura normalizada con tablas separadas
- Relaciones de clave foránea
- Restricciones de integridad
- Índices optimizados para consultas

### Desarrollo
- Scripts automatizados para instalación y ejecución
- Configuración de desarrollo simplificada
- Documentación completa en múltiples idiomas
- Estructura de proyecto escalable 