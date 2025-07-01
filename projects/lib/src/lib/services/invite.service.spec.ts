import { DxpContext, User } from '../dxp-ngx-core/models';
import { TestUtils } from '../dxp-ngx-core/test';
import { DELETE_INVITE, INVITE_USER } from '../queries/iam-queries';
import { InviteService } from './invite.service';
import { fakeAsync } from '@angular/core/testing';
import { ApolloBase } from 'apollo-angular';
import { mock } from 'jest-mock-extended';
import { of } from 'rxjs';

describe('InviteService', () => {
  const service: InviteService = new InviteService();
  const mockContext = mock<DxpContext>({
    tenantid: 'tenantId',
    projectId: 'projectId',
  });
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create invite with expected params', fakeAsync(() => {
    const mutate = jest.fn().mockReturnValue(of());
    const mockApollo = mock<ApolloBase>({ mutate });
    const user: User = {
      email: 'user-email@sap.com',
    };
    const roles = ['role-a', 'role-b'];
    service
      .invite(mockApollo, mockContext, 'project', user, roles, true)
      .subscribe();

    expect(mutate).toHaveBeenCalledWith({
      mutation: INVITE_USER,
      variables: {
        tenantId: mockContext.tenantid,
        invite: {
          email: user.email,
          entity: {
            entityType: 'project',
            entityId: mockContext.projectId,
          },
          roles,
        },
        notifyByEmail: true,
      },
    });
  }));

  it('should delete invite with expected params', fakeAsync(() => {
    const mutate = jest
      .fn()
      .mockReturnValue(of({ data: { deleteInvite: true } }));
    const mockApollo = mock<ApolloBase>({ mutate });
    const user: User = {
      email: 'user-email@sap.com',
    };
    const result = TestUtils.getLastValue(
      service.deleteInvite(mockApollo, mockContext, 'project', user),
    );

    expect(mutate).toHaveBeenCalledWith({
      mutation: DELETE_INVITE,
      variables: {
        tenantId: mockContext.tenantid,
        invite: {
          email: user.email,
          entity: {
            entityType: 'project',
            entityId: mockContext.projectId,
          },
          roles: [],
        },
      },
    });
    expect(result).toBe(true);
  }));
});
