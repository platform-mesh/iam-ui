import { Injector, Type } from '@angular/core';
import { createCustomElement } from '@angular/elements';

export const registerLuigiWebComponent = (
  component: Type<unknown>,
  injector: Injector,
) => {
  const el = createCustomElement(component, { injector });
  // @ts-expect-error global
  window.Luigi._registerWebcomponent(getSrc(), el);
};

/**
 * When there are multiple webcomponents in the same Angular project, use this method to register them.
 * In the cdm.json, set the hash of the urlSuffix to the key of this map.
 *
 * @param components
 * @param injector
 */
export const registerLuigiWebComponents = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  components: Record<string, Type<any>>,
  injector: Injector,
) => {
  const hash = new URL(getSrc()).hash.slice(1);
  if (!hash || !components[hash]) {
    return;
  }
  registerLuigiWebComponent(components[hash], injector);
};

export const getSrc = () => {
  const src = document.currentScript?.getAttribute('src');
  if (!src) {
    throw new Error(
      'src of currentScript is not defined. Contact the DXP Frame team for support.',
    );
  }
  return src;
};
