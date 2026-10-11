export type Toast = (message: string) => void;

/** Wires a fixed-position toast element; returns a show(message) function. */
export function attachToast(el: HTMLElement): Toast {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (message) => {
    el.textContent = message;
    el.classList.add('toast--show');
    clearTimeout(timer);
    timer = setTimeout(() => el.classList.remove('toast--show'), 2400);
  };
}
