"use client"

import { login } from "@/lib/actions/auth"

export const SignInButton = () => {
    
    return <button className="bg-blue-500 text-white px-6 py-2 m-4 rounded-lg hover:bg-blue-600 transition duration-300" onClick={() => login()}> Sign in with GitHub </button>
}