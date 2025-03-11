import { auth } from "@/auth";
import Image from "next/image";
import { SignOutButton } from "../components/sign-out-button";

export default async function UserInfo() {
    const session = await auth();
    return (
        <div>
            {" "}
            <p> User signed in with name: {session?.user?.name}</p>
            <p> User signed in with email: {session?.user?.email}</p>
            {session?.user?.image && (
                <Image 
                src={session.user.image} 
                width={48} 
                height={48} 
                alt={session.user.name ?? "avatar"}
                style={{borderRadius: "50%"}}
                />
            )}
            <SignOutButton />
        </div>
      )
    }