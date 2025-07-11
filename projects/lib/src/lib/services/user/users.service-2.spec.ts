import { NodeContext, User } from '../../models';
import { IamApolloClientService } from '../apollo';
import { IContextMessage, IamLuigiContextService } from '../luigi';
import { UserService } from './user.service';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ApolloBase } from 'apollo-angular';
import { MockProvider } from 'ng-mocks';
import { AsyncSubject, BehaviorSubject, Subscription, of } from 'rxjs';

const mockContext = {
  token: 'some-token',
  tenantId: 'tenantId',
  userid: 'userId',
  entityContext: {
    project: {
      policies: [],
    },
  },
} as any as NodeContext;

const otherUserMock = {
  userId: 'notCurrentUser',
  email: 'email',
  firstName: 'someFirstName',
  lastName: 'someLastName',
  groupAssignments: [
    {
      scope: 'someOtherProject',
      group: {
        displayName: 'admin',
        technicalName: 'roleAdmin',
      },
    },
  ],
};

const currentUserMock = {
  userId: mockContext.userid,
  email: 'email',
  firstName: 'someFirstName',
  lastName: 'someLastName',
  groupAssignments: [
    {
      group: {
        displayName: 'admin',
        technicalName: 'roleAdmin',
      },
    },
    {
      scope: 'someOtherProject',
      group: {
        displayName: 'member',
        technicalName: 'projectMember',
      },
    },
  ],
};

const usersMock = [currentUserMock, otherUserMock];

describe('UsersService', () => {
  let userService: UserService;
  let luigiContext: BehaviorSubject<IContextMessage>;
  let apolloSubject: AsyncSubject<ApolloBase>;
  let userServiceSubscription: Subscription;

  beforeEach(() => {
    luigiContext = new BehaviorSubject({
      context: mockContext,
      contextType: undefined,
    } as any);
    apolloSubject = new AsyncSubject();

    TestBed.configureTestingModule({
      providers: [
        MockProvider(IamLuigiContextService, {
          contextObservable: () => luigiContext,
        }),
        MockProvider(IamApolloClientService, {
          apollo: () => apolloSubject,
        }),
      ],
    });
    userService = TestBed.inject(UserService);
  });

  afterEach(() => {
    userServiceSubscription.unsubscribe();
    apolloSubject.complete();
    luigiContext.complete();
  });

  describe('when getUsers is called', () => {
    it('should get the users with current context tenantId and passed limit', fakeAsync(() => {
      // Arrange
      const limit = 2;
      const query = jest
        .fn()
        .mockReturnValue(
          of({ data: { usersConnection: { user: usersMock } } }),
        );
      let apolloResponseData: User[];

      // Act
      userServiceSubscription = userService
        .getUsers(limit)
        .subscribe((apolloData) => (apolloResponseData = apolloData));
      apolloSubject.next({ query } as never);
      apolloSubject.complete();
      tick();

      // Assert
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.anything() as object,
          variables: {
            tenantId: mockContext.tenantId,
            limit: limit,
          },
        }),
      );
      // @ts-ignore
      expect(apolloResponseData).toEqual(usersMock);
    }));
  });
});
