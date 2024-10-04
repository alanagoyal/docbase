"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Database } from "@/types/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AccountTabContent from "./account-form";
import PasswordTabContent from "./password-form";
import DomainTabContent from "./domain-form";

type User = Database["public"]["Tables"]["users"]["Row"];
type Domain = Database["public"]["Tables"]["domains"]["Row"];

export default function Account({ account, domain }: { account: User, domain: Domain }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    // Get the current tab from the URL query parameter
    const tab = searchParams.get("tab");
    // Set the active tab based on the query parameter, or default to "profile"
    setActiveTab(tab === "password" || tab === "domain" ? tab : "profile");
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Create a new URLSearchParams object
    const newSearchParams = new URLSearchParams(searchParams);
    // Set the new tab value
    newSearchParams.set("tab", value);
    // Update the URL with the new search params
    router.push(`?${newSearchParams.toString()}`);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
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
          <DomainTabContent account={account} domain={domain} />
        </TabsContent>
      </Tabs>
    </div>
  );
}