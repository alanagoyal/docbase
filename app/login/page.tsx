import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/login-form";
import MagicLink from "@/components/magic-link";
import { login } from "./actions";

export default async function Login() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center pt-16 px-4 sm:px-6 md:px-8">
      <div className="w-full max-w-md flex flex-col space-y-6 p-4">
        <div className="flex flex-col items-center space-y-2">
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
            Sign in to your account
          </h1>
          <Tabs defaultValue="magic-link" className="w-full max-w-[400px] pt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="magic-link">Magic Link</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
            </TabsList>
            <TabsContent value="magic-link">
              <MagicLink />
            </TabsContent>
            <TabsContent value="email">
              <LoginForm login={login} />
            </TabsContent>
          </Tabs>
        </div>
        <p className="px-4 md:px-8 text-center text-sm text-muted-foreground">
          Need an account?{" "}
          <Link
            href="/signup"
            className="underline underline-offset-2 md:underline-offset-4 hover:text-primary"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}