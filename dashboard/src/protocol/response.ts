/* tslint:disable */
/* eslint-disable */
/**
/* This file was automatically generated from pydantic models by running pydantic2ts.
/* Do not modify it by hand - just update the pydantic models and then re-run the script
*/

export type BackgroundTaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'

export interface BackgroundTask {
  id: string
  name: string
  status: BackgroundTaskStatus
  description: string
  progress: number | null
}
export interface BrowseDatasetResponse {
  name: string
  is_remote: boolean
  path: string
  files: string[]
  directories: string[]
}
export interface DatasetInfoResponse {
  name: string
  is_remote: boolean
  version: string
  robot_type: string
  dof: number
  episode_count: number
  image_count: number
}
export interface DatasetItemResponse {
  name: string
  is_remote: boolean
}
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
export interface ListBackgroundTasksResponse {
  tasks: BackgroundTask[]
}
export interface ListDatasetsResponse {
  datasets: DatasetItemResponse[]
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
