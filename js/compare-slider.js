/* Deslizador Antes / Después con Pointer Events para mouse, tacto y lápiz. */
export function initCompareSlider() {
  const stage = document.querySelector('.slider-stage');
  const handle = document.querySelector('.slider-handle-thumb');
  if (!stage || !handle) return;

  let value = 50;
  let dragging = false;
  let pendingValue = null;
  let frame = 0;

  const render = () => {
    frame = 0;
    if (pendingValue === null) return;
    stage.style.setProperty('--pos', `${pendingValue}%`);
    handle.setAttribute('aria-valuenow', String(Math.round(pendingValue)));
    pendingValue = null;
  };

  const setValue = (nextValue) => {
    value = Math.max(0, Math.min(100, nextValue));
    pendingValue = value;
    if (!frame) frame = requestAnimationFrame(render);
  };

  const setFromPointer = (event) => {
    const rect = stage.getBoundingClientRect();
    if (!rect.width) return;
    setValue(((event.clientX - rect.left) / rect.width) * 100);
  };

  stage.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    if (event.target.closest?.('.slider-handle-thumb')) handle.focus({ preventScroll: true });
    dragging = true;
    stage.setPointerCapture(event.pointerId);
    setFromPointer(event);
    event.preventDefault();
  });

  stage.addEventListener('pointermove', (event) => {
    if (dragging) setFromPointer(event);
  });

  const stopDragging = (event) => {
    if (!dragging) return;
    dragging = false;
    if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
  };
  stage.addEventListener('pointerup', stopDragging);
  stage.addEventListener('pointercancel', stopDragging);
  stage.addEventListener('lostpointercapture', () => { dragging = false; });

  handle.addEventListener('keydown', (event) => {
    const step = event.shiftKey ? 10 : 1;
    if (event.key === 'ArrowLeft') setValue(value - step);
    else if (event.key === 'ArrowRight') setValue(value + step);
    else if (event.key === 'Home') setValue(0);
    else if (event.key === 'End') setValue(100);
    else return;
    event.preventDefault();
  });

  setValue(50);
}
