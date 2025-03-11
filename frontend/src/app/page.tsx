"use server"

import { auth } from "@/auth";
import { SignInButton } from "./components/sign-in-button";
import Link from "next/link";
import { SignOutButton } from "./components/sign-out-button";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    return (
      <div>
        <Link href="/game"> Game </Link>
        <Link href="/user-info"> User Info </Link>
        <SignOutButton />
      </div>
    )
  }

  return (
  <div>
    {" "} 
    <p> You are not signed in </p>{" "}
    <SignInButton />
  </div>
  )
}