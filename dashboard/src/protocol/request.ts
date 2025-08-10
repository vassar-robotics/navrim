/* tslint:disable */
/* eslint-disable */
/**
/* This file was automatically generated from pydantic models by running pydantic2ts.
/* Do not modify it by hand - just update the pydantic models and then re-run the script
*/

export interface EmailPasswordRequest {
  email: string
  password: string
}
export interface EmailRequest {
  email: string
}
export interface ResetPasswordRequest {
  email: string
}
export interface SignInCredentialsRequest {
  email: string
  password: string
}
export interface SignUpCredentialsRequest {
  email: string
  password: string
  display_name: string
}
export interface TokenRequest {
  token: string
}
