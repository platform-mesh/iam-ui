import { TestUtils } from '../../test';
import { ExtensionApolloClientService } from '../apollo';
import { IamLuigiContextService } from '../luigi';
import { ExtensionService } from './extension.service';
import { ExtensionInstance, ScopeType } from './models/extension';
import { EXTENSION_CLASS_FOR_SCOPE_QUERY } from './queries/get-extensions-for-scope';
import { UPDATE_EXTENSION_INSTANCE_IN_PROJECT } from './queries/update-extension-instance';
import { WATCH_EXTENSION_INSTANCE } from './queries/watch-extension-instance';
import { fakeAsync } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';
import { mock } from 'jest-mock-extended';
import { MockService } from 'ng-mocks';
import { AsyncSubject, of } from 'rxjs';

const extClassForScopeResponse = {
  data: {
    getExtensionClassForScope: 'baz',
    updateExtensionInstanceInProject: 'update',
    watchExtensionInstance: mock<ExtensionInstance>(),
  },
};

const extClassForScopeRequest = mock<Apollo>({
  query: jest.fn().mockReturnValue(of(extClassForScopeResponse)),
  mutate: jest.fn().mockReturnValue(of(extClassForScopeResponse)),
  subscribe: jest.fn().mockReturnValue(of(extClassForScopeResponse)),
});

const context = {
  portalContext: undefined,
  tenantid: '1',
  projectId: 'project',
  token: '2',
  userid: '3',
  entityContext: undefined,
};

let apolloSubject = new AsyncSubject<Apollo>();

function nextData(responseMock: Apollo) {
  apolloSubject.next(responseMock);
  apolloSubject.complete();
}

describe('ExtensionService', () => {
  let service: ExtensionService;
  let luigiContextService: IamLuigiContextService;
  let extensionApolloClientService: ExtensionApolloClientService;

  beforeEach(() => {
    apolloSubject = new AsyncSubject();
    extensionApolloClientService = MockService(ExtensionApolloClientService, {
      apollo: jest.fn().mockReturnValue(apolloSubject),
    });
    luigiContextService = MockService(IamLuigiContextService, {
      contextObservable: jest.fn().mockReturnValue(of({ context })),
    });

    service = new ExtensionService(
      extensionApolloClientService,
      luigiContextService,
    );
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should get a extension class for scope', fakeAsync(() => {
    nextData(extClassForScopeRequest);

    const result = TestUtils.getLastValue(
      service.getExtensionClassForScope('foo', 'bar'),
    );
    expect(extensionApolloClientService.apollo).toHaveBeenCalled();
    expect(extClassForScopeRequest.query).toHaveBeenCalledWith({
      query: EXTENSION_CLASS_FOR_SCOPE_QUERY,
      variables: {
        tenantId: context.tenantid,
        type: 'bar',
        context: {
          entries: [
            {
              key: 'tenant',
              value: '1',
            },
            {
              key: 'project',
              value: 'project',
            },
          ],
        },
        extClassName: 'foo',
        filter: undefined,
      },
      fetchPolicy: 'no-cache',
    });
    expect(result).toEqual('baz');
  }));

  it('should update an extension instance', fakeAsync(() => {
    nextData(extClassForScopeRequest);

    const input = {
      extensionClass: {
        id: 'foo',
        scope: ScopeType.GLOBAL,
      },
      installationData: { bar: 'blub' },
      instanceId: 'instanceId',
    };
    const result = TestUtils.getLastValue(
      service.updateExtensionInstanceInProject(input),
    );
    expect(extensionApolloClientService.apollo).toHaveBeenCalled();
    expect(extClassForScopeRequest.mutate).toHaveBeenCalledWith({
      mutation: UPDATE_EXTENSION_INSTANCE_IN_PROJECT,
      variables: {
        tenantId: context.tenantid,
        projectId: context.projectId,
        input: input,
      },
    });
    expect(result).toEqual('update');
  }));
});
