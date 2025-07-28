import type { NavrimServiceResponse } from '@/protocol';
import { SERVER_UNKNOWN_ERROR } from '@/protocol/codes';

// Base API configuration
const API_BASE_URL = 'http://localhost:8000';

// Common fetch wrapper with error handling
export async function apiCall<TRequest, TResponse>(
  endpoint: string,
  data: TRequest
): Promise<NavrimServiceResponse<TResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result as NavrimServiceResponse<TResponse>;
  } catch (error) {
    return {
      code: SERVER_UNKNOWN_ERROR,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      data: {} as TResponse,
    };
  }
} 