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
import { ToastAction } from "./ui/toast"

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
    const { data: fundData, error: fundError } = await supabase
      .from("funds")
      .select()
      .eq("investor_id", account.id)

    const { data: companyData, error: companyError } = await supabase
      .from("companies")
      .select()
      .eq("founder_id", account.id)

    if (!fundError && !companyError) {
      const typedFundData: Entity[] = fundData.map((fund) => ({
        ...fund,
        type: "fund" as const,
        name: fund.name || null,
        byline: fund.byline || null,
        street: fund.street || null,
        city_state_zip: fund.city_state_zip || null,
      }))
      const typedCompanyData: Entity[] = companyData.map((company) => ({
        ...company,
        type: "company" as const,
        name: company.name || null,
        street: company.street || null,
        city_state_zip: company.city_state_zip || null,
        state_of_incorporation: company.state_of_incorporation || null,
      }))
      setEntities([...typedFundData, ...typedCompanyData])
    } else {
      console.error(fundError || companyError)
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
        .eq("auth_id", account.auth_id)
      if (accountError) throw accountError

      if (
        data.entity_name ||
        data.byline ||
        data.street ||
        data.city_state_zip ||
        data.state_of_incorporation
      ) {
        if (data.type === "fund") {
          await processFund(data)
        } else if (data.type === "company") {
          await processCompany(data)
        }
      }
    } catch (error) {
      console.error(error)
      toast({
        description: "Error updating account",
      })
    } finally {
      toast({
        description: "Account updated",
      })
      setShowAdditionalFields(false)
    }
  }

  async function processFund(data: AccountFormValues) {
    const fundUpdates = {
      name: data.entity_name,
      byline: data.byline,
      street: data.street,
      city_state_zip: data.city_state_zip,
      investor_id: account.id,
    }

    const { data: existingFund, error: existingFundError } = await supabase
      .from("funds")
      .select()
      .eq("investor_id", account.id)
      .eq("name", data.entity_name)

    if (existingFund && existingFund.length > 0) {
      const { error: updateError } = await supabase
        .from("funds")
        .update(fundUpdates)
        .eq("id", existingFund[0].id)

      if (updateError) {
        if (updateError.code === "23505") {
          toast({
            description: "A fund with this name already exists",
          })
        } else {
          console.error("Error updating fund:", updateError)
          toast({
            description: "Error updating fund",
          })
        }
      }
    } else {
      const { data: newFund, error: newFundError } = await supabase
        .from("funds")
        .insert(fundUpdates)
        .select()

      if (newFundError) {
        if (newFundError.code === "23505") {
          toast({
            description: "A fund with this name already exists",
          })
        } else {
          console.error("Error creating fund:", newFundError)
          toast({
            description: "Error creating fund",
          })
        }
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
            investor_id: account.id,
          },
        ])
        setSelectedEntity(undefined)
      }
    }
  }

  async function processCompany(data: AccountFormValues) {
    const companyUpdates = {
      name: data.entity_name,
      street: data.street,
      city_state_zip: data.city_state_zip,
      state_of_incorporation: data.state_of_incorporation,
      founder_id: account.id,
    }

    // Check if company already exists
    const { data: existingCompany, error: existingCompanyError } =
      await supabase
        .from("companies")
        .select()
        .eq("founder_id", account.id)
        .eq("name", data.entity_name)

    if (existingCompany && existingCompany.length > 0) {
      // Update the existing company
      const { error: updateError } = await supabase
        .from("companies")
        .update(companyUpdates)
        .eq("id", existingCompany[0].id)

      if (updateError) {
        if (updateError.code === "23505") {
          toast({
            description: "A company with this name already exists",
          })
        } else {
          console.error("Error updating company:", updateError)
          toast({
            variant: "destructive",
            description: "Error updating company",
          })
        }
      }
    } else {
      // Create a new company
      const { data: newCompany, error: newCompanyError } = await supabase
        .from("companies")
        .insert(companyUpdates)
        .select()

      if (newCompanyError) {
        if (newCompanyError.code === "23505") {
          toast({
            description: "A company with this name already exists",
          })
        } else {
          console.error("Error creating company:", newCompanyError)
          toast({
            variant: "destructive",
            description: "Error creating company",
          })
        }
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
            founder_id: account.id,
          },
        ])
        setSelectedEntity(undefined)
      }
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
          title: `Unable to delete ${entityType}`,
          description: `This ${entityType} is currently associated with an active investment.`,
          action: (
            <ToastAction
              onClick={() => router.push("/investments")}
              altText="Investments"
            >
              Investments
            </ToastAction>
          ),
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
          <div className="flex items-center justify-between space-x-2">
            <div className="w-full">
              <FormField
                control={form.control}
                name="entity_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entity Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
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
            <Icons.trash
              className="cursor-pointer w-5 h-5"
              onClick={() => deleteEntity()}
            />
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
