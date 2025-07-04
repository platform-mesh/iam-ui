import { User } from '../../../../models';

export interface ListItemBase {
  type: 'ListItemWithImage' | 'ListItemWithUser' | 'ListItemWithIcon';
  title: string;
  link?: string;
  byline?: string;
  testId?: string;
}

export interface ListItemWithImage extends ListItemBase {
  type: 'ListItemWithImage';
  image: string;
}

export interface ListItemWithUser extends ListItemBase {
  type: 'ListItemWithUser';
  user: User;
}

export interface ListItemWithIcon extends ListItemBase {
  type: 'ListItemWithIcon';
  icon: string;
}

export type ListItem = ListItemWithImage | ListItemWithUser | ListItemWithIcon;
