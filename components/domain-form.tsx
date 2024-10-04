"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/utils/supabase/client";
import { Database } from "@/types/supabase";
import { InfoIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const domainFormSchema = z.object({
  name: z.string().min(1, "Domain name is required"),
  apiKey: z.string().min(1, "API key is required"),
});

type DomainFormValues = z.infer<typeof domainFormSchema>;
type User = Database["public"]["Tables"]["users"]["Row"];

export default function DomainForm({ account }: { account: User }) {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const form = useForm<DomainFormValues>({
    resolver: zodResolver(domainFormSchema),
    defaultValues: {
      name: "",
      apiKey: "",
    },
  });

  const onSubmit = async (data: DomainFormValues) => {
    setIsLoading(true);
    try {
      // First, create the domain using the Resend API
      const response = await fetch('/api/create-domain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create domain');
      }

      const domain = await response.json();
      console.log(domain);

      // If domain creation is successful, update the user's domain in the database
      const { error } = await supabase
        .from('domains')
        .insert({
          id: domain.id,
          created_at: new Date().toISOString(),
          name: data.name,
          user_id: account.id,
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Domain created and saved",
        description: "Your domain has been successfully created and saved to your profile.",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to create or save domain. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Domain Settings</CardTitle>
        <CardDescription>
          Configure your domain for sending emails
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Domain Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the domain name you want to use for sending emails
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <div className="flex items-center space-x-2">
                      <span>API Key</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <InfoIcon className="h-4 w-4 text-gray-500" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs font-normal">
                              Docbase uses <a href="https://www.resend.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Resend</a> to power emails from the platform. Please sign up for an account, grab your API key, and paste it here to start sending emails from your domain.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter your Resend API key
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Domain"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}