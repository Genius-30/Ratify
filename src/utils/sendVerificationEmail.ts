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
      subject: "Ratify - verification code",
      react: VerificationEmailTemplate({ username, otp: verifyCode }),
    });

    if (error) {
      return { sucess: false, message: "Error sending verification email!" };
    }

    return {
      success: true,
      message: "Verification email sent successfully.",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to send verification email.",
    };
  }
};

export default sendVerificationEmail;
