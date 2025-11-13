/**
 * Provides the technical names for groups a user can be assigned to.
 * The technical name is required to retrieve the actual group and its policies.
 */

export enum Groups {
  PROJECT_OWNER = 'projectAdmins',
  PROJECT_MEMBER = 'projectMembers',
}

export class PolicyObject {
  [key: string]: boolean;

  constructor() {
    Object.keys(this).forEach((key) => {
      this[key] = false;
    });
  }
}
