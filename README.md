# The First Dungeon - Webxdc Edition 🎮

Un RPG de acción 2D con mundo de píxeles lleno de aventuras, optimizado para ejecutarse como aplicación Webxdc en Delta Chat.

[![Webxdc](https://img.shields.io/badge/Webxdc-Ready-blue)](https://webxdc.org)
[![Version](https://img.shields.io/badge/version-1.1.0-green)](https://github.com)
[![License](https://img.shields.io/badge/license-BSD--2--Clause-orange)](LICENSE)

## ✨ Mejoras Recientes (v1.1.0)

- 🔋 **Polyfill Webxdc mejorado**: Persistencia de datos en desarrollo local
- ⚡ **Carga optimizada**: Pantalla de carga con barra de progreso
- 📱 **Mobile-first**: Meta tags para PWA y viewport adaptable
- 🔒 **Seguridad**: Integrity checks en CDNs externos
- 🛠️ **Build system**: Makefile para construcción fácil del .xdc
- 🌐 **SEO mejorado**: Meta descriptions y keywords optimizadas

## 🎮 Características

- **RPG de Acción 2D**: Combate en tiempo real con diferentes enemigos
- **Mundo Abierto**: Explora el mapa empire1 con múltiples áreas
- **Sistema de Progresión**: Sube hasta el nivel 100
- **Auto-guardado**: Tu progreso se guarda automáticamente cada 60 segundos
- **Multiplayer**: Juega con amigos en chats de Delta Chat
- **3 Tipos de Enemigos**: Goblin, Mushroom y Demon Boss

## 📦 Instalación

### En Delta Chat

1. Descarga el archivo `the-first-dungeon.xdc`
2. Envíalo a cualquier chat de Delta Chat
3. Ábrelo y comienza a jugar

### Desarrollo Local

```bash
# Clona el repositorio
git clone <repository-url>
cd the-first-dungeon-webxdc

# Opción 1: Usar Makefile
make test

# Opción 2: Abrir directamente
# Abre index.html en tu navegador (Chrome, Firefox, Edge)
```

El polyfill de `webxdc.js` permite ejecutar el juego sin Delta Chat, simulando la API completa con persistencia de datos.

## 🛠️ Construir desde código fuente

```bash
# Requisito: tener zip instalado

# Construir el archivo .xdc
make build

# O manualmente:
zip -r the-first-dungeon.xdc index.html manifest.toml webxdc.js src assets
```

## 🎯 Controles

| Tecla | Acción |
|-------|--------|
| **W/A/S/D** | Moverse |
| **Espacio/F** | Atacar |
| **R** | Respawn (al morir) |
| **Escape** | Menú principal |

## 📁 Estructura del Proyecto

```
the-first-dungeon-webxdc/
├── manifest.toml      # Configuración Webxdc
├── index.html         # Punto de entrada (optimizado)
├── webxdc.js          # Polyfill API Webxdc (mejorado)
├── Makefile           # Sistema de build
├── README.md          # Este archivo
├── .gitignore         # Archivos ignorados por Git
├── src/               # Código fuente minificado
│   ├── constants.min.js
│   ├── game.min.js
│   ├── main.min.js
│   ├── map.min.js
│   ├── interface.min.js
│   ├── utils.min.js
│   └── entity/
│       ├── entity.min.js
│       ├── player.min.js
│       └── monster.min.js
└── assets/            # Recursos del juego
    ├── actor/         # Sprites de personajes
    ├── map/           # Texturas y mapas
    ├── ui/            # Interfaz de usuario
    └── *.json         # Tablas de prototipos
```

## 🔧 Tecnologías

- **Motor Gráfico**: PixiJS v6.2.1 (renderizado WebGL 2D)
- **UI Framework**: jQuery v3.5.1
- **API**: Webxdc (Delta Chat)
- **Lenguaje**: JavaScript ES6+
- **Build**: ZIP + Makefile

## 🚀 Comandos Makefile

```bash
make help     # Mostrar ayuda
make build    # Construir archivo .xdc
make test     # Abrir en navegador para pruebas
make clean    # Limpiar archivos generados
```

## 📝 Licencia

BSD-2-Clause - Ver archivo [LICENSE](LICENSE) para más detalles.

## 🔗 Enlaces

- [Demo Web](https://thefirstdungeon.web.app)
- [Documentación Webxdc](https://webxdc.org)
- [Delta Chat](https://delta.chat)
- [PixiJS Documentation](https://pixijs.download/v6.2.1/docs/)

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Haz fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

---

**Hecho con ❤️ para la comunidad de Delta Chat**
