"use client"

import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Icons } from "./icons"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { Button } from "./ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card"
import { Input } from "./ui/input"
import { ToastAction } from "./ui/toast"
import { toast } from "./ui/use-toast"
import { useState } from "react"
import { clientLogger } from "@/lib/client-logger"

export interface SignupFormData {
  email: string
  password: string
}

interface SignupResponse {
  success: boolean
  errorMessage?: string
}

interface SignupFormProps {
  signup: (formData: SignupFormData) => Promise<SignupResponse>
}

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, {
    message: "Username must be at least 6 characters.",
  }),
})

export function SignupForm({ signup }: SignupFormProps) {
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      form.handleSubmit(onSubmit)();
    }
  };

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true)
    try {
      const response = await signup(data)
      if (response && !response.success) {
        if (response.errorMessage === "User already registered") {
          clientLogger.error('User already registered', { errorMessage: response.errorMessage })
          toast({
            title: "Account already exists",
            description: "Please sign in or sign up with another email",
            action: (
              <ToastAction
                onClick={() => router.push("/login")}
                altText="Sign in"
              >
                Sign in
              </ToastAction>
            ),
          })
        } else {
          toast({
            title: "Sign up failed",
            description: response.errorMessage,
          })
        }
      } else {
        toast({
          title: "Confirm your account",
          description: `An email has been sent to ${data.email}`,
        })
      }
    } catch (error) {
      clientLogger.error('Sign up failed', { error })
      toast({
        title: "Sign up failed",
        description: "An unexpected error occurred. Please try again later.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold tracking-tight">
            Sign Up With Email
          </CardTitle>
          <CardDescription>
            Enter your email and password to sign up
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-2">
                <div className="grid gap-1">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="name@email.com"
                            autoComplete="off"
                            {...field}
                          ></Input>
                        </FormControl>{" "}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            autoComplete="off"
                            placeholder="••••••••"
                            {...field}
                            onKeyDown={handleKeyDown}
                          ></Input>
                        </FormControl>{" "}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> : "Sign Up"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  )
}