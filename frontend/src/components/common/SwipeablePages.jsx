import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, useMotionValue, animate } from 'framer-motion';

/**
 * SwipeablePages Component
 * Permite navegar entre páginas del menú usando gestos de deslizamiento horizontal.
 * Detecta la dirección inicial del gesto para evitar conflictos con scroll vertical y pull-to-refresh.
 */
const SwipeablePages = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const x = useMotionValue(0);
  const containerRef = useRef(null);
  const gestureRef = useRef({
    isActive: false,
    direction: null,
    startX: 0,
    startY: 0,
    startTime: 0,
    currentX: 0
  });
  const [, forceRender] = useState(0);

  // Definir el orden de las páginas del menú
  const menuPages = [
    { path: '/', label: 'Inicio' },
    { path: '/exercises', label: 'Ejercicios' },
    { path: '/calendar', label: 'Historial' },
    { path: '/routines', label: 'Rutinas' }
  ];

  // No aplicar swipe en páginas específicas
  const isWorkoutPage = location.pathname.startsWith('/workout/');
  const isLoginPage = location.pathname === '/login' || location.pathname === '/signup';
  const isRoutineBuilderPage = location.pathname.startsWith('/routines/') &&
                                (location.pathname.endsWith('/edit') || location.pathname.endsWith('/new'));
  const swipeDisabled = isWorkoutPage || isLoginPage || isRoutineBuilderPage;

  // Obtener el índice de la página actual
  const getCurrentIndex = useCallback(() => {
    return menuPages.findIndex(page => {
      if (page.path === '/') {
        return location.pathname === '/';
      }
      return location.pathname.startsWith(page.path);
    });
  }, [location.pathname]);

  const currentIndex = getCurrentIndex();

  // Constantes para el comportamiento del swipe
  const DIRECTION_LOCK_THRESHOLD = 15; // px para determinar dirección (aumentado para ser más preciso)
  const SWIPE_THRESHOLD = 70; // px para activar cambio de página
  const VELOCITY_THRESHOLD = 300; // px/s para swipe rápido
  const ELASTIC_FACTOR = 0.25; // Factor de elasticidad
  const VERTICAL_BIAS = 1.8; // Bias hacia vertical para favorecer scroll/pull-to-refresh

  // Manejar inicio del toque
  const handleTouchStart = useCallback((e) => {
    if (swipeDisabled) return;

    // Ignorar si el scroll no está en top (para permitir scroll normal)
    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    const touch = e.touches[0];
    gestureRef.current = {
      isActive: true,
      direction: null,
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      currentX: 0,
      initialScrollTop: scrollTop
    };
  }, [swipeDisabled]);

  // Manejar movimiento del toque
  const handleTouchMove = useCallback((e) => {
    const gesture = gestureRef.current;
    if (swipeDisabled || !gesture.isActive) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - gesture.startX;
    const deltaY = touch.clientY - gesture.startY;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Si aún no se ha determinado la dirección
    if (!gesture.direction) {
      // Esperar hasta que haya suficiente movimiento para determinar
      if (absDeltaX < DIRECTION_LOCK_THRESHOLD && absDeltaY < DIRECTION_LOCK_THRESHOLD) {
        return;
      }

      // Si está tirando hacia abajo desde el top, siempre es vertical (pull-to-refresh)
      const isAtTop = gesture.initialScrollTop <= 5;
      const isPullingDown = deltaY > 0;

      if (isAtTop && isPullingDown && absDeltaY > 5) {
        gesture.direction = 'vertical';
        return;
      }

      // Determinar la dirección basándose en cuál eje tiene más movimiento
      // Con un bias hacia vertical para favorecer scroll/pull-to-refresh
      const isHorizontal = absDeltaX > absDeltaY * VERTICAL_BIAS;

      gesture.direction = isHorizontal ? 'horizontal' : 'vertical';

      // Si es vertical, no hacer nada más
      if (!isHorizontal) {
        return;
      }
    }

    // Si es un gesto vertical, ignorar completamente
    if (gesture.direction === 'vertical') {
      return;
    }

    // Es un gesto horizontal - prevenir scroll y aplicar el movimiento
    e.preventDefault();

    // Calcular límites con elasticidad
    let constrainedX = deltaX;

    // Si estamos en la primera página y se desliza a la derecha
    if (currentIndex === 0 && deltaX > 0) {
      constrainedX = deltaX * ELASTIC_FACTOR * 0.4;
    }
    // Si estamos en la última página y se desliza a la izquierda
    else if (currentIndex === menuPages.length - 1 && deltaX < 0) {
      constrainedX = deltaX * ELASTIC_FACTOR * 0.4;
    }
    // Normal swipe con algo de elasticidad
    else {
      constrainedX = deltaX * (1 - ELASTIC_FACTOR * 0.2);
    }

    x.set(constrainedX);
    gesture.currentX = constrainedX;
  }, [swipeDisabled, currentIndex, menuPages.length, x]);

  // Manejar fin del toque
  const handleTouchEnd = useCallback((e) => {
    const gesture = gestureRef.current;

    if (swipeDisabled || !gesture.isActive) {
      gestureRef.current = { ...gestureRef.current, isActive: false, direction: null };
      return;
    }

    // Si no fue un gesto horizontal, solo resetear
    if (gesture.direction !== 'horizontal') {
      gestureRef.current = { isActive: false, direction: null, startX: 0, startY: 0, startTime: 0, currentX: 0 };
      return;
    }

    const deltaX = gesture.currentX;
    const duration = (Date.now() - gesture.startTime) / 1000; // en segundos
    const velocity = Math.abs(deltaX) / Math.max(duration, 0.1);

    // Determinar si se debe cambiar de página
    const shouldNavigate = Math.abs(deltaX) > SWIPE_THRESHOLD || velocity > VELOCITY_THRESHOLD;

    if (shouldNavigate) {
      // Deslizar a la izquierda (siguiente página)
      if (deltaX < 0 && currentIndex < menuPages.length - 1) {
        navigate(menuPages[currentIndex + 1].path);
      }
      // Deslizar a la derecha (página anterior)
      else if (deltaX > 0 && currentIndex > 0) {
        navigate(menuPages[currentIndex - 1].path);
      }
    }

    // Animar de vuelta a la posición original con spring suave
    animate(x, 0, {
      type: 'spring',
      stiffness: 500,
      damping: 40,
      mass: 0.8
    });

    gestureRef.current = { isActive: false, direction: null, startX: 0, startY: 0, startTime: 0, currentX: 0 };
  }, [swipeDisabled, currentIndex, menuPages, navigate, x]);

  // Resetear x cuando cambia la página
  useEffect(() => {
    x.set(0);
    gestureRef.current = { isActive: false, direction: null, startX: 0, startY: 0, startTime: 0, currentX: 0 };
  }, [location.pathname, x]);

  // Si el swipe está deshabilitado, solo renderizar los children
  if (swipeDisabled) {
    return <>{children}</>;
  }

  return (
    <motion.div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        x,
        touchAction: 'pan-y',
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
        minHeight: '100%'
      }}
    >
      {children}
    </motion.div>
  );
};

export default SwipeablePages;
