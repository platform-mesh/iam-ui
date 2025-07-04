import { IamLuigiContextService } from '../luigi';
import { HttpHeaders } from '@angular/common/http';
import { Injector } from '@angular/core';
import {
  Observable as ApolloObservable,
  FetchResult,
  InMemoryCache,
  Operation,
} from '@apollo/client/core';
import { ApolloLink, split } from '@apollo/client/link/core';
import { getMainDefinition } from '@apollo/client/utilities';
import { Context } from '@luigi-project/client';
import { Apollo, ApolloBase } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { print } from 'graphql';
import { Client, ClientOptions, createClient } from 'graphql-sse';
import { Observable, ReplaySubject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

class SSELink extends ApolloLink {
  private client: Client;

  constructor(options: ClientOptions) {
    super();
    this.client = createClient(options);
  }

  public override request(operation: Operation): ApolloObservable<FetchResult> {
    return new ApolloObservable((sink) => {
      return this.client.subscribe<FetchResult>(
        { ...operation, query: print(operation.query) },
        {
          next: (value) => {
            sink.next(value as FetchResult);
          },
          complete: sink.complete.bind(sink),
          error: sink.error.bind(sink),
        },
      );
    });
  }
}

export abstract class BaseApolloClientService {
  private apolloClient = new ReplaySubject<ApolloBase>(1);
  protected constructor(
    injector: Injector,
    private apolloClientName: string,
  ) {
    const luigiContextService = injector.get(IamLuigiContextService);
    const apolloInternal = injector.get(Apollo);
    const httpLink = injector.get(HttpLink);

    apolloInternal.createNamed(this.apolloClientName, {
      cache: new InMemoryCache(),
    });

    luigiContextService
      .contextObservable()
      .pipe(
        map((c) => c.context),
        filter((c) => !!c.token),
      )
      .subscribe((luigiContext) => {
        const authPayload = {
          authorization: `Bearer ${luigiContext.token}`,
        };

        const httpAuthHeader = new HttpHeaders(authPayload);

        const httpUrl = new URL(this.getApiUrl(luigiContext));
        const clientLink = split(
          ({ query }) => {
            const definition = getMainDefinition(query);
            return (
              definition.kind === 'OperationDefinition' &&
              definition.operation === 'subscription'
            );
          },
          new SSELink({
            url: httpUrl.toString(),
            headers: authPayload,
          }),
          httpLink.create({
            uri: httpUrl.toString(),
            headers: httpAuthHeader,
          }),
        );

        const apolloClient = apolloInternal.use(this.apolloClientName);
        apolloClient.client.setLink(clientLink);
        this.apolloClient.next(apolloClient);
      });
  }

  public apollo(): Observable<ApolloBase> {
    return this.apolloClient;
  }

  protected abstract getApiUrl(luigiContext: Context): string;
}
