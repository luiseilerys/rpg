# The First Dungeon Webxdc - Guía de Desarrollo

## 🚀 Configuración del Entorno de Desarrollo

### Prerrequisitos
- Node.js 18+ instalado
- npm o yarn

### Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo con hot reload
npm run dev

# Abrir http://localhost:3000 en tu navegador
```

## 📁 Nueva Estructura de Archivos

```
/workspace
├── src-unminified/          # Código fuente legible (DESARROLLO)
│   ├── core/                # Constantes y configuración
│   │   └── constants.js
│   ├── entities/            # Entidades del juego
│   │   ├── entity.js        # Clase base
│   │   ├── player.js        # Jugador
│   │   └── MonsterAI.js     # IA de enemigos
│   ├── systems/             # Sistemas del juego
│   │   ├── CollisionSystem.js
│   │   └── EffectSystem.js
│   ├── ui/                  # Componentes UI
│   │   └── VirtualJoystick.js
│   ├── utils/               # Utilidades
│   │   └── ObjectPool.js
│   ├── game.js              # Lógica principal
│   ├── map.js               # Sistema de mapas
│   ├── interface.js         # Interfaz de usuario
│   └── main.js              # Punto de entrada
├── src/                     # Código compilado (PRODUCCIÓN)
├── assets/                  # Recursos del juego
├── vendor/                  # Librerías externas
└── dist/                    # Build final
```

## 🛠 Comandos Disponibles

```bash
# Desarrollo
npm run dev              # Servidor con hot reload
npm run build            # Compilar para producción
npm run preview          # Vista previa del build

# Calidad de código
npm run lint             # Verificar código con ESLint
npm run lint:fix         # Corregir problemas automáticamente
npm run format           # Formatear código con Prettier
npm run format:check     # Verificar formato

# Build completo
npm run build:xdc        # Compilar y crear .xdc

# Limpieza
npm run clean            # Eliminar archivos generados
```

## ✨ Mejoras Implementadas

### 1. **Object Pooling** (`src-unminified/utils/ObjectPool.js`)
Reutilización de objetos para mejorar rendimiento:
- Pool de proyectiles
- Pool de partículas
- Reducción de garbage collection

### 2. **QuadTree Collision System** (`src-unminified/systems/CollisionSystem.js`)
Detección de colisiones optimizada:
- Partición espacial cuadrática
- O(log n) vs O(n²) para detección
- Actualización dinámica de entidades

### 3. **Enhanced Monster AI** (`src-unminified/entities/MonsterAI.js`)
Máquina de estados finita para enemigos:
- Estados: IDLE, PATROL, CHASE, ATTACK, RETREAT, STUNNED
- Detección por rango
- Retreat cuando tiene poca vida
- Patrullaje con waypoints

### 4. **Effect System (Juice)** (`src-unminified/systems/EffectSystem.js`)
Efectos visuales mejorados:
- Screen shake dinámico
- Números de daño flotantes
- Sistema de partículas
- Sparks y slash effects

### 5. **Virtual Joystick** (`src-unminified/ui/VirtualJoystick.js`)
Controles táctiles para móvil:
- Joystick virtual analógico
- Botones de acción táctiles
- Soporte multi-touch
- Deadzone configurable

### 6. **Build System con Vite**
Configuración moderna de build:
- Hot Module Replacement (HMR)
- Source maps para debugging
- Minificación optimizada
- Code splitting automático

## 🔧 Configuración de ESLint y Prettier

### ESLint (`eslint.config.js`)
- Reglas estrictas de calidad
- Detección de errores comunes
- Integración con VS Code

### Prettier (`prettier.config.js`)
- Formato consistente automático
- 4 espacios de indentación
- Líneas de 120 caracteres
- Semicolones obligatorios

## 🎮 Uso de las Nuevas Características

### Ejemplo: Usar Object Pool

```javascript
import { ProjectilePool } from './utils/ObjectPool.js';

// Crear pool en la inicialización
this.projectilePool = new ProjectilePool(this.app.stage, 20);

// Disparar proyectil
this.projectilePool.fire(x, y, vx, vy, damage, texture);

// Actualizar en el game loop
this.projectilePool.update(deltaTime);
```

### Ejemplo: Usar Collision System

```javascript
import { CollisionSystem } from './systems/CollisionSystem.js';

// Crear sistema
this.collisionSystem = new CollisionSystem(5000, 1500);

// Añadir entidades
this.collisionSystem.addEntity(player);
this.collisionSystem.addEntity(monster);

// Verificar colisiones
const collisions = this.collisionSystem.update();
collisions.forEach(({ entity1, entity2 }) => {
    // Manejar colisión
});
```

### Ejemplo: Usar Effect System

```javascript
import { EffectSystem } from './systems/EffectSystem.js';

// Crear sistema
this.effectSystem = new EffectSystem(this.app);

// Screen shake
this.effectSystem.addScreenShake(5, 300);

// Mostrar daño
this.effectSystem.showDamageNumber(x, y, 25, true);

// Partículas
this.effectSystem.spawnParticles(x, y, 15, 0xFF0000, 5);
```

### Ejemplo: Monster AI

```javascript
import { MonsterAI, AI_STATES } from './entities/MonsterAI.js';

// Crear IA para monstruo
this.ai = new MonsterAI(monster, {
    detectionRange: 300,
    attackRange: 50,
    canRetreat: true,
    retreatHealthThreshold: 0.3
});

// Actualizar en game loop
this.ai.update(deltaTime, player, map);
```

## 📝 Convenciones de Código

### Nomenclatura
- Clases: PascalCase (`Player`, `MonsterAI`)
- Variables/funciones: camelCase (`playerStats`, `updateBounds`)
- Constantes: UPPER_SNAKE_CASE (`MAX_LEVEL`, `ASSETS_PATH`)
- Archivos: PascalCase para clases, camelCase para módulos

### Comentarios
- JSDoc para funciones públicas
- Comentarios explicativos para lógica compleja
- TODO para trabajo pendiente

### Imports/Exports
- ES6 modules exclusivamente
- Imports al inicio del archivo
- Export named para múltiples exports
- Export default solo para entry points

## 🐛 Debugging

### Modo Desarrollo
El flag `DEVELOPMENT` en `constants.js` activa:
- Logs detallados
- Cache busting en assets
- Source maps completos
- Validaciones adicionales

### Herramientas
```bash
# Ver logs en consola del navegador
# Abrir DevTools > Console

# Ver source maps
# DevTools > Sources > webpack://

# Performance profiling
# DevTools > Performance > Record
```

## 📦 Crear Build de Producción

```bash
# 1. Compilar código
npm run build

# 2. Verificar que todo funcione
npm run preview

# 3. Crear paquete .xdc
npm run build:xdc

# El archivo the-first-dungeon.xdc estará listo para distribuir
```

## 🚀 Próximas Mejoras Sugeridas

1. **Tests Unitarios**: Jest o Vitest
2. **TypeScript**: Migrar gradualmente
3. **Asset Pipeline**: Compresión automática de imágenes
4. **CI/CD**: GitHub Actions para builds automáticos
5. **Analytics**: Tracking de uso (opcional)

## 📞 Soporte

Para issues o preguntas:
1. Revisar logs en consola
2. Verificar versión de Node.js
3. Limpiar caché: `npm run clean && npm install`
4. Reportar issue con detalles del error
