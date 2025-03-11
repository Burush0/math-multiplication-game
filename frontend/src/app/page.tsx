"use server"

import { auth } from "@/auth";
import { SignInButton } from "./components/sign-in-button";
import Link from "next/link";
import { SignOutButton } from "./components/sign-out-button";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-3xl font-bold mb-8">Welcome to the Math Game!</h1>
            <Link href="/game">
                <button className="bg-blue-500 text-white px-6 py-2 m-4 rounded-lg hover:bg-blue-600 transition duration-300">
                    Start Game
                </button>
            </Link>
            <Link href="/user-info">
                <button className="bg-blue-500 text-white px-6 py-2 m-4 rounded-lg hover:bg-blue-600 transition duration-300">
                    User Info
                </button> 
            </Link>
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