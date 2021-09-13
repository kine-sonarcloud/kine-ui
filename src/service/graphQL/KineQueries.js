import { gql } from '@apollo/client';
/* eslint-disable import/prefer-default-export */
export const verifyEmail = gql`
  query verifyEmailAddress($emailAddress:String!) {
    verifyEmail(emailAddress: $emailAddress)
  }
`;

export const registerUser = gql`
  mutation registerUser($firstName:String!, $lastName:String!, $emailAddress:String!, $pwd:String!, $trial:Boolean!) {
    subscribe(tenantDetails: {firstName: $firstName, lastName: $lastName, emailAddress: $emailAddress, pwd: $pwd, trial: $trial}),
    {firstName,lastName,emailAddress}
  }
`;

export const resendEmail = gql`
  mutation resendEmail($emailAddress:String!) {
    resendEmail(emailAddress: $emailAddress) {
      mailSent
    }
  }
`;
