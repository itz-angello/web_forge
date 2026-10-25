/* ==========================================================================
   WEBFORGE — MÓDULO: DESLIZADOR ANTES / DESPUÉS
   ========================================================================== */

export function initCompareSlider() {
  const stage = document.querySelector('.slider-stage');
  const rangeInput = document.querySelector('.slider-range-input');
  const afterLayer = document.querySelector('.layer-after');
  const handleLine = document.querySelector('.slider-handle-line');

  if (!stage || !rangeInput || !afterLayer || !handleLine) return;

  const updateSplit = (percent) => {
    const clamped = Math.max(0, Math.min(100, percent));
    stage.style.setProperty('--split-pos', `${clamped}%`);
    rangeInput.value = clamped;
    rangeInput.setAttribute('aria-valuenow', Math.round(clamped));
  };

  // 1. Control de rango accesible
  rangeInput.addEventListener('input', (e) => {
    updateSplit(e.target.value);
  });

  // 2. Arrastre táctil y con puntero en el escenario
  let isDragging = false;

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const rect = stage.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const offsetX = clientX - rect.left;
    const percent = (offsetX / rect.width) * 100;
    updateSplit(percent);
  };

  const stopDragging = () => {
    isDragging = false;
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', stopDragging);
    window.removeEventListener('touchmove', handlePointerMove);
    window.removeEventListener('touchend', stopDragging);
  };

  stage.addEventListener('pointerdown', (e) => {
    isDragging = true;
    handlePointerMove(e);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', stopDragging);
  });

  stage.addEventListener('touchstart', (e) => {
    isDragging = true;
    handlePointerMove(e);
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', stopDragging);
  }, { passive: true });

  // Posición inicial: 50%
  updateSplit(50);
}

