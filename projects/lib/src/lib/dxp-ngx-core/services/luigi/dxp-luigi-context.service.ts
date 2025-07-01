import { DxpContext, ENV, Environment } from '../../models';
import { Injectable, Injector } from '@angular/core';
import {
  ILuigiContextTypes,
  LuigiContextService,
  LuigiContextServiceImpl,
} from '@luigi-project/client-support-angular';
import deepmerge from 'deepmerge';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface DxpIContextMessage {
  contextType: ILuigiContextTypes;
  context: DxpContext;
}

@Injectable({
  providedIn: 'root',
})
export class DxpLuigiContextService extends LuigiContextService {
  private luigiContextService: LuigiContextServiceImpl;
  private readonly env: Environment;

  constructor(private injector: Injector) {
    super();
    this.luigiContextService = injector.get(LuigiContextServiceImpl);
    this.env = injector.get(ENV, {});
  }

  /**
   *
   * Can be used to set the context manually, not to be used in iframe based MFEs, the context is always set automatically.
   * This method can be used to set the context in WebComponent based MFEs from the AppComponent.
   *
   * @param context the context to be set
   */
  setContext(context: DxpContext): void {
    this.luigiContextService.addListener(ILuigiContextTypes.UPDATE, context);
  }

  getContext(): DxpContext {
    if (!this.env.luigiContextOverwrite) {
      return this.luigiContextService.getContext() as DxpContext;
    }

    return deepmerge(
      this.luigiContextService.getContext(),
      this.env.luigiContextOverwrite,
    ) as any;
  }

  getContextAsync(): Promise<DxpContext> {
    if (!this.env.luigiContextOverwrite) {
      return this.luigiContextService.getContextAsync() as Promise<DxpContext>;
    }

    return this.luigiContextService
      .getContextAsync()
      .then((context) =>
        deepmerge(
          context as DxpContext,
          this.env.luigiContextOverwrite as Partial<DxpContext>,
        ),
      );
  }

  contextObservable(): Observable<DxpIContextMessage> {
    if (!this.env.luigiContextOverwrite) {
      return this.luigiContextService.contextObservable() as Observable<DxpIContextMessage>;
    }

    return this.luigiContextService.contextObservable().pipe(
      map((context) => {
        const mergedContext = deepmerge(
          context.context as DxpContext,
          this.env.luigiContextOverwrite as Partial<DxpContext>,
        );
        return { contextType: context.contextType, context: mergedContext };
      }),
    );
  }
}
