import { DxpContext, ENV, Environment } from '../../models';
import { TestUtils } from '../../test';
import {
  DxpIContextMessage,
  DxpLuigiContextService,
} from './dxp-luigi-context.service';
import { TestBed, fakeAsync } from '@angular/core/testing';
import { Context } from '@luigi-project/client';
import {
  IContextMessage,
  ILuigiContextTypes,
  LuigiContextServiceImpl,
} from '@luigi-project/client-support-angular';
import { mock } from 'jest-mock-extended';
import { MockProvider } from 'ng-mocks';
import { ReplaySubject } from 'rxjs';

describe('DxpLuigiContextService', () => {
  let dxpLuigiContextService: DxpLuigiContextService;
  let luigiContextService: LuigiContextServiceImpl;
  const contextMessage: DxpIContextMessage = {
    contextType: ILuigiContextTypes.UPDATE,
    context: {
      foo: 'bar',
      baz: {
        qux: 'quux',
        plugh: 'xyzzx',
      },
    } as unknown as DxpContext,
  };

  describe('Context Service without ENV set', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [MockProvider(LuigiContextServiceImpl)],
      });

      dxpLuigiContextService = TestBed.inject(DxpLuigiContextService);
      luigiContextService = TestBed.inject(LuigiContextServiceImpl);
    });

    it('should set the context', () => {
      const context = mock<DxpContext>();
      luigiContextService.addListener = jest.fn();

      dxpLuigiContextService.setContext(context);

      expect(luigiContextService.addListener).toHaveBeenCalledWith(
        ILuigiContextTypes.UPDATE,
        context,
      );
    });

    it('should provide a context observable', fakeAsync(() => {
      const observable = new ReplaySubject<DxpIContextMessage>();
      luigiContextService.contextObservable = jest
        .fn()
        .mockReturnValue(observable);
      observable.next(contextMessage);

      const resultContext = TestUtils.getLastValue(
        dxpLuigiContextService.contextObservable(),
      );

      expect(resultContext).toEqual(contextMessage);
    }));

    it('should provide a context promise', fakeAsync(() => {
      luigiContextService.getContextAsync = jest
        .fn()
        .mockReturnValue(Promise.resolve(contextMessage.context));

      const resultContext = TestUtils.getLastValue(
        dxpLuigiContextService.getContextAsync(),
      );

      expect(resultContext).toEqual(contextMessage.context);
    }));

    it('should provide a context synchronously', () => {
      luigiContextService.getContext = jest
        .fn()
        .mockReturnValue(contextMessage.context);
      const resultContext = dxpLuigiContextService.getContext();

      expect(resultContext).toEqual(contextMessage.context);
    });
  });

  describe('Context Service with ENV Luigi Context Override', () => {
    const luigiContextOverwriteEnv: Environment = {
      luigiContextOverwrite: {
        corge: 'grault',
        baz: {
          waldo: 'fred',
          plugh: 'thud',
        },
      },
    };
    const expectedContext: Context = {
      foo: 'bar',
      corge: 'grault',
      baz: {
        qux: 'quux',
        waldo: 'fred',
        plugh: 'thud',
      },
    };

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          MockProvider(LuigiContextServiceImpl),
          MockProvider(ENV, luigiContextOverwriteEnv),
        ],
      });

      dxpLuigiContextService = TestBed.inject(DxpLuigiContextService);
      luigiContextService = TestBed.inject(LuigiContextServiceImpl);
    });

    it('should provide a context observable merged with env', fakeAsync(() => {
      const observable = new ReplaySubject<IContextMessage>();
      luigiContextService.contextObservable = jest
        .fn()
        .mockReturnValue(observable);
      observable.next(contextMessage);

      const resultContext = TestUtils.getLastValue(
        dxpLuigiContextService.contextObservable(),
      );

      expect(resultContext).toEqual({
        ...contextMessage,
        context: expectedContext,
      });
    }));

    it('should provide a context promise merged with env', fakeAsync(() => {
      luigiContextService.getContextAsync = jest
        .fn()
        .mockReturnValue(Promise.resolve(contextMessage.context));

      const resultContext = TestUtils.getLastValue(
        dxpLuigiContextService.getContextAsync(),
      );

      expect(resultContext).toEqual(expectedContext);
    }));

    it('should provide a context merged with env synchronously', () => {
      luigiContextService.getContext = jest
        .fn()
        .mockReturnValue(contextMessage.context);

      const resultContext = dxpLuigiContextService.getContext();

      expect(resultContext).toEqual(expectedContext);
    });
  });
});
