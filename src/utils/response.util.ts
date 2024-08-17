import { NextResponse } from "next/server";

export const apiResponse = (statusCode: number = 200, data: any) => {
  return NextResponse.json({ success: true, data }, { status: statusCode });
};

export const apiError = (
  statusCode: number = 500,
  message: string,
  error?: any
) => {
  console.error(error);
  return NextResponse.json(
    { success: false, message, error },
    { status: statusCode }
  );
};
