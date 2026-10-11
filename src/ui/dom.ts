export function $<E extends Element>(selector: string): E {
  const node = document.querySelector<E>(selector);
  if (!node) throw new Error(`Missing element: ${selector}`);
  return node;
}
