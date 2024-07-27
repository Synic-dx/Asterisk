// src/types/ApiResponse.ts
export interface ApiResponse {
  success: boolean;
  message: string;
  token?: string; // Add the token property
}
