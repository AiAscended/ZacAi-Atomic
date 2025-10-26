/**
 * DOM manipulation utilities - Atomic function
 */
export const createElement = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  textContent?: string
): HTMLElementTagNameMap[K] => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (textContent) element.textContent = textContent;
  return element;
};

/**
 * Query selector wrapper - Atomic function
 */
export const querySelector = <T extends Element = Element>(selector: string): T | null => {
  return document.querySelector<T>(selector);
};

/**
 * Append children to element - Atomic function
 */
export const appendChildren = (parent: HTMLElement, ...children: (HTMLElement | string)[]): void => {
  children.forEach((child) => {
    if (typeof child === 'string') {
      parent.appendChild(document.createTextNode(child));
    } else {
      parent.appendChild(child);
    }
  });
};

/**
 * Set attributes on element - Atomic function
 */
export const setAttributes = (
  element: HTMLElement,
  attributes: Record<string, string>
): void => {
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
};

/**
 * Add event listener with cleanup - Atomic function
 */
export const addListener = <K extends keyof HTMLElementEventMap>(
  element: HTMLElement,
  event: K,
  handler: (event: HTMLElementEventMap[K]) => void
): (() => void) => {
  element.addEventListener(event, handler as EventListener);
  return () => element.removeEventListener(event, handler as EventListener);
};
