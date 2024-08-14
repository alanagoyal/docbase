"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Database } from "@/types/supabase";
import { Trash } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { toast } from "./ui/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import ContactForm from "./contact-form";

type Contact = Database["public"]["Tables"]["contacts"]["Row"];
type User = Database["public"]["Tables"]["users"]["Row"];

export function ContactsTable({
  contacts,
  account,
}: {
  contacts: Contact[];
  account: User;
}) {
  const supabase = createClient();
  const [groupMemberships, setGroupMemberships] = useState<
    Record<string, string>
  >({});

  const router = useRouter();

  async function onDelete(id: string) {
    try {
      let { error } = await supabase.from("contacts").delete().eq("id", id);
      if (error) throw error;
      toast({
        description: "Your contact has been deleted",
      });
      router.refresh();
    } catch (error) {}
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Created Time</TableHead>
          <TableHead>Group</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {contacts.map((contact: any) => (
          <TableRow key={contact.id}>
            <TableCell>{contact.name}</TableCell>
            <TableCell>{contact.email}</TableCell>
            <TableCell>
              {new Date(contact.created_at).toLocaleString("en-US")}
            </TableCell>
            <TableCell>{groupMemberships[contact.id]}</TableCell>
            <TableCell>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <ContactForm
                      existingContact={contact}
                      account={account}
                    />
                  </TooltipTrigger>
                  <TooltipContent>Edit Member</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableCell>
            <TableCell>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Trash
                      className="h-4 w-4 ml-4 text-muted-foreground"
                      onClick={() => onDelete(contact.id)}
                      style={{ cursor: "pointer" }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>Delete Member</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}