"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
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
import { toast } from "./ui/use-toast"
import { Icons } from "./icons"
import { useState } from "react"
import { clientLogger } from "@/lib/client-logger"

export interface LoginFormData {
  email: string
  password: string
}

interface LoginResponse {
  errorMessage?: string
}

interface LoginFormProps {
  login: (formData: LoginFormData) => Promise<LoginResponse>
}

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, {
    message: "Username must be at least 6 characters.",
  }),
})

export function LoginForm({ login }: LoginFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const [isLoading, setIsLoading] = useState(false)

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      const response = await login(data)
      if (response && response.errorMessage) {
        toast({
          title: "Login failed",
          description: response.errorMessage,
        })
      }
    } catch (error) {
      clientLogger.error('Login failed', { error })
      toast({
        title: "Login failed",
        description: "An unexpected error occurred. Please try again later.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      form.handleSubmit(onSubmit)();
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold tracking-tight">
            Sign In With Email
          </CardTitle>
          <CardDescription>
            Enter your email and password to sign in
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
                            {...field}
                          ></Input>
                        </FormControl>{" "}
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
                  {isLoading ? <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  )
}