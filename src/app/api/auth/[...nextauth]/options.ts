import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/user.model";
import { comparePassword } from "@/utils/password.util";
import { apiError } from "@/utils/response.util";
import Org from "@/models/organization.model";
import google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials): Promise<any> => {
        await dbConnect();
        try {
          const user =
            (await User.findOne({ email: credentials.email })) ||
            (await Org.findOne({ email: credentials.email }));

          if (!user) {
            return apiError(401, "Invalid credentials");
          } else if (!user.isVerified) {
            return apiError(401, "Please verify your email");
          } else {
            const isPasswordCorrect = await comparePassword(
              credentials.password as string,
              user.password
            );
            if (!isPasswordCorrect) {
              return apiError(401, "Invalid credentials");
            }
          }

          return user;
        } catch (error) {
          return apiError(500, "Internal server error");
        }
      },
    }),
    google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id?.toString();
        token.isVerified = user.isVerified;
        token.username = user.username;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id as string;
        session.user.isVerified = token.isVerified as boolean;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
});
