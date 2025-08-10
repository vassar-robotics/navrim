/* tslint:disable */
/* eslint-disable */
/**
/* This file was automatically generated from pydantic models by running pydantic2ts.
/* Do not modify it by hand - just update the pydantic models and then re-run the script
*/

export interface GetServerStatusResponse {
  status: string
  ip_address: string
  port: number
  hostname: string
}
export interface GetThirdPartyTokensResponse {
  huggingface: string
  openai: string
  wandb: string
}
export interface GetTokenResponse {
  token: string
}
export interface Session {
  user_id: string
  user_email: string
  email_confirmed: boolean
  access_token: string
  refresh_token: string
  expires_at: number
}
export interface SessionResponse {
  session: Session
}
export interface UserProfile {
  display_name: string
}
export interface VerifyTokenResponse {
  valid: boolean
  reason: string
}
