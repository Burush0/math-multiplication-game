"use client"

import { logout } from "@/lib/actions/auth"

export const SignOutButton = () => {
    return <button className="bg-blue-500 text-white px-6 py-2 m-4 rounded-lg hover:bg-blue-600 transition duration-300" onClick={() => logout()}> Sign out </button>
}