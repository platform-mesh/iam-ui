import { ConfirmationMessagesService } from './confirmation-messages.service';
import { TestBed } from '@angular/core/testing';
import { Entity } from '@dxp/iam-lib';

describe('ConfirmationMessagesService', () => {
  let service: ConfirmationMessagesService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [] });
    service = new ConfirmationMessagesService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('when getAddedMembersMessage is called', () => {
    // eslint-disable-next-line jest/valid-title
    describe.each([
      {
        addMembersData: {
          addedMembers: [
            {
              firstName: 'Leidy',
              lastName: 'Mamacita',
            },
          ],
        },
        expected: 'Leidy Mamacita has been added to the project.',
      },
      {
        addMembersData: {
          addedMembers: [
            {
              firstName: 'Leidy',
              lastName: 'Mamacita',
            },
            {
              firstName: 'Marcela',
              lastName: 'Mamacita',
            },
          ],
        },
        expected: '2 members have been added to the project.',
      },
    ])('', ({ addMembersData, expected }) => {
      it(`should return ${expected.toString()}`, () => {
        const message = service.getAddedMembersMessage(
          addMembersData,
          Entity.PROJECT,
        );

        expect(message).toEqual(expected);
      });
    });
  });
});
