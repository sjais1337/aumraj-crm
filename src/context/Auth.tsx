import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Auth({ children }: { children: JSX.Element }) {
    // if `{ required: true }` is supplied, `status` can only be "loading" or "authenticated"
    const router = useRouter();
    const { status } = useSession({ required: true, onUnauthenticated() {
      router.push('/login');
    }, })
  
    if (status === "loading") {
      return (
        <div className="flex h-screen items-center justify-center bg-white dark:bg-black">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
        </div>
      )
    }
  
    return children
}