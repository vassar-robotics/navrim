// Base models
export type NoData = Record<string, never>;

export interface NavrimServiceResponse<T> {
  code: number;
  message: string;
  data: T;
}

// Helper function to create success responses
export const createSuccessResponse = <T>(data: T): NavrimServiceResponse<T> => ({
  code: 0,
  message: 'success',
  data,
});

// Helper function to create error responses
export const createErrorResponse = <T>(
  code: number,
  message: string,
  data?: T
): NavrimServiceResponse<T> => ({
  code,
  message,
  data: data || ({} as T),
}); 