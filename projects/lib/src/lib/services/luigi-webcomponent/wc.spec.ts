/* eslint-disable @typescript-eslint/no-explicit-any */
import * as wc from './wc';
import { MockedFunction } from 'vitest';
import { Injector, Type } from '@angular/core';
import * as angularElements from '@angular/elements';
import { mock } from 'vitest-mock-extended';

vi.mock('@angular/elements', () => ({
  createCustomElement: vi.fn(),
}));

describe('Luigi WebComponents Utils', () => {
  let _registerWebcomponent: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    _registerWebcomponent = vi.fn();
    // @ts-expect-error global
    window.Luigi = { _registerWebcomponent };
    (
      angularElements.createCustomElement as MockedFunction<
        typeof angularElements.createCustomElement
      >
    ).mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('registerLuigiWebComponent', () => {
    const component = mock<Type<any>>();
    const injector = mock<Injector>();
    const element = mock<angularElements.NgElementConstructor<any>>();
    const src = 'src-of-the-script';

    (
      angularElements.createCustomElement as MockedFunction<
        typeof angularElements.createCustomElement
      >
    ).mockReturnValue(element);

    wc.registerLuigiWebComponent(component, injector, src);

    expect(angularElements.createCustomElement).toHaveBeenCalledWith(component, { injector });
    expect(_registerWebcomponent).toHaveBeenCalledWith(src, element);
  });

  it('registerLuigiWebComponents', () => {
    const component1 = mock<Type<any>>();
    const component2 = mock<Type<any>>();
    const components = { component1, component2 };
    const injector = mock<Injector>();
    const src = 'http://localhost:12345/main.js#component1';

    const element = mock<angularElements.NgElementConstructor<any>>();
    (
      angularElements.createCustomElement as MockedFunction<
        typeof angularElements.createCustomElement
      >
    ).mockReturnValue(element);

    wc.registerLuigiWebComponents(components, injector, src);

    expect(angularElements.createCustomElement).toHaveBeenCalledWith(component1, { injector });
    expect(_registerWebcomponent).toHaveBeenCalledWith(src, element);
  });

  it('registerLuigiWebComponents with src', () => {
    const component3 = mock<Type<any>>();
    const components = { component3 };
    const injector = mock<Injector>();
    const src = 'http://localhost:12345/main.js#component3';

    const element = mock<angularElements.NgElementConstructor<any>>();
    (
      angularElements.createCustomElement as MockedFunction<
        typeof angularElements.createCustomElement
      >
    ).mockReturnValue(element);

    wc.registerLuigiWebComponents(components, injector, src);

    expect(angularElements.createCustomElement).toHaveBeenCalledWith(component3, { injector });
    expect(_registerWebcomponent).toHaveBeenCalledWith(src, element);
  });

  it('should get src', () => {
    const src = 'http://localhost:12345/main.js#component1';

    const getAttribute = vi.fn().mockReturnValue(src);
    vi
      .spyOn(document, 'currentScript', 'get')
      .mockReturnValue(mock<HTMLOrSVGScriptElement>({ getAttribute }));

    const result = wc.getSrc();

    expect(getAttribute).toHaveBeenCalledWith('src');
    expect(result).toEqual(src);
  });

  it('should throw when currentScript has no src', () => {
    const getAttribute = vi.fn().mockReturnValue(null);
    vi
      .spyOn(document, 'currentScript', 'get')
      .mockReturnValue(mock<HTMLOrSVGScriptElement>({ getAttribute }));

    expect(() => wc.getSrc()).toThrow(
      'src of currentScript is not defined. Contact the support team.',
    );
  });

  it('registerLuigiWebComponents should do nothing when hash does not match component', () => {
    const component1 = mock<Type<any>>();
    const components = { component1 };
    const injector = mock<Injector>();
    const src = 'http://localhost:12345/main.js#unknown';

    wc.registerLuigiWebComponents(components, injector, src);

    expect(angularElements.createCustomElement).not.toHaveBeenCalled();
  });

  it('registerLuigiWebComponent should use getSrc() when no source given', () => {
    const component = mock<Type<any>>();
    const injector = mock<Injector>();
    const src = 'http://localhost:12345/main.js#cmp';

    const getAttribute = vi.fn().mockReturnValue(src);
    vi
      .spyOn(document, 'currentScript', 'get')
      .mockReturnValue(mock<HTMLOrSVGScriptElement>({ getAttribute }));

    const element = mock<angularElements.NgElementConstructor<any>>();
    (
      angularElements.createCustomElement as MockedFunction<
        typeof angularElements.createCustomElement
      >
    ).mockReturnValue(element);

    wc.registerLuigiWebComponent(component, injector);

    expect(_registerWebcomponent).toHaveBeenCalledWith(src, element);
  });
});
