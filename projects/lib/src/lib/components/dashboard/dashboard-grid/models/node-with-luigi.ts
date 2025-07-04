// This interface is used to extend the HTMLElement interface with the _luigi_node property
// which Luigi fills from the Luigi Node configuration
export interface NodeWithLuigi extends HTMLSlotElement {
  _luigi_node: {
    layoutConfig?: {
      row?: string;
      column?: string;
      order?: number;
    };
  };
}
