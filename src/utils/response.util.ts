import { NextResponse } from "next/server";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
}

export interface ApiError {
  success: boolean;
  message: string;
  error?: any;
}

export const apiResponse = <T>(statusCode: number = 200, data: any) => {
  const response: ApiResponse<T> = { success: true, data };
  return NextResponse.json(response, { status: statusCode });
};

export const apiError = (
  statusCode: number = 500,
  message: string,
  error?: any
) => {
  console.error(error);
  const response: ApiError = { success: false, message, error };
  return NextResponse.json(response, { status: statusCode });
};
