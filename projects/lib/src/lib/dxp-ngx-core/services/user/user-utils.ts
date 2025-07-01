import { User } from '../../models';

export class UserUtils {
  static getNameOrId = (user: User): string =>
    this.getNameOrDefault(user, user.userId || user.email || '');

  static getNameOrDefault = <T>(user: User, defaultValue: T): string | T => {
    const userHasName = user?.firstName || user?.lastName;
    if (userHasName) {
      const name = `${user.firstName || ''} ${user.lastName || ''}`;
      return name.trim();
    }
    return defaultValue;
  };
}
