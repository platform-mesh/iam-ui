import { LuigiClient } from '../luigi';
import { Injectable } from '@angular/core';

interface SearchResultItemLink {
  url: string;
  external: boolean;
}

interface SearchResultItem {
  displayName: string;
  link?: SearchResultItemLink;
}

@Injectable({
  providedIn: 'root',
})
export class RoutingService {
  constructor(private luigiClient: LuigiClient) {}

  /**
   * Performs navigation depending on the link given in resultItem.
   * If the link is external, the resource will be opened in a new browser tab.
   * If the link is internal i.e. a relative path to a resource within DXP (e.g. a project), Luigi will be used to perform the navigation.
   *
   * @param resultItem
   */
  openLink(resultItem: SearchResultItem) {
    if (resultItem.link?.external) {
      window.open(resultItem.link?.url, '_blank');
    } else {
      this.luigiClient.linkManager().navigate(resultItem.link?.url || '');
    }
  }
}
