# The First Dungeon - Webxdc Edition

Un RPG de acción 2D con mundo de píxeles lleno de aventuras, adaptado para ejecutarse como aplicación Webxdc en Delta Chat.

## 🎮 Características

- **RPG de Acción 2D**: Combate en tiempo real con diferentes enemigos
- **Mundo Abierto**: Explora el mapa empire1 con múltiples áreas
- **Sistema de Progresión**: Sube hasta el nivel 100
- **Auto-guardado**: Tu progreso se guarda automáticamente cada 60 segundos
- **Multiplayer**: Juega con amigos en chats de Delta Chat

## 📦 Instalación

### En Delta Chat

1. Descarga el archivo `.xdc` desde las releases
2. Envíalo a cualquier chat de Delta Chat
3. Ábrelo y comienza a jugar

### Desarrollo Local

```bash
# Clona el repositorio
git clone <repository-url>
cd the-first-dungeon-webxdc

# Abre index.html en tu navegador
# El polyfill de webxdc.js permite ejecutar el juego sin Delta Chat
```

## 🛠️ Tecnologías

- **Motor**: PixiJS v6.2.1 (renderizado WebGL 2D)
- **UI**: jQuery v3.5.1
- **API**: Webxdc (Delta Chat)
- **Lenguaje**: JavaScript ES6+

## 🎯 Controles

- **W/A/S/D**: Moverse
- **Espacio/F**: Atacar
- **R**: Respawn (al morir)
- **Escape**: Menú principal

## 📁 Estructura del Proyecto

```
the-first-dungeon-webxdc/
├── manifest.toml      # Configuración Webxdc
├── index.html         # Punto de entrada
├── webxdc.js          # Polyfill API Webxdc
├── src/               # Código fuente minificado
│   ├── constants.min.js
│   ├── game.min.js
│   ├── main.min.js
│   └── ...
└── assets/            # Recursos del juego
    ├── actor/         # Sprites de personajes
    ├── map/           # Texturas y mapas
    ├── ui/            # Interfaz de usuario
    └── ...
```

## 🚀 Empaquetar para Webxdc

Para crear un archivo `.xdc`:

```bash
# Comprime todos los archivos en un zip
zip -r the-first-dungeon.xdc \
  manifest.toml \
  index.html \
  webxdc.js \
  src/ \
  assets/
```

## 📝 Licencia

BSD-2-Clause

## 🔗 Enlaces

- [Demo Web](https://thefirstdungeon.web.app)
- [Documentación Webxdc](https://webxdc.org)
- [Delta Chat](https://delta.chat)
