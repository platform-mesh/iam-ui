/* eslint-disable @typescript-eslint/no-explicit-any */
import * as wc from './wc';
import { Injector, Type } from '@angular/core';
import * as angularElements from '@angular/elements';
import { mock } from 'jest-mock-extended';

jest.mock('@angular/elements', () => ({
  createCustomElement: jest.fn(),
}));

describe('Luigi WebComponents Utils', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('registerLuigiWebComponent', () => {
    const component = mock<Type<any>>();
    const injector = mock<Injector>();
    const element = mock<angularElements.NgElementConstructor<any>>();
    const src = 'src-of-the-script';

    const createCustomElementSpy = (
      angularElements.createCustomElement as jest.MockedFunction<
        typeof angularElements.createCustomElement
      >
    ).mockReturnValue(element);
    const _registerWebcomponent = jest.fn();
    // @ts-expect-error global
    window.Luigi = { _registerWebcomponent };

    const getSrcSpy = jest.spyOn(wc, 'getSrc').mockReturnValue(src);

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

    const getSrcSpy = jest
      .spyOn(wc, 'getSrc')
      .mockReturnValue('http://localhost:12345/main.js#component1');

    const registerLuigiWebComponentSpy = jest
      .spyOn(wc, 'registerLuigiWebComponent')
      .mockReturnValue(void 0);

    wc.registerLuigiWebComponents(components, injector);

    expect(getSrcSpy).toHaveBeenCalled();
    expect(registerLuigiWebComponentSpy).toHaveBeenCalledWith(
      component1,
      injector,
    );
  });

  it('should get src', () => {
    const src = 'http://localhost:12345/main.js#component1';

    const getAttribute = jest.fn().mockReturnValue(src);
    jest
      .spyOn(document, 'currentScript', 'get')
      .mockReturnValue(mock<HTMLOrSVGScriptElement>({ getAttribute }));

    const result = wc.getSrc();

    expect(getAttribute).toHaveBeenCalledWith('src');
    expect(result).toEqual(src);
  });
});
