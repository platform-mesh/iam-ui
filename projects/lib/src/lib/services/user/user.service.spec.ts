import { NodeContext, User } from '../../models';
import { IamApolloClientService } from '../apollo';
import { IContextMessage, IamLuigiContextService } from '../luigi';
import { UserService } from './user.service';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ILuigiContextTypes } from '@luigi-project/client-support-angular';
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
} as unknown as NodeContext;

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

const currentUserMock: User = {
  userId: mockContext.userid,
  email: 'email',
  firstName: 'someFirstName',
  lastName: 'someLastName',
};

const usersMock = [currentUserMock, otherUserMock];

describe('UserService', () => {
  let userService: UserService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let luigiContext: BehaviorSubject<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let apolloSubject: AsyncSubject<any>;
  let userServiceSubscription: Subscription;
  let apolloResponseData: User[] | undefined = undefined;
  const limit = 2;

  beforeEach(() => {
    luigiContext = new BehaviorSubject<IContextMessage>({
      context: mockContext,
      contextType: ILuigiContextTypes.INIT,
    });
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
    userServiceSubscription = new Subscription();
  });

  afterEach(() => {
    userServiceSubscription.unsubscribe();
    apolloSubject.complete();
    luigiContext.complete();
  });

  describe('getUser', () => {
    it('should get user with current context tenantId and userId', fakeAsync(() => {
      // Arrange
      const query = jest
        .fn()
        .mockReturnValue(of({ data: { user: currentUserMock } }));
      let apolloResponseData: User;

      // Act
      userServiceSubscription = userService
        .getUser(mockContext.userid)
        .subscribe((apolloData) => (apolloResponseData = apolloData));
      apolloSubject.next({ query });
      apolloSubject.complete();
      tick();

      // Assert
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.anything() as object,
          variables: {
            tenantId: mockContext.tenantId,
            userId: mockContext.userid,
          },
        }),
      );
      // @ts-expect-error it's set
      expect(apolloResponseData).toEqual(currentUserMock);
    }));
    it('should handle empty usersConnection gracefully', fakeAsync(() => {
      // Arrange
      const query = jest
        .fn()
        .mockReturnValue(of({ data: { usersConnection: { user: [] } } }));

      // Act
      userServiceSubscription = userService
        .getUsers(limit)
        .subscribe((apolloData) => (apolloResponseData = apolloData));
      apolloSubject.next({ query } as never);
      apolloSubject.complete();
      tick();

      // Assert
      expect(apolloResponseData).toEqual([]);
    }));

    it('should handle Apollo query errors', fakeAsync(() => {
      // Arrange
      const errorSpy = jest.fn();

      // Act
      userServiceSubscription = userService.getUsers(limit).subscribe({
        next: () => {
          jest.fn();
        },
        error: errorSpy,
      });

      apolloSubject.error(new Error('some error'));
      tick();

      // Assert
      expect(errorSpy).toHaveBeenCalledWith(expect.any(Error));
      expect(errorSpy.mock.calls[0][0].message).toBe('some error');
    }));

    it('should return empty array if usersConnection.user is not an array', fakeAsync(() => {
      // Arrange
      const query = jest
        .fn()
        .mockReturnValue(
          of({ data: { usersConnection: { user: undefined } } }),
        );

      // Act
      userServiceSubscription = userService
        .getUsers(limit)
        .subscribe((apolloData) => (apolloResponseData = apolloData));
      apolloSubject.next({ query } as never);
      apolloSubject.complete();
      tick();

      // Assert
      expect(apolloResponseData).toEqual([]);
    }));

    it('should use default limit when limit is not provided', fakeAsync(() => {
      // Arrange
      const query = jest
        .fn()
        .mockReturnValue(
          of({ data: { usersConnection: { user: usersMock } } }),
        );

      // Act
      userServiceSubscription = userService
        .getUsers() // no limit passed
        .subscribe((apolloData) => (apolloResponseData = apolloData));
      apolloSubject.next({ query } as never);
      apolloSubject.complete();
      tick();

      // Assert
      expect(query).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({ limit: 100 }),
        }),
      );
      expect(apolloResponseData).toEqual(usersMock);
    }));
  });
});
