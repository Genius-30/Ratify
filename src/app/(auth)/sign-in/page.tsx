"use client";
import { signIn, signOut } from "@/app/api/auth/[...nextauth]/options";
import { useSession } from "next-auth/react";
import React from "react";

function Page() {
  const { data: session } = useSession();

  // if (session?.user) {
  //   return (
  //     <>
  //       <h1>Welcome {session.user.username}</h1>
  //       <button onClick={() => signOut()}>Logout</button>
  //     </>
  //   );
  // }
  return (
    <div>
      <h1>Sign In</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          signIn("credentials", {
            email: e.currentTarget.email.value,
            password: e.currentTarget.password.value,
          });
        }}
      >
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Password" />
        <button type="submit">Sign In</button>
      </form>
      <button onClick={() => signIn("google")}>Sign in with Google</button>
    </div>
  );
}

export default Page;
