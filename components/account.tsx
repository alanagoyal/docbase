"use client";

import { Database } from "@/types/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AccountTabContent from "./account-form";
import PasswordTabContent from "./password-form";
import DomainTabContent from "./domain-form";

type User = Database["public"]["Tables"]["users"]["Row"];

export default function Account({ account }: { account: User }) {

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="domain">Domain</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <AccountTabContent account={account} />
        </TabsContent>
        <TabsContent value="password">
          <PasswordTabContent />
        </TabsContent>
        <TabsContent value="domain">
          <DomainTabContent account={account} />
        </TabsContent>
      </Tabs>
    </div>
  );
}