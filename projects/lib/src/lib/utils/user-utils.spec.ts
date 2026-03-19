import { UserUtils } from './user-utils';
import { User } from '@platform-mesh/iam-lib';
import { mock } from 'vitest-mock-extended';

describe('UserUtils', () => {
  describe('when getNameOrId is called', () => {
    describe.each([
      {
        firstName: 'Jonathan',
        lastName: 'Davis',
        userId: 'I00000',
        expected: 'Jonathan Davis',
      },
      {
        firstName: '',
        lastName: '',
        userId: 'I00000',
        expected: 'I00000',
      },
      {
        lastName: 'Davis',
        userId: 'I00000',
        expected: 'Davis',
      },
      {
        firstName: 'Jonathan',
        userId: 'I00000',
        expected: 'Jonathan',
      },
      {
        userId: 'I00000',
        expected: 'I00000',
      },
      {
        email: 'test@sap.com',
        expected: 'test@sap.com',
      },
      {
        expected: '',
      },
    ])(
      'with user having firstName=$firstName, lastName=$lastName and userId=$userId',
      ({ firstName, lastName, userId, email, expected }) => {
        const mockUser = mock<User>({
          userId,
          email,
          firstName,
          lastName,
        });

        it(`should return ${expected.toString()}`, () => {
          const resultName = UserUtils.getNameOrId(mockUser);

          expect(resultName).toEqual(expected);
        });
      },
    );
  });

  describe('when getNameOrDefault is called', () => {
    describe.each([
      {
        firstName: 'Jonathan',
        lastName: 'Davis',
        defaultValue: 'hee-macarena-ay',
        expected: 'Jonathan Davis',
      },
      {
        firstName: '',
        lastName: '',
        defaultValue: 'hee-macarena-ay',
        expected: 'hee-macarena-ay',
      },
      {
        lastName: 'Davis',
        defaultValue: 'hee-macarena-ay',
        expected: 'Davis',
      },
      {
        firstName: 'Jonathan',
        defaultValue: 'hee-macarena-ay',
        expected: 'Jonathan',
      },
      {
        defaultValue: '',
        expected: '',
      },
      {
        defaultValue: 1,
        expected: 1,
      },
      {
        defaultValue: undefined,
        expected: undefined,
      },
    ])(
      'with user having firstName=$firstName, lastName=$lastName and default=$defaultValue',
      ({ firstName, lastName, defaultValue, expected }) => {
        const mockUser = mock<User>({
          firstName,
          lastName,
        });

        it(`should return ${expected}`, () => {
          const resultName = UserUtils.getNameOrDefault(mockUser, defaultValue);

          expect(resultName).toEqual(expected);
        });
      },
    );
  });
});
