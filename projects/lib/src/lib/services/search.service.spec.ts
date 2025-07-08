import { GrantedUsers } from '../authorization';
import { NodeContext } from '../models';
import { IContextMessage, IamLuigiContextService } from '../services';
import { MemberService } from './member.service';
import {
  SearchService,
  SuggestedUser,
  SuggestedUserResponse,
} from './search.service';
import { HttpClient } from '@angular/common/http';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ILuigiContextTypes } from '@luigi-project/client-support-angular';
import { mock } from 'jest-mock-extended';
import { MockProvider } from 'ng-mocks';
import { BehaviorSubject, Subject, of } from 'rxjs';

const mockUserA = {
  userId: 'userAId',
  email: 'hundekuchen@sap.com',
  firstName: 'userAFirstName',
  lastName: 'userALastName',
};
const mockUserB = {
  userId: 'userBId',
  email: 'hundekuchenb@sap.com',
  firstName: 'userBFirstName',
  lastName: 'userBLastName',
};
const mockContext = {
  token: 'some-token',
  tenantid: 'tenantid',
  teamId: 'teamId',
  projectId: 'projectId',
  portalContext: {
    userSuggestSearchServiceApiUrl: 'https://usersearch.service.url/suggest',
  },
} as any as NodeContext;

const suggestSearchResponse: SuggestedUserResponse = {
  docs: [mock<SuggestedUser>(mockUserA), mock<SuggestedUser>(mockUserB)],
  numFound: 2,
  responseSize: 2,
  status: 200,
};

describe('SearchService', () => {
  let searchService: SearchService;
  let luigiContextSubject: BehaviorSubject<IContextMessage>;

  let usersOfEntitySubject: Subject<GrantedUsers>;
  let mockHttpClient: HttpClient;

  beforeEach(() => {
    luigiContextSubject = new BehaviorSubject<IContextMessage>({
      context: mockContext,
      contextType: ILuigiContextTypes.INIT,
    });
    usersOfEntitySubject = new Subject<GrantedUsers>();

    TestBed.configureTestingModule({
      providers: [
        MockProvider(MemberService, {
          usersOfEntity: jest.fn().mockReturnValue(usersOfEntitySubject),
        }),
        MockProvider(IamLuigiContextService, {
          contextObservable: () => luigiContextSubject,
        }),
        MockProvider(HttpClient, {
          get: jest.fn().mockReturnValue(of(suggestSearchResponse)),
        }),
      ],
    });
    searchService = TestBed.inject(SearchService);
    mockHttpClient = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    luigiContextSubject.complete();
  });

  it('should call the "suggest" endpoint of the user search service and return response', fakeAsync(() => {
    let response: SuggestedUserResponse | null = {
      docs: [],
      numFound: 0,
      responseSize: 0,
      status: 0,
    };
    searchService.getSuggestedUsers('placeholder', 5).subscribe((result) => {
      response = result;
    });

    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(mockHttpClient.get).toHaveBeenCalledWith(
      'https://usersearch.service.url/suggest?fuzzy=true&fq=tenant%3Atenantid&limit=5&q=placeholder',
      { headers: { Authorization: 'Bearer some-token' } },
    );
    expect(response).toEqual(suggestSearchResponse);
  }));

  it('should only suggest users that are not account members yet', fakeAsync(() => {
    let response: SuggestedUserResponse = {
      docs: [],
      numFound: 0,
      responseSize: 0,
      status: 0,
    };
    searchService
      .getSuggestedUsersForAccountWithFga('placeholder', 5)
      .subscribe((result) => {
        response = result;
      });

    usersOfEntitySubject.next(
      mock<GrantedUsers>({
        users: [{ user: mockUserA, roles: [] }],
        pageInfo: {
          totalCount: 0,
        },
      }),
    );
    searchService.getSuggestedUsers = jest
      .fn()
      .mockReturnValue(of(suggestSearchResponse));

    tick();

    const expectedResult: SuggestedUserResponse = {
      docs: [mock<SuggestedUser>(mockUserB)],
      numFound: 1,
      responseSize: 1,
      status: 200,
    };
    expect(response).toMatchObject(expectedResult);
  }));
});
