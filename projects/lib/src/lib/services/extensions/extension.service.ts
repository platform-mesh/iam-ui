import { NodeContext } from '../../models';
import { ExtensionApolloClientService } from '../apollo';
import { IamLuigiContextService } from '../luigi';
import {
  ExtensionClass,
  GetExtensionClassForScopeResponse,
  UpdateExtensionInput,
  UpdateExtensionInputResponse,
} from './models/extension';
import { EXTENSION_CLASS_FOR_SCOPE_QUERY } from './queries/get-extensions-for-scope';
import { UPDATE_EXTENSION_INSTANCE_IN_PROJECT } from './queries/update-extension-instance';
import { Injectable } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { first, map, mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ExtensionService {
  constructor(
    private extensionApolloClientService: ExtensionApolloClientService,
    private luigiContextService: IamLuigiContextService,
  ) {}

  getExtensionClassForScope(
    extClassName: string,
    scope: string,
  ): Observable<ExtensionClass | undefined> {
    return combineLatest([
      this.extensionApolloClientService.apollo(),
      this.luigiContextService.contextObservable(),
    ]).pipe(
      first(),
      mergeMap(([apollo, data]) => {
        return apollo
          .query<GetExtensionClassForScopeResponse>({
            query: EXTENSION_CLASS_FOR_SCOPE_QUERY,
            variables: {
              tenantId: data.context.tenantid || data.context.organizationId,
              type: scope,
              context: this.createGraphqlContextObject(data.context),
              extClassName: extClassName,
              filter: undefined,
            },
            fetchPolicy: 'no-cache',
          })
          .pipe(
            map(
              (apolloResponse) =>
                apolloResponse.data?.getExtensionClassForScope,
            ),
          );
      }),
    );
  }

  updateExtensionInstanceInProject(
    updateExtensionInput: UpdateExtensionInput,
  ): Observable<string> {
    return combineLatest([
      this.extensionApolloClientService.apollo(),
      this.luigiContextService.contextObservable(),
    ]).pipe(
      first(),
      mergeMap(([apollo, data]) => {
        return apollo
          .mutate<UpdateExtensionInputResponse>({
            mutation: UPDATE_EXTENSION_INSTANCE_IN_PROJECT,
            variables: {
              tenantId: data.context.tenantid || data.context.organizationId,
              projectId: data.context.projectId,
              input: updateExtensionInput,
            },
          })
          .pipe(
            map(
              (apolloResponse) =>
                apolloResponse.data?.updateExtensionInstanceInProject || '',
            ),
          );
      }),
    );
  }

  private createGraphqlContextObject(context: NodeContext): {
    entries: { value: string; key: string }[];
  } {
    const entries = [
      {
        key: 'tenant',
        value: context.tenantid || context.organizationId,
      },
    ];

    if (context.projectId) {
      entries.push({
        key: 'project',
        value: context.projectId,
      });
    }

    return {
      entries,
    };
  }
}
