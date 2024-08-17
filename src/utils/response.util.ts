import { NextApiResponse } from "next";

export const apiResponse = (
  res: NextApiResponse,
  statusCode: number = 200,
  data: any
) => {
  return res.status(statusCode).json({ success: true, data });
};

export const apiError = (
  res: NextApiResponse,
  statusCode: number = 500,
  message: string,
  error?: any
) => {
  console.error(error);
  return res.status(statusCode).json({ success: false, message, error });
};
