import { Injector, Type } from '@angular/core';
import { createCustomElement } from '@angular/elements';

export const registerLuigiWebComponent = (
  component: Type<unknown>,
  injector: Injector,
  source?: string,
) => {
  const src = source ?? getSrc();
  const el = createCustomElement(component, { injector });
  // @ts-expect-error global
  window.Luigi._registerWebcomponent(src, el);
};

/**
 * When there are multiple web components in the same Angular project, use this method to register them.
 * In the cdm.json, set the hash of the urlSuffix to the key of this map.
 *
 * @param components
 * @param injector
 * @param source this must be provided if the project is complied using esbuild, as the currentScript will not be available.
 */
export const registerLuigiWebComponents = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  components: Record<string, Type<any>>,
  injector: Injector,
  source?: string,
) => {
  const src = source ?? getSrc();
  const hash = new URL(src).hash.slice(1);

  if (!hash || !components[hash]) {
    return;
  }
  registerLuigiWebComponent(components[hash], injector, src);
};

export const getSrc = () => {
  const src = document.currentScript?.getAttribute('src');
  if (!src) {
    throw new Error(
      'src of currentScript is not defined. Contact the support team.',
    );
  }
  return src;
};
