import { clientHMAC } from './GraphQLClient';
import {
  registerUser,
  verifyEmail,
  resendEmail,
} from './KineQueries';
/* eslint-disable import/prefer-default-export */
export const GraphQueries = {
  verifyEmail: (emailAddress, hmac, authResolver) => clientHMAC.query({
    query: verifyEmail,
    variables: {
      emailAddress,
    },
    context: {
      headers: {
        KineToken: hmac,
        KineAuthResolver: authResolver,
      },
    },
    fetchPolicy: 'no-cache',
  }).then((response) => response).then((response) => (response)).catch(
    (error) => ({ data: error }),
  ),
  resendEmail: (emailAddress, hmac, authResolver) => clientHMAC.mutate({
    mutation: resendEmail,
    variables: {
      emailAddress,
    },
    context: {
      headers: {
        KineToken: hmac,
        KineAuthResolver: authResolver,
      },
    },
    fetchPolicy: 'no-cache',
  }).then((response) => response).then((response) => (response)).catch(
    (error) => ({ data: error }),
  ),
  registerUser: (
    fname, lname, email, password, trialType, hmac, authResolver,
  ) => clientHMAC.mutate({
    mutation: registerUser,
    variables: {
      firstName: fname,
      lastName: lname,
      emailAddress: email,
      pwd: password,
      trial: trialType,
    },
    context: {
      headers: {
        KineToken: hmac,
        KineAuthResolver: authResolver,
      },
    },
    fetchPolicy: 'no-cache',
  }).then((response) => response).then((response) => (response)).catch(
    (error) => ({ data: error }),
  ),
};
