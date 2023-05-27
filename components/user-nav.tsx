"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogOut, PlusCircle, Settings, User } from "lucide-react"

import { Database } from "@/types/supabase"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSupabase } from "@/app/supabase-provider"

type Profiles = Database["public"]["Tables"]["profiles"]["Row"]

export function UserNav() {
  const { supabase } = useSupabase()
  const router = useRouter()
  const [name, setName] = useState<Profiles["full_name"]>("")
  const [email, setEmail] = useState<Profiles["email"]>("")
  const [avatar, setAvatar] = useState<Profiles["avatar_url"]>("")
  const [user, setUser] = useState<any>("")

  useEffect(() => {
    getProfile()
  }, [])

  async function getProfile() {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    setUser(session?.user.id)

    try {
      let { data, error, status } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session!.user.id)
        .single()

      if (error && status != 406) {
        throw error
      }

      if (data) {
        setName(data.full_name)
        setEmail(data.email)
        setAvatar(data.avatar_url)
      }
    } catch (error) {
      console.log(error)
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {name
                ? name
                    .split(" ")
                    .map((name) => name.charAt(0).toUpperCase())
                    .join("")
                : ""}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href="/account">
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
          </Link>
          <Link href="/new">
            <DropdownMenuItem>
              <PlusCircle className="mr-2 h-4 w-4" />
              <span>New Link</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
