import { GrantedUsers } from '../authorization';
import { NodeContext } from '../models';
import { IContextMessage, IamLuigiContextService } from '../services';
import { MemberService } from './member.service';
import {
  SearchService,
  SuggestedUser,
  SuggestedUserResponse,
} from './search.service';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
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
  tenantId: 'tenantId',
  teamId: 'teamId',
  projectId: 'projectId',
  portalContext: {
    userSuggestSearchServiceApiUrl: 'https://usersearch.service.url/suggest',
  },
} as any as NodeContext;

describe('SearchService', () => {
  let searchService: SearchService;
  let luigiContextSubject: BehaviorSubject<IContextMessage>;

  let memberService: MemberService;

  let usersOfEntitySubject: Subject<GrantedUsers>;
  let httpMock: HttpTestingController;
  let suggestSearchResponse: SuggestedUserResponse;

  beforeEach(() => {
    luigiContextSubject = new BehaviorSubject<IContextMessage>({
      context: mockContext,
      contextType: ILuigiContextTypes.INIT,
    });
    usersOfEntitySubject = new Subject<GrantedUsers>();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        SearchService,
        MockProvider(MemberService, {
          usersOfEntity: jest.fn().mockReturnValue(usersOfEntitySubject),
        }),
        MockProvider(IamLuigiContextService, {
          contextObservable: () => luigiContextSubject,
        }),
      ],
    });
    searchService = TestBed.inject(SearchService);
    httpMock = TestBed.inject(HttpTestingController);
    memberService = TestBed.inject(MemberService);
  });

  afterEach(() => {
    luigiContextSubject.complete();
    httpMock.verify();
  });

  it('should call the "suggest" endpoint of the user search service and return response', fakeAsync(() => {
    let response: SuggestedUserResponse = {} as SuggestedUserResponse;
    searchService.getSuggestedUsers('placeholder', 5).subscribe((result) => {
      if (result) {
        response = result;
      }
    });

    const req = httpMock.expectOne((request) => {
      return (
        request.urlWithParams ===
        'https://usersearch.service.url/suggest?fuzzy=true&fq=tenant%3AtenantId&limit=5&q=placeholder'
      );
    });

    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer some-token');

    req.flush({ docs: [], numFound: 0, responseSize: 0, status: 200 });
    tick();

    expect(response?.numFound).toBe(0);
  }));

  it('should use default limit=10 when not provided', fakeAsync(() => {
    let response: SuggestedUserResponse = {} as SuggestedUserResponse;
    searchService.getSuggestedUsers('some-search').subscribe((result) => {
      if (result) {
        response = result;
      }
    });

    const req = httpMock.expectOne((request) => {
      return (
        request.urlWithParams ===
        'https://usersearch.service.url/suggest?fuzzy=true&fq=tenant%3AtenantId&limit=10&q=some-search'
      );
    });

    req.flush({ docs: [], numFound: 0, responseSize: 0, status: 200 });
    tick();

    tick();

    expect(response?.numFound).toBe(0);
  }));

  describe('when user search service returns response', () => {
    let response: SuggestedUserResponse | undefined;

    beforeEach(() => {
      suggestSearchResponse = {
        docs: [mock<SuggestedUser>(mockUserA), mock<SuggestedUser>(mockUserB)],
        numFound: 2,
        responseSize: 2,
        status: 200,
      };
      searchService.getSuggestedUsers = jest
        .fn()
        .mockReturnValue(of(suggestSearchResponse));
      response = undefined;
    });

    it('should use default limit=10 when not provided (getSuggestedUsersForAccountWithFga)', fakeAsync(() => {
      (memberService.usersOfEntity as jest.Mock).mockReturnValue(
        of({ users: [] }),
      );

      const searchServiceSpy = jest.spyOn(searchService, 'getSuggestedUsers');

      searchService
        .getSuggestedUsersForAccountWithFga('some-search')
        .subscribe();
      tick();

      expect(searchServiceSpy).toHaveBeenCalledWith('some-search', 10);
    }));

    it('should return empty docs if all suggested users are already members', fakeAsync(() => {
      const allMembers = [mockUserA, mockUserB].map((user) => ({
        user,
        roles: [],
      }));

      (memberService.usersOfEntity as jest.Mock).mockReturnValue(
        of({ users: allMembers }),
      );

      searchService
        .getSuggestedUsersForAccountWithFga('search', 2)
        .subscribe((r) => (response = r));
      tick();

      expect(response?.docs).toEqual([]);
      expect(response?.numFound).toBe(0);
      expect(response?.responseSize).toBe(0);
    }));

    it('should return all suggested users if there are no account members', fakeAsync(() => {
      (memberService.usersOfEntity as jest.Mock).mockReturnValue(
        of({ users: [] }),
      );

      searchService
        .getSuggestedUsersForAccountWithFga('search', 2)
        .subscribe((r) => (response = r));
      tick();

      expect(response?.docs).toEqual(suggestSearchResponse.docs);
      expect(response?.numFound).toBe(suggestSearchResponse.numFound);
      expect(response?.responseSize).toBe(suggestSearchResponse.responseSize);
    }));

    it('should filter out only the users that are already members', fakeAsync(() => {
      const members = [{ user: mockUserA, roles: [] }];

      (memberService.usersOfEntity as jest.Mock).mockReturnValue(
        of({ users: members }),
      );
      jest
        .spyOn(searchService, 'getSuggestedUsers')
        .mockReturnValue(of(suggestSearchResponse));

      searchService
        .getSuggestedUsersForAccountWithFga('search', 2)
        .subscribe((r) => (response = r));
      tick();

      expect(response?.docs[0].userId).toBe(mockUserB.userId);
      expect(response?.numFound).toBe(1);
      expect(response?.responseSize).toBe(1);
    }));

    it('should return all suggested users if accountMembers.users is undefined', fakeAsync(() => {
      (memberService.usersOfEntity as jest.Mock).mockReturnValue(
        of({ users: undefined }),
      );

      searchService
        .getSuggestedUsersForAccountWithFga('search', 2)
        .subscribe((r) => (response = r));
      tick();

      expect(response?.docs).toEqual(suggestSearchResponse.docs);
      expect(response?.numFound).toBe(suggestSearchResponse.numFound);
      expect(response?.responseSize).toBe(suggestSearchResponse.responseSize);
    }));
  });
});
