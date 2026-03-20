/* eslint-disable @typescript-eslint/no-explicit-any */
import * as wc from './wc';
import { Component, Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { mock } from 'vitest-mock-extended';

@Component({ standalone: true, template: '' })
class StubComponent {}

describe('Luigi WebComponents Utils', () => {
  let _registerWebcomponent: ReturnType<typeof vi.fn>;
  let injector: Injector;

  beforeEach(() => {
    _registerWebcomponent = vi.fn();
    // @ts-expect-error global
    window.Luigi = { _registerWebcomponent };
    TestBed.configureTestingModule({ imports: [StubComponent] });
    injector = TestBed.inject(Injector);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('registerLuigiWebComponent', () => {
    const src = 'src-of-the-script';

    wc.registerLuigiWebComponent(StubComponent, injector, src);

    expect(_registerWebcomponent).toHaveBeenCalledWith(src, expect.any(Function));
  });

  it('registerLuigiWebComponents', () => {
    const src = 'http://localhost:12345/main.js#StubComponent';

    wc.registerLuigiWebComponents({ StubComponent }, injector, src);

    expect(_registerWebcomponent).toHaveBeenCalledWith(src, expect.any(Function));
  });

  it('registerLuigiWebComponents with matching src', () => {
    const src = 'http://localhost:12345/main.js#StubComponent';

    wc.registerLuigiWebComponents({ StubComponent }, injector, src);

    expect(_registerWebcomponent).toHaveBeenCalledOnce();
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
    const src = 'http://localhost:12345/main.js#unknown';

    wc.registerLuigiWebComponents({ StubComponent }, injector, src);

    expect(_registerWebcomponent).not.toHaveBeenCalled();
  });

  it('registerLuigiWebComponent should use getSrc() when no source given', () => {
    const src = 'http://localhost:12345/main.js#cmp';

    const getAttribute = vi.fn().mockReturnValue(src);
    vi
      .spyOn(document, 'currentScript', 'get')
      .mockReturnValue(mock<HTMLOrSVGScriptElement>({ getAttribute }));

    wc.registerLuigiWebComponent(StubComponent, injector);

    expect(_registerWebcomponent).toHaveBeenCalledWith(src, expect.any(Function));
  });
});
