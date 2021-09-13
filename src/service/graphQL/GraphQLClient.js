import { ApolloClient, InMemoryCache } from '@apollo/client';
/* eslint-disable import/prefer-default-export */
export const clientHMAC = new ApolloClient({
  uri: 'http://localhost:9088/register',
  // uri: 'https://register-kine.ai/register', // tenant-regisration service
  cache: new InMemoryCache(),
});
