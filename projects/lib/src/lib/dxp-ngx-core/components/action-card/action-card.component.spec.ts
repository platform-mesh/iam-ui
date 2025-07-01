import { ActionCardComponent } from './action-card.component';

describe('ActionCardComponent', () => {
  let component: ActionCardComponent;

  beforeEach(async () => {
    component = new ActionCardComponent();
  });

  it('should open link when clicked on action button', () => {
    const link = 'foo';
    window.open = jest.fn();

    component.openCardLink(link);

    expect(window.open).toHaveBeenCalledWith(link, '_blank');
  });
});
