import { ERROR_MUST_HAVE_AT_LEAST_ONE_ROLE } from '../members-page/string-variables';
import { CdkScrollable } from '@angular/cdk/scrolling';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ComboboxComponent,
  ContentDensityDirective,
  InitialFocusDirective,
  MultiComboboxSelectionChangeEvent,
  PopoverComponent,
} from '@fundamental-ngx/core';
import { AvatarComponent } from '@fundamental-ngx/core/avatar';
import {
  BarComponent,
  BarElementDirective,
  BarRightDirective,
} from '@fundamental-ngx/core/bar';
import { ButtonComponent } from '@fundamental-ngx/core/button';
import {
  DynamicPageComponent,
  DynamicPageContentComponent,
  DynamicPageFooterComponent,
  DynamicPageHeaderComponent,
} from '@fundamental-ngx/core/dynamic-page';
import {
  FormItemComponent,
  FormLabelComponent,
  FormMessageComponent,
} from '@fundamental-ngx/core/form';
import {
  ListBylineDirective,
  ListComponent,
  ListContentDirective,
  ListItemComponent,
  ListMessageDirective,
  ListThumbnailDirective,
  ListTitleDirective,
} from '@fundamental-ngx/core/list';
import { MultiComboboxComponent } from '@fundamental-ngx/core/multi-combobox';
import {
  TableBodyDirective,
  TableCellDirective,
  TableComponent,
  TableHeaderDirective,
  TableRowDirective,
} from '@fundamental-ngx/core/table';
import {
  AvatarComponent as IAMAvatarComponent,
  LuigiClient,
  Member,
  MemberService,
  NotificationService,
  Role,
  RolesTechnicalName,
  User,
} from '@platform-mesh/iam-lib';
import { BehaviorSubject, Subscription, debounceTime, forkJoin } from 'rxjs';

export type DropDownValue =
  | { user: User }
  | { email: string }
  | { noData: true };

export const MAX_USERS_SHOWN = 5;

