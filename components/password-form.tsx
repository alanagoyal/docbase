"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"

type PasswordFormValues = {
  password: string
  confirmPassword: string
}

export default function PasswordTabContent() {
  const [isSettingPassword, setIsSettingPassword] = useState(false)

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(
      z
        .object({
          password: z.string().min(6, "Password must be at least 6 characters"),
          confirmPassword: z.string(),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: "Passwords don't match",
          path: ["confirmPassword"],
        })
    ),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const onSetPassword: SubmitHandler<PasswordFormValues> = async (data) => {
    setIsSettingPassword(true)
    try {
      const response = await fetch("/api/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: data.password }),
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to set password")
      }

      toast({ description: "Password saved!" })
    } catch (error) {
      console.error(error)
      toast({
        description:
          error instanceof Error ? error.message : "Failed to set password",
      })
    } finally {
      setIsSettingPassword(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password</CardTitle>
        <CardDescription>Set or change your password here</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Form {...passwordForm}>
          <form
            onSubmit={passwordForm.handleSubmit(onSetPassword)}
            className="space-y-4"
          >
            <FormField
              control={passwordForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={passwordForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              className="w-full"
              type="submit"
              disabled={isSettingPassword}
            >
              {isSettingPassword ? "Setting Password..." : "Save"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}