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
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('registerLuigiWebComponent', () => {
    const component = mock<Type<any>>();
    const injector = mock<Injector>();
    const element = mock<angularElements.NgElementConstructor<any>>();
    const src = 'src-of-the-script';

    const createCustomElementSpy = (
      angularElements.createCustomElement as MockedFunction<
        typeof angularElements.createCustomElement
      >
    ).mockReturnValue(element);
    const _registerWebcomponent = vi.fn();
    // @ts-expect-error global
    window.Luigi = { _registerWebcomponent };

    const getSrcSpy = vi.spyOn(wc, 'getSrc').mockReturnValue(src);

    wc.registerLuigiWebComponent(component, injector);

    expect(createCustomElementSpy).toHaveBeenCalledWith(component, {
      injector,
    });
    expect(getSrcSpy).toHaveBeenCalled();
    expect(_registerWebcomponent).toHaveBeenCalledWith(src, element);
  });

  it('registerLuigiWebComponents', () => {
    const component1 = mock<Type<any>>();
    const component2 = mock<Type<any>>();
    const components = {
      component1,
      component2,
    };
    const injector = mock<Injector>();

    const getSrcSpy = vi
      .spyOn(wc, 'getSrc')
      .mockReturnValue('http://localhost:12345/main.js#component1');

    const registerLuigiWebComponentSpy = vi
      .spyOn(wc, 'registerLuigiWebComponent')
      .mockReturnValue(void 0);

    wc.registerLuigiWebComponents(components, injector);

    expect(getSrcSpy).toHaveBeenCalled();
    expect(registerLuigiWebComponentSpy).toHaveBeenCalledWith(
      component1,
      injector,
      'http://localhost:12345/main.js#component1',
    );
  });

  it('registerLuigiWebComponents with src', () => {
    const component3 = mock<Type<any>>();
    const components = {
      component3,
    };
    const injector = mock<Injector>();

    const getSrcSpy = vi
      .spyOn(wc, 'getSrc')
      .mockReturnValue('http://localhost:12345/main.js#component1');

    const registerLuigiWebComponentSpy = vi
      .spyOn(wc, 'registerLuigiWebComponent')
      .mockReturnValue(void 0);

    wc.registerLuigiWebComponents(
      components,
      injector,
      'http://localhost:12345/main.js#component3',
    );

    expect(getSrcSpy).not.toHaveBeenCalled();
    expect(registerLuigiWebComponentSpy).toHaveBeenCalledWith(
      component3,
      injector,
      'http://localhost:12345/main.js#component3',
    );
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
});
