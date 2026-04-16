<p align="end">
   <strong>🌐 Cambiar idioma:</strong><br>
   <a href="/README.es.md">
    <img src="https://github.com/Nachopuerto95/multilang/blob/main/ES.png" alt="Español" width="50">
  </a>&nbsp;&nbsp;&nbsp;
  <a href="/README.md">
    <img src="https://github.com/Nachopuerto95/multilang/blob/main/EN.png" alt="English" width="50">
  </a>
</p>

# 💪 Gymtracker v2

<p align="center">
  <img src="assets/gym-demo.gif" alt="Demo de Gymtracker v2" width="320"/>
</p>

## 📜 Sobre el proyecto

`gymtrackerv2` es la evolución de [Fittracker](https://github.com/Nachopuerto95/Fittracker): me quedé con la parte que de verdad usaba (el gimnasio) y la rehíce desde cero con un modelo de datos mejor, una UI más cuidada y un stack con el que me apetece trabajar.

La idea es sencilla: construyes **rutinas** arrastrando ejercicios, y cuando vas al gimnasio las ejecutas como una **sesión** que registra series, repes y peso en tiempo real. Todo lo que completas se guarda como una `WorkoutSession` para poder consultarlo en el calendario y las estadísticas.

## ✨ Features

- **Auth** con JWT, token en `localStorage` y sincronización por eventos (logout en una pestaña cierra todas).
- **Ejercicios**: biblioteca con búsqueda y filtros.
- **Builder de rutinas**: drag-and-drop con `@dnd-kit`, reordenar y sustituir ejercicios.
- **Tracker en sesión**: ejecutas una rutina, marcas series, anotas peso/repes, temporizador de descanso.
- **Histórico y calendario**: cada sesión queda guardada, filtrable por fecha.
- **Gestión de estado**: Zustand para el estado del cliente, patrones estilo React Query en la capa de datos.
- **Animaciones**: framer-motion para transiciones, react-hot-toast para feedback.
- Backend endurecido con `helmet`, `compression`, CORS con origen dinámico y `express-rate-limit`.

## 🧱 Stack

**Backend (`backend/`)**
- Node.js (ES modules) + Express
- MongoDB
- `helmet`, `compression`, `cors` (origen dinámico), `express-rate-limit`
- `jest` para tests
- nodemon

**Frontend (`frontend/`)**
- React 19 + Vite 7
- Tailwind CSS v4
- Zustand (estado)
- `@dnd-kit` (drag-n-drop)
- `framer-motion` (animaciones)
- `react-hot-toast`
- `react-router-dom`
- `axios`
- `lucide-react` (iconos)
- `date-fns`

## 🔧 Ejecución local

```bash
# Backend
cd backend
npm install
npm run dev        # http://localhost:5000

# Frontend
cd frontend
npm install
npm run dev        # http://localhost:5173
```

Hace falta un `.env` en `backend/` con `MONGO_URI`, `JWT_SECRET` y los `CORS_ORIGINS` permitidos.

## 🚀 Despliegue

Las dos partes corren en Fly.io como apps separadas, así el frontend y el backend escalan y se redespliegan de forma independiente.

| Pieza | App de Fly | Región |
|---|---|---|
| Backend | `backend-wandering-sunset-1475` | LHR |
| Frontend | `frontend-billowing-pine-2384` | LHR |

## 📂 Estructura

```
gymtrackerv2/
├── backend/
│   ├── src/
│   │   ├── controllers/   # auth, routine, exercise, workout
│   │   ├── models/        # User, Routine, Exercise, WorkoutSession
│   │   ├── routes/
│   │   └── middleware/
│   ├── server.js
│   └── fly.toml
└── frontend/
    ├── src/
    │   ├── pages/         # Login, Home, Workout, Exercises, Calendar, Routines, RoutineBuilder
    │   ├── components/
    │   ├── stores/        # Zustand stores
    │   └── services/      # clientes axios
    ├── vite.config.js
    └── fly.toml
```

## 🛠️ API

```
POST   /api/auth/signup
POST   /api/auth/login
GET    /api/auth/me

GET    /api/exercises
GET    /api/routines
POST   /api/routines
PATCH  /api/routines/:id
DELETE /api/routines/:id

GET    /api/workouts
POST   /api/workouts           # guardar una sesión finalizada
```

## 🪜 Qué cambió respecto a Fittracker

- Backend y frontend separados en dos apps de Fly.io (deploys más sencillos, escalado independiente).
- Fuera la parte de nutrición: foco total en el flujo de gimnasio.
- React context + fetches manuales reemplazados por Zustand + clientes axios.
- El builder de rutinas pasó de un formulario a un drag-and-drop real.
- Tailwind v4 + lucide + framer-motion hacen que la UI se sienta un producto, no un proyecto de escuela.
