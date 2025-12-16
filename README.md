# 🎵 ChordMaster

ChordMaster es una aplicación web y móvil desarrollada con Angular e Ionic Capacitor que permite analizar música para extraer acordes, tempo y tonalidad tanto de enlaces de YouTube como de archivos de audio locales.

## 🌟 Características

- **Análisis de música desde YouTube**: Pega un enlace de YouTube y obtén los acordes automáticamente
- **Análisis de archivos locales**: Sube archivos de audio (MP3, WAV, etc.) para análisis
- **Historial de análisis**: Guarda y gestiona tus análisis previos
- **Reproducción sincronizada**: Escucha el audio mientras ves los acordes en tiempo real
- **Interfaz intuitiva**: Diseño moderno y fácil de usar
- **Aplicación multiplataforma**: Funciona en web, iOS y Android

## 📱 Instalación y Uso

### Prerrequisitos

- Node.js (versión 18 o superior)
- npm o yarn
- Para desarrollo móvil: Xcode (iOS) o Android Studio (Android)

### Instalación

1. **Clona el repositorio**:
```bash
git clone [URL_DEL_REPOSITORIO]
cd frontend-chordmaster
```

2. **Instala las dependencias**:
```bash
npm install
```

3. **Inicia el servidor de desarrollo**:
```bash
npm start
```

4. **Abre tu navegador** y ve a `http://localhost:4200`

### Desarrollo para móviles

**Para iOS**:
```bash
npm run ios
```

**Para Android**:
```bash
npm run android
```

## 🚀 Guía de Uso

### 1. Registro e Inicio de Sesión

1. **Registrarse**: 
   - Ve a la página de registro
   - Completa el formulario con nombre, email y contraseña
   - Confirma tu registro

2. **Iniciar sesión**:
   - Ingresa tu email y contraseña
   - Serás redirigido a la página principal

### 2. Análisis de Música

#### Desde YouTube
1. **Selecciona "Enlace de YouTube"** en la página principal
2. **Pega el enlace** de la canción que deseas analizar
3. **Haz clic en "Analizar"**
4. Espera a que el sistema procese el audio
5. **Visualiza los resultados** con acordes, tempo y tonalidad

#### Desde Archivo Local
1. **Selecciona "Archivo Local"** en la página principal
2. **Haz clic en "Seleccionar archivo"** y elige tu audio
3. **Haz clic en "Analizar"**
4. Espera el procesamiento
5. **Revisa los resultados** del análisis

### 3. Visualización de Resultados

En la página de análisis podrás:
- **Ver los acordes** extraídos de la canción
- **Reproducir el audio** sincronizado
- **Ver la forma de onda** visual
- **Consultar información** como tempo (BPM) y tonalidad

### 4. Gestión del Historial

1. **Accede al historial** desde el menú lateral
2. **Ve todas tus canciones** analizadas previamente
3. **Haz clic en cualquier canción** para volver a verla
4. **Elimina canciones** que ya no necesites

### 5. Navegación

- **Menú hamburguesa**: Accede al historial y opciones
- **Header superior**: Logout y información de usuario
- **Navegación intuitiva**: Botones claros en cada pantalla

## 🎯 Funcionalidades Principales

### Análisis Automático
- Extracción de acordes usando IA
- Detección de tempo (BPM)
- Identificación de tonalidad
- Análisis de estructura musical

### Reproducción Interactiva
- Reproductor de audio integrado
- Visualización de forma de onda
- Sincronización visual con acordes
- Controles de reproducción completos

### Gestión de Datos
- Almacenamiento seguro de análisis
- Historial persistente
- Eliminación selectiva de canciones
- Datos de usuario protegidos

## 🛠️ Comandos de Desarrollo

```bash
# Servidor de desarrollo
npm start

# Construcción para producción
npm run build

# Ejecutar tests
npm test

# Desarrollo iOS
npm run ios

# Desarrollo Android  
npm run android

# Modo watch para desarrollo
npm run watch
```

## 🔧 Tecnologías Utilizadas

- **Frontend**: Angular 19, TypeScript
- **UI/UX**: SCSS, Ionic Components
- **Mobile**: Capacitor
- **HTTP Client**: Angular HttpClient
- **Alertas**: SweetAlert2
- **Spinner**: NgxSpinner
- **Audio**: WaveSurfer.js (para visualización)

## 📂 Estructura del Proyecto

```
src/
├── app/
│   ├── core/           # Servicios principales y modelos
│   ├── features/       # Páginas principales de la app
│   │   ├── home/       # Dashboard principal
│   │   ├── login/      # Autenticación
│   │   └── register/   # Registro de usuarios
│   └── shared/         # Componentes compartidos
├── assets/             # Recursos estáticos
└── environments/       # Configuraciones de entorno
```

## 🚨 Solución de Problemas

### Problemas Comunes

1. **Error de autenticación**:
   - Verifica que el backend esté funcionando
   - Comprueba las credenciales de login

2. **Archivo no se analiza**:
   - Verifica que el formato sea compatible (MP3, WAV)
   - Comprueba el tamaño del archivo

3. **YouTube no funciona**:
   - Verifica que el enlace sea válido
   - Comprueba la conexión a internet

4. **Configuración entorno .env IP:**
   - Verifica que las variables de entorno del proyecto apuntan a tu IP

## 📞 Soporte

Si encuentras algún problema o tienes sugerencias:
1. Revisa esta documentación
2. Verifica los logs de la consola del navegador
3. Contacta al equipo de desarrollo

---

**ChordMaster** - Desarrollado con ❤️ usando Angular y Capacitor
