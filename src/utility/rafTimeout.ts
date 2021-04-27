export function rafTimeout(action: () => void, timeout: number) {
  window.setTimeout(() => requestAnimationFrame(action), timeout);
}
