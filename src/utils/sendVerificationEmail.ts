import VerificationEmailTemplate from "@/components/emails/VerificationEmailTemplate";
import { apiError, apiResponse } from "@/utils/response.util";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const sendVerificationEmail = async (
  email: string,
  username: string,
  verifyCode: string
): Promise<any> => {
  try {
    const { data, error } = await resend.emails.send({
      from: "Ratify <onboarding@resend.dev>",
      to: email,
      subject: "Ratify | Verification Code",
      react: VerificationEmailTemplate({ username, otp: verifyCode }),
    });

    if (error) {
      return apiError(400, "Error sending verification email: ", error.message);
    }

    apiResponse(200, data);
  } catch (error) {
    return apiError(500, "Error sending verification email: ", error);
  }
};

export default sendVerificationEmail;
