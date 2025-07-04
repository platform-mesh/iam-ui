import { User } from '../../models';
import { IamApolloClientService } from '../apollo';
import { IamLuigiContextService } from '../luigi';
import { UserService } from './user.service';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MockProvider } from 'ng-mocks';
import { AsyncSubject, BehaviorSubject, Subscription, of } from 'rxjs';

const mockContext = {
  token: 'some-token',
  tenantid: 'tenantId',
  userid: 'userId',
  entityContext: {
    project: {
      policies: [],
    },
  },
};

const currentUserMock: User = {
  userId: mockContext.userid,
  email: 'email',
  firstName: 'someFirstName',
  lastName: 'someLastName',
};

describe('UserService', () => {
  let userService: UserService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let luigiContext: BehaviorSubject<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let apolloSubject: AsyncSubject<any>;
  let userServiceSubscription: Subscription;

  beforeEach(() => {
    luigiContext = new BehaviorSubject({ context: mockContext });
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
            tenantId: mockContext.tenantid,
            userId: mockContext.userid,
          },
        }),
      );
      // @ts-expect-error it's set
      expect(apolloResponseData).toEqual(currentUserMock);
    }));
  });
});
