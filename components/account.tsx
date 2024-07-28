"use client";

import { Database } from "@/types/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AccountTabContent from "./account-form";
import PasswordTabContent from "./password-form";

type User = Database["public"]["Tables"]["users"]["Row"];

export default function Account({ account }: { account: User }) {

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <AccountTabContent account={account} />
        </TabsContent>
        <TabsContent value="password">
          <PasswordTabContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}