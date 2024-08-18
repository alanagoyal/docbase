"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { formDescriptions } from "@/utils/form-descriptions"
import { parseSignatureBlock } from "@/utils/parse-signature-block"
import { createClient } from "@/utils/supabase/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useDropzone } from "react-dropzone"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Database, Entity } from "@/types/supabase"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"

import { EntitySelector } from "./entity-selector"
import { Icons } from "./icons"
import { PlacesAutocomplete } from "./places-autocomplete"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card"
import { Textarea } from "./ui/textarea"

const accountFormSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  title: z.string().optional(),
  type: z.enum(["fund", "company"]).optional(),
  entity_name: z.string().optional(),
  byline: z.string().optional(),
  street: z.string().optional(),
  city_state_zip: z.string().optional(),
  state_of_incorporation: z.string().optional(),
})

type User = Database["public"]["Tables"]["users"]["Row"]
type AccountFormValues = z.infer<typeof accountFormSchema>

export default function AccountForm({ account }: { account: User }) {
  const router = useRouter()
  const supabase = createClient()
  const [entities, setEntities] = useState<Entity[]>([])
  const [selectedEntity, setSelectedEntity] = useState<string | undefined>(
    undefined
  )
  const [showAdditionalFields, setShowAdditionalFields] = useState(false)
  const [signatureFile, setSignatureFile] = useState<File | null>(null)
  const [parsingSignature, setParsingSignature] = useState(false)

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      email: account.email || "",
      name: account.name || "",
      title: account.title || "",
      type: "fund",
      entity_name: "",
      byline: "",
      street: "",
      city_state_zip: "",
      state_of_incorporation: "",
    },
  })

  useEffect(() => {
    if (account) {
      fetchEntities()
    }
  }, [account])

  async function fetchEntities() {
    const { data: contactData, error: contactError } = await supabase
      .from("contacts")
      .select(`
        id,
        name,
        email,
        title,
        is_investor,
        is_founder,
        funds (id, name, byline, street, city_state_zip),
        companies (id, name, street, city_state_zip, state_of_incorporation)
      `)
      .eq("user_id", account.id)

    if (contactError) {
      console.error("Error fetching contact data:", contactError)
      return
    }

    if (contactData && contactData.length > 0) {
      const contact = contactData[0]
      const entities: Entity[] = [
        ...contact.funds.map((fund: any) => ({
          ...fund,
          type: "fund" as const,
          contact_id: contact.id,
        })),
        ...contact.companies.map((company: any) => ({
          ...company,
          type: "company" as const,
          contact_id: contact.id,
        })),
      ]
      setEntities(entities)
    }
  }

  async function onSubmit(data: AccountFormValues) {
    try {
      const accountUpdates = {
        email: account.email,
        name: data.name,
        title: data.title,
        updated_at: new Date(),
      }

      let { error: accountError } = await supabase
        .from("users")
        .update(accountUpdates)
        .eq("id", account.id)
      if (accountError) throw accountError

      // Create or update contact
      const contactId = await processContact(data)

      if (
        data.entity_name ||
        data.byline ||
        data.street ||
        data.city_state_zip ||
        data.state_of_incorporation
      ) {
        if (data.type === "fund") {
          const isDuplicate = await processFund(data, contactId)
          if (isDuplicate) return
        } else if (data.type === "company") {
          const isDuplicate = await processCompany(data, contactId)
          if (isDuplicate) return
        }
      }

      toast({
        description: "Account updated",
      })
      setShowAdditionalFields(false)
    } catch (error) {
      console.error(error)
      toast({
        description: "Error updating account",
      })
    }
  }

  async function processContact(data: AccountFormValues): Promise<string | null> {
    const contactData = {
      name: data.name,
      email: account.email,
      title: data.title,
      is_investor: data.type === "fund",
      is_founder: data.type === "company",
      user_id: account.id,
      created_by: account.id,
    }

    console.log(contactData)

    try {
      // Check if contact already exists
      const { data: existingContact, error: selectError } = await supabase
        .from("contacts")
        .select("id")
        .eq("user_id", account.id)
        .maybeSingle()

      if (selectError) {
        console.error("Error checking existing contact:", selectError)
        return null
      }

      if (existingContact) {
        // Update existing contact
        const { data: updatedContact, error: updateError } = await supabase
          .from("contacts")
          .update(contactData)
          .eq("id", existingContact.id)
          .select()

        if (updateError) {
          console.error("Error updating contact:", updateError)
          return null
        }

        return updatedContact[0].id
      } else {
        // Insert new contact
        const { data: newContact, error: insertError } = await supabase
          .from("contacts")
          .insert(contactData)
          .select()

        if (insertError) {
          console.error("Error creating new contact:", insertError)
          return null
        }

        return newContact[0].id
      }
    } catch (error) {
      console.error("Error processing contact:", error)
      return null
    }
  }

  async function processFund(data: AccountFormValues, contactId: string | null): Promise<boolean> {
    const fundUpdates = {
      name: data.entity_name,
      byline: data.byline,
      street: data.street,
      city_state_zip: data.city_state_zip,
      contact_id: contactId,
    }

    const { data: existingFund, error: existingFundError } = await supabase
      .from("funds")
      .select()
      .eq("name", data.entity_name)

    if (existingFundError) {
      console.error("Error checking existing fund:", existingFundError)
      return true
    }

    if (existingFund && existingFund.length > 0) {
      form.setError("entity_name", {
        type: "manual",
        message: "A fund with this name already exists",
      })
      return true
    }

    const { data: newFund, error: newFundError } = await supabase
      .from("funds")
      .insert(fundUpdates)
      .select()

    if (newFundError) {
      console.error("Error creating fund:", newFundError)
      return true
    } else {
      setEntities((prevEntities) => [
        ...prevEntities,
        {
          id: newFund[0].id,
          name: data.entity_name || null,
          type: "fund" as const,
          byline: data.byline || null,
          street: data.street || null,
          city_state_zip: data.city_state_zip || null,
          contact_id: contactId,
        },
      ])
      setSelectedEntity(undefined)
      return false
    }
  }

  async function processCompany(data: AccountFormValues, contactId: string | null): Promise<boolean> {
    const companyUpdates = {
      name: data.entity_name,
      street: data.street,
      city_state_zip: data.city_state_zip,
      state_of_incorporation: data.state_of_incorporation,
      contact_id: contactId,
    }

    const { data: existingCompany, error: existingCompanyError } =
      await supabase.from("companies").select().eq("name", data.entity_name)

    if (existingCompanyError) {
      console.error("Error checking existing company:", existingCompanyError)
      return true
    }

    if (existingCompany && existingCompany.length > 0) {
      form.setError("entity_name", {
        type: "manual",
        message: "A company with this name already exists",
      })
      return true
    }

    const { data: newCompany, error: newCompanyError } = await supabase
      .from("companies")
      .insert(companyUpdates)
      .select()

    if (newCompanyError) {
      console.error("Error creating company:", newCompanyError)
      return true
    } else {
      setEntities((prevEntities) => [
        ...prevEntities,
        {
          id: newCompany[0].id,
          name: data.entity_name || null,
          type: "company" as const,
          street: data.street || null,
          city_state_zip: data.city_state_zip || null,
          state_of_incorporation: data.state_of_incorporation || null,
          contact_id: contactId,
        },
      ])
      setSelectedEntity(undefined)
      return false
    }
  }

  async function deleteEntity() {
    if (
      selectedEntity === "add-new-fund" ||
      selectedEntity === "add-new-company"
    ) {
      toast({
        description: `${
          selectedEntity === "add-new-fund" ? "New fund" : "New company"
        } discarded`,
      })
      setSelectedEntity(undefined)
      setShowAdditionalFields(false)
      return
    }

    const selectedEntityDetails = entities.find(
      (entity) => entity.id === selectedEntity
    )
    if (!selectedEntityDetails) return

    const entityType = selectedEntityDetails.type
    const tableName = entityType === "fund" ? "funds" : "companies"
    const referenceColumn = entityType === "fund" ? "fund_id" : "company_id"

    try {
      const { data: investmentData, error: investmentError } = await supabase
        .from("investments")
        .select()
        .eq(referenceColumn, selectedEntity)

      if (investmentData && investmentData.length > 0) {
        toast({
          description: `This ${entityType} is currently associated with an active investment and can't be deleted at this time`,
        })
        return
      }
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq("id", selectedEntity)

      if (error) {
        toast({
          variant: "destructive",
          description: `Failed to delete the ${entityType}`,
        })
        console.error(`Error deleting ${entityType}:`, error)
      } else {
        toast({
          description: `${
            entityType.charAt(0).toUpperCase() + entityType.slice(1)
          } deleted`,
        })
        setEntities(entities.filter((entity) => entity.id !== selectedEntity))
        setSelectedEntity(undefined)
        setShowAdditionalFields(false)
      }
    } catch (error) {
      console.error(`Error processing deletion of ${entityType}:`, error)
      toast({
        variant: "destructive",
        description: `An error occurred while deleting the ${entityType}`,
      })
    }
  }

  function handleSelectChange(value: string) {
    setSelectedEntity(value)
    setShowAdditionalFields(true)

    if (value === "add-new-fund" || value === "add-new-company") {
      form.reset({
        ...form.getValues(),
        type: value === "add-new-fund" ? "fund" : "company",
        entity_name: "",
        byline: "",
        street: "",
        city_state_zip: "",
        state_of_incorporation: "",
      })
      setSignatureFile(null)
    } else {
      // Fetch the selected entity's details and set them in the form
      const selectedEntityDetails = entities.find(
        (entity) => entity.id === value
      )
      if (selectedEntityDetails) {
        form.reset({
          ...form.getValues(),
          type: selectedEntityDetails.type,
          entity_name: selectedEntityDetails.name || "",
          byline: selectedEntityDetails.byline || "",
          street: selectedEntityDetails.street || "",
          city_state_zip: selectedEntityDetails.city_state_zip || "",
          state_of_incorporation:
            selectedEntityDetails.state_of_incorporation || "",
        })
      }
    }
  }

  function renderAdditionalFields() {
    if (showAdditionalFields) {
      return (
        <>
          {(selectedEntity === "add-new-fund" ||
            selectedEntity === "add-new-company") && (
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer"
              )}
            >
              <input {...getInputProps()} />
              <div className="text-sm text-muted-foreground">
                {isDragActive ? (
                  "Drop the signature block image here ..."
                ) : parsingSignature ? (
                  <div className="flex items-center justify-center">
                    <Icons.spinner className="w-5 h-5 animate-spin" />
                  </div>
                ) : signatureFile ? (
                  `File selected: ${signatureFile.name}`
                ) : (
                  "Drag & drop or click to upload a signature block image"
                )}
              </div>
            </div>
          )}
          <div className="flex items-start space-x-2">
            <div className="flex-grow">
              <FormField
                control={form.control}
                name="entity_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entity Name</FormLabel>
                    <div className="flex items-center space-x-2">
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <Icons.trash
                        className="cursor-pointer w-5 h-5 flex-shrink-0"
                        onClick={() => deleteEntity()}
                      />
                    </div>
                    <FormDescription>
                      {form.watch("type") === "fund"
                        ? formDescriptions.fundName
                        : formDescriptions.companyName}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          {form.watch("type") === "fund" && (
            <FormField
              control={form.control}
              name="byline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Byline (Optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormDescription>
                    {formDescriptions.fundByline}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <PlacesAutocomplete
            form={form}
            streetName="street"
            cityStateZipName="city_state_zip"
            disabled={false}
            onAddressChange={(street, cityStateZip) => {
              form.setValue("street", street)
              form.setValue("city_state_zip", cityStateZip)
            }}
            initialStreet={form.watch("street")}
            initialCityStateZip={form.watch("city_state_zip")}
          />
          {form.watch("type") === "company" && (
            <FormField
              control={form.control}
              name="state_of_incorporation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State of Incorporation</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    {formDescriptions.stateOfIncorporation}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </>
      )
    }
    return null
  }

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      setSignatureFile(file)
      setParsingSignature(true)

      try {
        const parsedData = await parseSignatureBlock(file)

        form.reset({
          ...form.getValues(),
          entity_name: parsedData.entity_name || "",
          name: parsedData.name || form.getValues("name"),
          title: parsedData.title || form.getValues("title"),
          street: parsedData.street || "",
          city_state_zip: parsedData.city_state_zip || "",
          state_of_incorporation: parsedData.state_of_incorporation || "",
          byline: parsedData.byline || "",
        })

        setShowAdditionalFields(true)
        toast({
          description: "Signature block image parsed successfully",
        })
      } catch (error) {
        console.error("Error parsing signature block:", error)
        toast({
          description: "Unable to parse signature block",
        })
      } finally {
        setParsingSignature(false)
      }
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
    },
    disabled: !(
      selectedEntity === "add-new-fund" || selectedEntity === "add-new-company"
    ),
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Make changes to your profile information here
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-2 w-full"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} disabled />
                  </FormControl>
                  <FormDescription>
                    This is the email you log in with
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    This is the name that will be used in your signature block
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    This is the title that will be used in your signature block
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-4 w-full">
              <div className="space-y-2 w-full">
                <FormLabel>Signature Blocks</FormLabel>
                <EntitySelector
                  entities={entities}
                  selectedEntity={selectedEntity}
                  onSelectChange={handleSelectChange}
                  entityType="both"
                  disabled={false}
                />
              </div>
              {renderAdditionalFields()}
              <Button className="w-full" type="submit">
                Save
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