@Component({
  selector: 'app-add-member-dialog',
  imports: [
    DynamicPageComponent,
    DynamicPageHeaderComponent,
    DynamicPageContentComponent,
    CdkScrollable,
    FormItemComponent,
    FormLabelComponent,
    ComboboxComponent,
    ContentDensityDirective,
    FormsModule,
    ListMessageDirective,
    FormMessageComponent,
    ListThumbnailDirective,
    AvatarComponent,
    ListContentDirective,
    ListTitleDirective,
    ListBylineDirective,
    IAMAvatarComponent,
    TableComponent,
    TableHeaderDirective,
    TableRowDirective,
    TableCellDirective,
    TableBodyDirective,
    ListComponent,
    ListItemComponent,
    MultiComboboxComponent,
    ButtonComponent,
    DynamicPageFooterComponent,
    BarComponent,
    BarRightDirective,
    BarElementDirective,
    InitialFocusDirective,
  ],
  templateUrl: './add-member-dialog.component.html',
  styleUrl: './add-member-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddMemberDialogComponent implements OnInit, OnDestroy {
  searchInput: BehaviorSubject<string> = new BehaviorSubject<string>('');

  availableRoles: Role[] = [];
  dropDownValues: DropDownValue[] = [];
  filteredUsersCollectionLength?: number;
  selectedMembers: Member[] = [];
  selectedInvitees: Member[] = [];
  currentInput = '';
  defaultRole?: Role;
  touched = false;
  emailDomains: string[] = [];
  currentEntity?: string;
  private subscriptions = new Subscription();

  constructor(
    private luigiClient: LuigiClient,
    private memberService: MemberService,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService,
  ) {}

  @ViewChild('typeahead')
  typeahead!: PopoverComponent;

  async ngOnInit() {
    this.subscriptions.add(
      this.searchInput.pipe(debounceTime(500)).subscribe((searchTerm) => {
        this.filter(searchTerm);
      }),
    );

    this.memberService.roles().subscribe((roles) => {
      this.availableRoles = roles;
      this.defaultRole = this.availableRoles.find(
        (roles) => roles.id === (RolesTechnicalName.MEMBER as string),
      );
    });
  }

  onRoleChange(
    event: MultiComboboxSelectionChangeEvent,
    potentialMember: Member,
  ) {
    if ((event.selectedItems as Role[]).length > 0) {
      potentialMember.roles = event.selectedItems as Role[];
    } else {
      this.notificationService.openErrorStrip(
        ERROR_MUST_HAVE_AT_LEAST_ONE_ROLE,
      );
      event.source.setValue(potentialMember.roles);
    }
  }

  selectedRoles(member: Member): Role[] {
    return (
      this.availableRoles.filter((r) =>
        member.roles.map((mr) => mr.id).includes(r.id),
      ) || []
    );
  }

  addMembers(): void {
    this.touched = true;
    const input = this.selectedMembers.concat(this.selectedInvitees);
    if (!input.length) {
      return;
    }

    let roleSettingObservables = input.map((member) =>
      this.memberService.assignRolesToUser(member.user, member.roles),
    );

    forkJoin(roleSettingObservables).subscribe({
      next: (results) => {
        const addedMembers = results.filter(Boolean);
        if (addedMembers.length > 0) {
          this.closeDialogSuccess(addedMembers as any);
        } else {
          this.closeDialogError();
        }
      },
      error: (error: Error) => {
        this.closeDialogError(error.toString());
      },
    });
  }

  public deleteMemberFromList(userId: string | undefined): void {
    if (!userId) {
      return;
    }
    const index = this.selectedMembers.findIndex(
      (ga) => ga.user.userId === userId,
    );
    if (index < 0) {
      return;
    }
    this.selectedMembers.splice(index, 1);
  }

  public deleteInviteeFromList(email: string | undefined): void {
    if (!email) {
      return;
    }
    const index = this.selectedInvitees.findIndex(
      (ga) => ga.user.email === email,
    );
    if (index < 0) {
      return;
    }
    this.selectedInvitees.splice(index, 1);
  }

  public inputChange(searchTerm: string): void {
    this.searchInput.next(searchTerm?.toLocaleLowerCase());
  }

  public filter(searchTerm: string): void {
    const mapUser = (member: Member): DropDownValue => {
      return { user: member.user };
    };

    if (!searchTerm || searchTerm.length === 0) {
      this.dropDownValues = [];
      this.filteredUsersCollectionLength = 0;
      this.cdr.detectChanges();
      return;
    }

    this.memberService.knownUsers().subscribe({
      next: (response) => {
        this.filteredUsersCollectionLength = response.pageInfo.totalCount;
        if (response.users.length > 0) {
          if (this.isEmail(searchTerm)) {
            const emailMatches = response.users.filter(
              (member) => member.user.email === searchTerm,
            );
            this.filteredUsersCollectionLength = emailMatches.length;
            this.dropDownValues =
              emailMatches.length === 0
                ? [{ email: searchTerm }]
                : emailMatches.map(mapUser);
          } else {
            this.dropDownValues = response.users.map(mapUser);
          }
        } else if (this.isEmail(searchTerm)) {
          this.dropDownValues = [{ email: searchTerm }];
        } else {
          this.dropDownValues = [{ noData: true }];
        }
        this.cdr.detectChanges();
      },
    });
  }

  isEmail(email: string): boolean {
    if (!email) return false;

    const [localPart, domain] = email.split('@');
    if (!localPart || !domain || localPart.length > 64) return false;

    const unquotedLocalPartRegex =
      /^[a-zA-Z0-9!#$%&'*+\-/=?^_`{|}~]+(?:\.[a-zA-Z0-9!#$%&'*+\-/=?^_`{|}~]+)*$/;

    const quotedLocalPartRegex =
      /^"(?:[\x20\t\x21\x23-\x5B\x5D-\x7E]|\\[\x20\t\x21-\x7E])*"$/;

    const isQuoted = quotedLocalPartRegex.test(localPart);
    const isUnquoted = unquotedLocalPartRegex.test(localPart);

    if (!isQuoted && !isUnquoted) return false;

    return this.isAllowedDomain(email);
  }

  private isAllowedDomain(email: string): boolean {
    return (
      !this.emailDomains ||
      this.emailDomains.length === 0 ||
      !!this.emailDomains?.some((x) => email.endsWith(`@${x}`))
    );
  }

  fakeFilterFunc(content: User[]): User[] {
    return content;
  }

  displayFunc(user: User): string {
    if (user) {
      return user.firstName
        ? `${user.firstName} ${user.lastName}`
        : user.userId || '';
    } else {
      return '';
    }
  }

  itemClicked(value: DropDownValue): void {
    if ('email' in value) {
      const isUserAlreadySelected = this.selectedInvitees.some(
        (ga) => ga.user.email === value.email,
      );
      if (!isUserAlreadySelected) {
        this.selectedInvitees.push({
          user: {
            email: value.email,
            userId: '',
          },
          roles: this.defaultRole ? [this.defaultRole] : [],
        });
      }
    }

    if ('user' in value) {
      const isUserAlreadySelected = this.selectedMembers.some(
        (ga) => ga.user.userId === value.user.userId,
      );
      if (!isUserAlreadySelected) {
        this.selectedMembers.push({
          user: value.user,
          roles: this.defaultRole ? [this.defaultRole] : [],
        });
      }
    }

    this.clearSearch();
  }

  clearSearch() {
    this.filter('');
    this.currentInput = '';
  }

  private closeDialogSuccess(addedMembers: User[]): void {
    this.luigiClient.linkManager().goBack({ addedMembers });
  }

  closeDialogError(reason?: string): void {
    this.luigiClient.linkManager().goBack({ error: reason });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  hasError() {
    return (
      !this.selectedMembers.length &&
      !this.selectedInvitees.length &&
      this.touched
    );
  }

  get showByline(): boolean {
    return this.dropDownValues.length > 0 && 'email' in this.dropDownValues[0]
      ? false
      : true;
  }
}
