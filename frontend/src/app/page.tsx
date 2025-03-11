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
        <Link href="/game">
          <button className="text-5xl bg-blue-500 text-white px-24 py-8 m-4 rounded-lg hover:bg-blue-600 transition duration-300">
            Start
          </button>
        </Link>
        <Link href="/profile">
          <button className="absolute top-16 right-16 bg-blue-500 text-white px-6 py-2 m-4 rounded-lg hover:bg-blue-600 transition duration-300">
            Profile
          </button>
        </Link>
        <div className="absolute top-32 right-16">
          <SignOutButton />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
      <h2 className="text-3xl text-white">Multiplication Table Quiz</h2>
      <SignInButton />
    </div>
  )
}