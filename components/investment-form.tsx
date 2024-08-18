"use client"

import React, { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { formDescriptions } from "@/utils/form-descriptions"
import { createClient } from "@/utils/supabase/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Database, Entity, UserInvestment } from "@/types/supabase"
import { cn } from "@/lib/utils"

import AuthRefresh from "./auth-refresh"
import { EntitySelector } from "./entity-selector"
import { Icons } from "./icons"
import { PlacesAutocomplete } from "./places-autocomplete"
import { Share } from "./share"
import { Button } from "./ui/button"
import { Calendar } from "./ui/calendar"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { Switch } from "./ui/switch"
import { Textarea } from "./ui/textarea"
import { toast } from "./ui/use-toast"

const InvestmentFormSchema = z.object({
  companyName: z.string().optional(),
  fundName: z.string().optional(),
  fundByline: z.string().optional(),
  purchaseAmount: z.string().min(1, { message: "Purchase amount is required" }),
  type: z.enum(["valuation-cap", "discount", "mfn"]),
  valuationCap: z.string().optional(),
  discount: z.string().optional(),
  stateOfIncorporation: z.string({
    required_error: "State of incorporation is required",
  }),
  date: z.date({ required_error: "Date is required" }),
  investorName: z.string().optional(),
  investorTitle: z.string().optional(),
  investorEmail: z.string().optional(),
  fundStreet: z.string().optional(),
  fundCityStateZip: z.string().optional(),
  founderName: z.string().optional(),
  founderTitle: z.string().optional(),
  founderEmail: z.string().optional(),
  companyStreet: z.string().optional(),
  companyCityStateZip: z.string().optional(),
  infoRights: z.boolean().optional(),
  proRataRights: z.boolean().optional(),
  majorInvestorRights: z.boolean().optional(),
  termination: z.boolean().optional(),
  miscellaneous: z.boolean().optional(),
})

type InvestmentFormValues = z.infer<typeof InvestmentFormSchema>

type User = Database["public"]["Tables"]["users"]["Row"]

export default function InvestmentForm({
  investment,
  account,
  isEditMode = false,
}: {
  investment?: UserInvestment
  account: User
  isEditMode?: boolean
}) {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState(parseInt(searchParams.get("step") || "0"))
  const [investmentId, setInvestmentId] = useState<string | null>(
    investment?.id || null
  )
  const [sideLetterId, setSideLetterId] = useState<string | null>(null)
  const [entities, setEntities] = useState<Entity[]>([])
  const [selectedEntity, setSelectedEntity] = useState<string | undefined>(
    undefined
  )
  const isFormLocked = searchParams.get("sharing") === "true"
  const [isOwner, setIsOwner] = useState(true)
  const [isLoadingSave, setIsLoadingSave] = useState(false)
  const [isLoadingNext, setIsLoadingNext] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [hasFunds, setHasFunds] = useState(false)
  const [hasCompanies, setHasCompanies] = useState(false)

  const form = useForm<InvestmentFormValues>({
    resolver: zodResolver(InvestmentFormSchema),
    defaultValues: {
      companyName: "",
      fundName: "",
      fundByline: "",
      purchaseAmount: "",
      type: undefined,
      valuationCap: "",
      discount: "",
      stateOfIncorporation: "",
      date: new Date(),
      investorName: "",
      investorTitle: "",
      investorEmail: "",
      fundStreet: "",
      fundCityStateZip: "",
      founderName: "",
      founderTitle: "",
      founderEmail: "",
      companyStreet: "",
      companyCityStateZip: "",
      infoRights: false,
      proRataRights: false,
      majorInvestorRights: false,
      termination: false,
      miscellaneous: false,
    },
  })

  useEffect(() => {
    if (investment) {
      setInvestmentId(investment.id)
      fetchInvestmentDetails(investment.id)
    }
  }, [investment])

  useEffect(() => {
    if (account) {
      fetchEntities()
    }
  }, [account])

  useEffect(() => {
    console.log("Entities updated:", entities)
    setHasFunds(entities.some((entity) => entity.type === "fund"))
    setHasCompanies(entities.some((entity) => entity.type === "company"))
  }, [entities])

  useEffect(() => {
    if (isFormLocked) {
      form.reset({
        ...form.getValues(),
        founderEmail: account.email || "",
      })
    }
  }, [isFormLocked, account.email])

  // Function to update URL with current step
  useEffect(() => {
    if (investmentId) {
      const newSearchParams = new URLSearchParams(searchParams)
      newSearchParams.set("step", step.toString())
      if (isFormLocked) {
        newSearchParams.set("sharing", "true")
      }
      router.push(`/investments/${investmentId}?${newSearchParams.toString()}`)
    }
  }, [step, investmentId, isFormLocked])

  async function fetchInvestmentDetails(investmentId: string) {
    const { data: dataIncorrectlyTyped, error } = await supabase
      .from("investments")
      .select(
        `
        purchase_amount,
        investment_type,
        valuation_cap,
        discount,
        date,
        created_by,
        founder:contacts!founder_contact_id (id, name, email, title),
        company:companies (id, name, street, city_state_zip, state_of_incorporation, contact_id),
        investor:contacts!investor_contact_id (id, name, email, title),
        fund:funds (id, name, byline, street, city_state_zip, contact_id),
        side_letter:side_letters (id, side_letter_url, info_rights, pro_rata_rights, major_investor_rights, termination, miscellaneous)
      `
      )
      .eq("id", investmentId)
      .single()

    if (error) {
      console.error("Error fetching investment details:", error)
      return
    }

    if (dataIncorrectlyTyped) {
      const data = dataIncorrectlyTyped as any

      form.reset({
        companyName: data.company?.name || "",
        fundName: data.fund?.name || "",
        fundByline: data.fund?.byline || "",
        purchaseAmount: data.purchase_amount || "",
        type: data.investment_type || undefined,
        valuationCap: data.valuation_cap || "",
        discount: data.discount || "",
        stateOfIncorporation: data.company?.state_of_incorporation || "",
        date: data.date ? new Date(data.date) : new Date(),
        investorName: data.investor?.name || "",
        investorTitle: data.investor?.title || "",
        investorEmail: data.investor?.email || "",
        fundStreet: data.fund?.street || "",
        fundCityStateZip: data.fund?.city_state_zip || "",
        founderName: data.founder?.name || "",
        founderTitle: data.founder?.title || "",
        founderEmail: data.founder?.email || "",
        companyStreet: data.company?.street || "",
        companyCityStateZip: data.company?.city_state_zip || "",
        infoRights: data.side_letter?.info_rights || false,
        proRataRights: data.side_letter?.pro_rata_rights || false,
        majorInvestorRights: data.side_letter?.major_investor_rights || false,
        termination: data.side_letter?.termination || false,
        miscellaneous: data.side_letter?.miscellaneous || false,
      })

      if (step === 1 && data.fund) {
        setSelectedEntity(data.fund.id)
        console.log("Fund selected:", data.fund.id)
        setHasFunds(true)
      } else if (step === 2 && data.company) {
        setSelectedEntity(data.company.id)
        console.log("Company selected:", data.company.id)
        setHasCompanies(true)
      } else {
        setSelectedEntity(undefined)
      }

      if (account.id !== data.created_by) {
        setIsOwner(false)
      }
      if (data.side_letter) {
        setSideLetterId(data.side_letter.id)
      }
    }
  }

  async function fetchEntities() {
    try {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("id", account.id)
        .single()

      if (userError) {
        console.error("Error fetching user data:", userError)
        throw userError
      }

      const { data: contactData, error: contactError } = await supabase
        .from("contacts")
        .select("id")
        .eq("user_id", userData.id)
        .single()

      if (contactError) {
        console.error("Error fetching contact data:", contactError)
        throw contactError
      }

      const { data: fundsData, error: fundsError } = await supabase
        .from("funds")
        .select(
          `
          *,
          contact:contacts(id, name, email, title)
        `
        )
        .eq("contact_id", contactData.id)

      if (fundsError) {
        console.error("Error fetching funds data:", fundsError)
        throw fundsError
      }

      const { data: companiesData, error: companiesError } = await supabase
        .from("companies")
        .select(
          `
          *,
          contact:contacts(id, name, email, title)
        `
        )
        .eq("contact_id", contactData.id)

      if (companiesError) {
        console.error("Error fetching companies data:", companiesError)
        throw companiesError
      }

      const fundEntities = fundsData.map((fund) => ({
        id: fund.id,
        name: fund.name,
        type: "fund" as const,
        byline: fund.byline,
        street: fund.street,
        city_state_zip: fund.city_state_zip,
        contact_id: fund.contact_id,
        contact_name: fund.contact?.name,
        contact_email: fund.contact?.email,
        contact_title: fund.contact?.title,
      }))

      const companyEntities = companiesData.map((company) => ({
        id: company.id,
        name: company.name,
        type: "company" as const,
        street: company.street,
        city_state_zip: company.city_state_zip,
        state_of_incorporation: company.state_of_incorporation,
        contact_id: company.contact_id,
        contact_name: company.contact?.name,
        contact_email: company.contact?.email,
        contact_title: company.contact?.title,
      }))

      const newEntities = [...fundEntities, ...companyEntities]
      setEntities(newEntities)
      console.log("Entities fetched:", newEntities)
    } catch (error) {
      console.error("Error in fetchEntities:", error)
    }
  }

  async function onSubmit(values: InvestmentFormValues) {
    setIsLoadingSave(true)
    await processInvestment(values)
    toast({
      description: "Investment saved",
    })
    setIsLoadingSave(false)
    router.push("/investments")
    router.refresh()
  }

  async function processInvestorDetails(values: InvestmentFormValues) {
    if (
      values.investorName === "" &&
      values.investorEmail === "" &&
      values.investorTitle === ""
    ) {
      return null
    }

    try {
      const investorData = {
        name: values.investorName,
        email: values.investorEmail,
        title: values.investorTitle,
        is_investor: true,
        created_by: account.id,
        user_id: null,
      }

      const { data: existingInvestor, error: existingInvestorError } =
        await supabase
          .from("contacts")
          .select("id, user_id")
          .eq("email", values.investorEmail)
          .eq("created_by", account.id)
          .maybeSingle()

      if (existingInvestorError) {
        console.error(
          "Error checking for existing investor:",
          existingInvestorError
        )
      }

      if (existingInvestor) {
        if (existingInvestor.user_id) {
          investorData.user_id = existingInvestor.user_id
        }
        const { error: updateError } = await supabase
          .from("contacts")
          .update(investorData)
          .eq("id", existingInvestor.id)
        if (updateError) {
          console.error("Error updating existing investor:", updateError)
          throw updateError
        }
        return existingInvestor.id
      } else {
        const { data: newInvestor, error: newInvestorError } = await supabase
          .from("contacts")
          .insert(investorData)
          .select("id")
        if (newInvestorError) {
          console.error(
            "Error creating new investor contact:",
            newInvestorError
          )
          toast({
            description: "Error creating new investor contact",
          })
          return null
        }
        return newInvestor ? newInvestor[0].id : null
      }
    } catch (error) {
      console.error("Error processing investor details:", error)
      return null
    }
  }

  async function processFundDetails(
    values: InvestmentFormValues,
    contactId: string | null
  ) {
    if (
      values.fundName === "" &&
      values.fundByline === "" &&
      values.fundStreet === "" &&
      values.fundCityStateZip === ""
    )
      return null

    try {
      const fundData = {
        name: values.fundName,
        byline: values.fundByline,
        street: values.fundStreet,
        city_state_zip: values.fundCityStateZip,
        contact_id: contactId,
      }

      const { data: existingFund, error: existingFundError } = await supabase
        .from("funds")
        .select("id, contact_id")
        .eq("name", values.fundName)
        .maybeSingle()

      if (existingFund) {
        const updateData = {
          ...fundData,
          contact_id: contactId || existingFund.contact_id,
        }
        const { error: updateError } = await supabase
          .from("funds")
          .update(updateData)
          .eq("id", existingFund.id)
        if (updateError) throw updateError
        return existingFund.id
      } else {
        const { data: newFund, error: insertError } = await supabase
          .from("funds")
          .insert(fundData)
          .select("id")
        if (insertError) throw insertError
        return newFund ? newFund[0].id : null
      }
    } catch (error) {
      console.error("Error processing fund details:", error)
      return null
    }
  }

  async function processFounderDetails(values: InvestmentFormValues) {
    if (
      values.founderName === "" &&
      values.founderEmail === "" &&
      values.founderTitle === ""
    ) {
      return null
    }

    try {
      const founderData = {
        name: values.founderName,
        email: values.founderEmail,
        title: values.founderTitle,
        is_founder: true,
        created_by: account.id,
        user_id: null,
      }

      const { data: existingFounder, error: existingFounderError } =
        await supabase
          .from("contacts")
          .select("id, user_id")
          .eq("email", values.founderEmail)
          .eq("created_by", account.id)
          .maybeSingle()

      if (existingFounderError) {
        console.error(
          "Error checking for existing founder:",
          existingFounderError
        )
      }

      if (existingFounder) {
        if (existingFounder.user_id) {
          founderData.user_id = existingFounder.user_id
        }
        const { error: updateError } = await supabase
          .from("contacts")
          .update(founderData)
          .eq("id", existingFounder.id)
        if (updateError) {
          console.error("Error updating existing founder:", updateError)
          throw updateError
        }
        return existingFounder.id
      } else {
        const { data: newFounder, error: newFounderError } = await supabase
          .from("contacts")
          .insert(founderData)
          .select("id")
        if (newFounderError) {
          console.error("Error creating new founder contact:", newFounderError)
          toast({
            description: "Error creating new founder contact",
          })
          return null
        }
        return newFounder ? newFounder[0].id : null
      }
    } catch (error) {
      console.error("Error processing founder details:", error)
      return null
    }
  }

  async function processCompanyDetails(
    values: InvestmentFormValues,
    contactId: string | null
  ) {
    if (
      values.companyName === "" &&
      values.companyStreet === "" &&
      values.companyCityStateZip === "" &&
      values.stateOfIncorporation === ""
    )
      return null

    try {
      const companyData = {
        name: values.companyName,
        street: values.companyStreet,
        city_state_zip: values.companyCityStateZip,
        state_of_incorporation: values.stateOfIncorporation,
        contact_id: contactId,
      }

      const { data: existingCompany, error: existingCompanyError } =
        await supabase
          .from("companies")
          .select("id, contact_id")
          .eq("name", values.companyName)
          .maybeSingle()

      if (existingCompany) {
        const updateData = {
          ...companyData,
          contact_id: contactId || existingCompany.contact_id,
        }
        const { error: updateError } = await supabase
          .from("companies")
          .update(updateData)
          .eq("id", existingCompany.id)
        if (updateError) throw updateError
        return existingCompany.id
      } else {
        const { data: newCompany, error: insertError } = await supabase
          .from("companies")
          .insert(companyData)
          .select("id")
        if (insertError) {
          if (insertError.code === "23505") {
            toast({
              description: "A company with this name already exists",
            })
          } else {
            throw insertError
          }
        }
        return newCompany ? newCompany[0].id : null
      }
    } catch (error) {
      console.error("Error processing company details:", error)
      return null
    }
  }

  async function processDealInfo(values: InvestmentFormValues) {
    if (
      values.purchaseAmount === "" &&
      values.type === undefined &&
      values.date === undefined
    )
      return null

    try {
      const dealData: Partial<UserInvestment> = {
        purchase_amount: values.purchaseAmount,
        investment_type: values.type,
        valuation_cap: values.valuationCap,
        discount: values.discount,
        date: values.date.toISOString(),
      }

      let investmentIdResult: string | null = null

      if (!investmentId) {
        dealData.created_by = account.id!

        // Insert investment
        const { data: investmentInsertData, error: investmentInsertError } =
          await supabase.from("investments").insert(dealData).select("id")
        if (investmentInsertError) throw investmentInsertError
        investmentIdResult = investmentInsertData[0].id
      } else {
        // Update investment
        const { data: investmentUpdateData, error: investmentUpdateError } =
          await supabase
            .from("investments")
            .update(dealData)
            .eq("id", investmentId)
            .select("id")
        if (investmentUpdateError) throw investmentUpdateError
        investmentIdResult = investmentUpdateData[0].id
      }
      setInvestmentId(investmentIdResult)
      return investmentIdResult
    } catch (error) {
      console.error("Error processing investment details:", error)
      return null
    }
  }

  async function processInvestment(
    values: InvestmentFormValues,
    investorId?: string | null,
    fundId?: string | null,
    founderId?: string | null,
    companyId?: string | null
  ): Promise<string | null> {
    try {
      const investmentData: Partial<UserInvestment> = {
        ...(founderId && { founder_contact_id: founderId }),
        ...(companyId && { company_id: companyId }),
        ...(investorId && { investor_contact_id: investorId }),
        ...(fundId && { fund_id: fundId }),
        purchase_amount: values.purchaseAmount,
        investment_type: values.type,
        ...(values.valuationCap && { valuation_cap: values.valuationCap }),
        ...(values.discount && { discount: values.discount }),
        date: values.date.toISOString(),
      }

      let investmentIdResult: string | null = null

      // Process side letter data only if at least one value is true
      const sideLetter = {
        info_rights: values.infoRights,
        pro_rata_rights: values.proRataRights,
        major_investor_rights: values.majorInvestorRights,
        termination: values.termination,
        miscellaneous: values.miscellaneous,
      }

      const hasSideLetterContent = Object.values(sideLetter).some(Boolean)

      if (!investmentId) {
        investmentData.created_by = account.id!

        if (hasSideLetterContent) {
          // Insert side letter
          const { data: sideLetterData, error: sideLetterError } =
            await supabase.from("side_letters").insert(sideLetter).select("id")

          if (sideLetterError) throw sideLetterError

          investmentData.side_letter_id = sideLetterData[0].id
        }

        // Insert investment
        const { data: investmentInsertData, error: investmentInsertError } =
          await supabase.from("investments").insert(investmentData).select("id")
        if (investmentInsertError) throw investmentInsertError
        investmentIdResult = investmentInsertData[0].id
      } else {
        if (hasSideLetterContent) {
          if (sideLetterId) {
            // Update side letter
            const { error: sideLetterUpdateError } = await supabase
              .from("side_letters")
              .update(sideLetter)
              .eq("id", sideLetterId)

            if (sideLetterUpdateError) throw sideLetterUpdateError
          } else {
            // Insert new side letter
            const { data: sideLetterData, error: sideLetterError } =
              await supabase
                .from("side_letters")
                .insert(sideLetter)
                .select("id")

            if (sideLetterError) throw sideLetterError

            investmentData.side_letter_id = sideLetterData[0].id
          }
        } else if (sideLetterId) {
          // Remove side letter if all values are false
          const { error: sideLetterDeleteError } = await supabase
            .from("side_letters")
            .delete()
            .eq("id", sideLetterId)

          if (sideLetterDeleteError) throw sideLetterDeleteError

          investmentData.side_letter_id = null
        }

        // Update investment
        const { data: investmentUpdateData, error: investmentUpdateError } =
          await supabase
            .from("investments")
            .update(investmentData)
            .eq("id", investmentId)
            .select("id")
        if (investmentUpdateError) throw investmentUpdateError
        investmentIdResult = investmentUpdateData[0].id
      }
      setInvestmentId(investmentIdResult)
      return investmentIdResult
    } catch (error) {
      console.error("Error processing investment details:", error)
      return null
    }
  }

  async function handleSelectChange(value: string) {
    setSelectedEntity(value)
    const selectedEntityDetails = entities.find((entity) => entity.id === value)

    if (selectedEntityDetails) {
      if (selectedEntityDetails.type === "fund") {
        form.setValue("fundName", selectedEntityDetails.name || "")
        form.setValue("fundByline", selectedEntityDetails.byline || "")
        form.setValue("fundStreet", selectedEntityDetails.street || "")
        form.setValue(
          "fundCityStateZip",
          selectedEntityDetails.city_state_zip || ""
        )

        form.setValue("investorName", selectedEntityDetails.contact_name || "")
        form.setValue(
          "investorEmail",
          selectedEntityDetails.contact_email || ""
        )
        form.setValue(
          "investorTitle",
          selectedEntityDetails.contact_title || ""
        )
      } else if (selectedEntityDetails.type === "company") {
        form.setValue("companyName", selectedEntityDetails.name || "")
        form.setValue("companyStreet", selectedEntityDetails.street || "")
        form.setValue(
          "companyCityStateZip",
          selectedEntityDetails.city_state_zip || ""
        )
        form.setValue(
          "stateOfIncorporation",
          selectedEntityDetails.state_of_incorporation || ""
        )

        form.setValue("founderName", selectedEntityDetails.contact_name || "")
        form.setValue("founderEmail", selectedEntityDetails.contact_email || "")
        form.setValue("founderTitle", selectedEntityDetails.contact_title || "")
      }
    }
  }

  async function processStepZero(type: "save" | "next") {
    setIsLoadingNext(type === "next")
    setIsLoadingSave(type === "save")
    const values = form.getValues()
    const investmentId = await processDealInfo(values)
    if (type === "next") {
      router.push(`/investments/${investmentId}`)
      setStep(1)
    }
    setIsLoadingNext(false)
    setIsLoadingSave(false)
  }

  async function saveStepZero() {
    if (isEditMode) {
      toast({
        description: "Investment updated",
      })
      router.push("/investments")
    }
    await processStepZero("save")
    router.refresh()
  }

  async function advanceStepZero() {
    const isValid = await form.trigger(["purchaseAmount", "type", "date"])
    if (!isValid) {
      toast({
        description: "Please fill out all required fields",
      })
      return
    }
    await processStepZero("next")
  }

  async function processStepOne(type: "save" | "next") {
    setIsLoadingNext(type === "next")
    setIsLoadingSave(type === "save")
    const values = form.getValues()
    const investorId = await processInvestorDetails(values)
    const fundId = await processFundDetails(values, investorId)
    if (investorId || fundId) {
      await processInvestment(values, investorId, fundId, null, null)
    }
    setIsLoadingNext(false)
    setIsLoadingSave(false)
    if (type === "next") {
      setStep(2)
    }
  }

  async function saveStepOne() {
    if (isEditMode) {
      toast({
        description: "Investment updated",
      })
      router.push("/investments")
    }
    await processStepOne("save")
    router.refresh()
  }

  async function advanceStepOne() {
    await processStepOne("next")
  }

  async function processStepTwo(type: "save" | "next") {
    setIsLoadingNext(type === "next")
    setIsLoadingSave(type === "save")
    const values = form.getValues()
    const founderId = await processFounderDetails(values)
    const companyId = await processCompanyDetails(values, founderId)
    if (founderId || companyId) {
      await processInvestment(values, null, null, founderId, companyId)
    }
    setIsLoadingNext(false)
    setIsLoadingSave(false)
    if (type === "next") {
      setStep(3)
    }
  }

  async function saveStepTwo() {
    if (isEditMode) {
      toast({
        description: "Investment updated",
      })
      router.push("/investments")
    }
    if (isFormLocked) {
      toast({
        description:
          "Thanks! You'll receive an email with the next steps once all parties have provided their information",
      })
      try {
        await processStepTwo("save")
      } finally {
      }
      router.push("/investments")
    } else {
      await processStepTwo("save")
    }
    router.refresh()
  }

  async function advanceStepTwo() {
    await processStepTwo("next")
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AuthRefresh />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 w-full"
        >
          {step === 0 && (
            <>
              <div className="pt-4 flex justify-between items-center h-10">
                <Label className="text-xl font-bold">Deal Terms</Label>
              </div>
              <FormField
                control={form.control}
                name="purchaseAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Amount</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={!isOwner}
                        value={Number(
                          field.value.replace(/,/g, "")
                        ).toLocaleString()}
                        onChange={(event) => {
                          const value = event.target.value
                            .replace(/\D/g, "")
                            .replace(/,/g, "")
                          field.onChange(Number(value).toLocaleString())
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      {formDescriptions.purchaseAmount}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Investment Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!isOwner}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an investment type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="valuation-cap">
                          Valuation Cap
                        </SelectItem>
                        <SelectItem value="discount">Discount</SelectItem>
                        <SelectItem value="mfn">MFN</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {formDescriptions.investmentType}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {form.watch("type") === "valuation-cap" && (
                <FormField
                  control={form.control}
                  name="valuationCap"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valuation Cap</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={!isOwner}
                          value={Number(
                            field.value?.replace(/,/g, "")
                          ).toLocaleString()}
                          onChange={(event) => {
                            const value = event.target.value
                              .replace(/\D/g, "")
                              .replace(/,/g, "")
                            field.onChange(Number(value).toLocaleString())
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        {formDescriptions.valuationCap}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {form.watch("type") === "discount" && (
                <FormField
                  control={form.control}
                  name="discount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isOwner} />
                      </FormControl>
                      <FormDescription>
                        {formDescriptions.discount}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            disabled={!isOwner}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>{formDescriptions.date}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  className="w-full"
                  onClick={advanceStepZero}
                >
                  {isLoadingNext ? <Icons.spinner /> : "Next"}
                </Button>
                {(isEditMode || isFormLocked) && (
                  <Button
                    type="button"
                    className="w-full"
                    onClick={saveStepZero}
                    variant="secondary"
                  >
                    {isLoadingSave ? <Icons.spinner /> : "Save & Close"}
                  </Button>
                )}
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <div className="pt-4 flex justify-between items-center h-10">
                <Label className="text-xl font-bold">Investor Details</Label>
              </div>
              {hasFunds && (
                <FormItem>
                  <FormLabel>Select Entity</FormLabel>
                  <EntitySelector
                    entities={entities.filter(
                      (entity) => entity.type === "fund"
                    )}
                    selectedEntity={selectedEntity}
                    onSelectChange={handleSelectChange}
                    entityType="fund"
                    disabled={!isOwner}
                  />
                  <FormDescription>
                    Choose an existing fund to be used in your signature block
                    or add one below
                  </FormDescription>
                </FormItem>
              )}
              <FormField
                control={form.control}
                name="fundName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entity Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={!isOwner} />
                    </FormControl>
                    <FormDescription>
                      {formDescriptions.fundName}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fundByline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Byline (Optional)</FormLabel>
                    <FormControl>
                      <Textarea {...field} disabled={!isOwner} />
                    </FormControl>
                    <FormDescription>
                      {formDescriptions.fundByline}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <PlacesAutocomplete
                form={form}
                streetName="fundStreet"
                cityStateZipName="fundCityStateZip"
                disabled={!isOwner}
                onAddressChange={(street, cityStateZip) => {
                  form.setValue("fundStreet", street)
                  form.setValue("fundCityStateZip", cityStateZip)
                }}
                initialStreet={form.watch("fundStreet")}
                initialCityStateZip={form.watch("fundCityStateZip")}
              />
              <div className="pt-4">
                <Label className="text-xl font-bold">Signatory Details</Label>
              </div>
              <FormField
                control={form.control}
                name="investorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Investor Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={!isOwner} />
                    </FormControl>
                    <FormDescription>
                      {formDescriptions.investorName}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="investorTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Investor Title</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={!isOwner} />
                    </FormControl>
                    <FormDescription>
                      {formDescriptions.investorTitle}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="investorEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Investor Email</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={!isOwner} />
                    </FormControl>
                    <FormDescription>
                      {formDescriptions.investorEmail}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col gap-2">
                <div className="flex w-full gap-2">
                  <Button
                    className="w-1/2"
                    onClick={() => {
                      setStep(0)
                    }}
                  >
                    Back{" "}
                  </Button>
                  <Button
                    type="button"
                    className="w-1/2"
                    onClick={advanceStepOne}
                  >
                    {isLoadingNext ? <Icons.spinner /> : "Next"}
                  </Button>
                </div>
                {(isEditMode || isFormLocked) && (
                  <Button
                    type="button"
                    className="w-full"
                    onClick={saveStepOne}
                    variant="secondary"
                  >
                    {isLoadingSave ? <Icons.spinner /> : "Save & Close"}
                  </Button>
                )}
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <div className="pt-4 flex justify-between items-center h-10">
                <Label className="text-xl font-bold">Company Details</Label>
                {isOwner &&
                  investment &&
                  investment.fund &&
                  investment.investor && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setIsShareDialogOpen(true)
                      }}
                    >
                      <span className="text-sm">Share</span>
                      <Icons.share className="ml-2 h-4 w-4" />
                    </Button>
                  )}
              </div>
              {console.log(
                "Rendering step 2, hasCompanies:",
                hasCompanies,
                "entities:",
                entities
              )}
              {hasCompanies && (
                <FormItem>
                  <FormLabel>Select Entity</FormLabel>
                  <EntitySelector
                    entities={entities.filter(
                      (entity) => entity.type === "company"
                    )}
                    selectedEntity={selectedEntity}
                    onSelectChange={handleSelectChange}
                    entityType="company"
                    disabled={false}
                  />
                  <FormDescription>
                    Choose an existing company to be used in your signature
                    block or add one below
                  </FormDescription>
                </FormItem>
              )}
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      {formDescriptions.companyName}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <PlacesAutocomplete
                form={form}
                streetName="companyStreet"
                cityStateZipName="companyCityStateZip"
                disabled={false}
                onAddressChange={(street, cityStateZip) => {
                  form.setValue("companyStreet", street)
                  form.setValue("companyCityStateZip", cityStateZip)
                }}
                initialStreet={form.watch("companyStreet")}
                initialCityStateZip={form.watch("companyCityStateZip")}
              />
              <FormField
                control={form.control}
                name="stateOfIncorporation"
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
              <div className="pt-4">
                <Label className="text-xl font-bold">Signatory Details</Label>
              </div>
              <FormField
                control={form.control}
                name="founderName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Founder Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      {formDescriptions.founderName}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="founderTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Founder Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      {formDescriptions.founderTitle}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="founderEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Founder Email</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      {formDescriptions.founderEmail}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col gap-2">
                {!isOwner ? (
                  <>
                    <Button
                      type="button"
                      className="w-full"
                      onClick={saveStepTwo}
                    >
                      {isLoadingSave ? <Icons.spinner /> : "Save & Close"}
                    </Button>
                    <Button
                      className="w-full"
                      onClick={() => {
                        setStep(1)
                      }}
                      variant="secondary"
                    >
                      Back
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex w-full gap-2">
                      <Button
                        className="w-1/2"
                        onClick={() => {
                          setStep(1)
                        }}
                      >
                        Back
                      </Button>
                      <Button
                        type="button"
                        className="w-1/2"
                        onClick={advanceStepTwo}
                      >
                        {isLoadingNext ? <Icons.spinner /> : "Next"}
                      </Button>
                    </div>
                    {isEditMode && (
                      <Button
                        type="button"
                        className="w-full"
                        onClick={saveStepTwo}
                        variant="secondary"
                      >
                        {isLoadingSave ? <Icons.spinner /> : "Save & Close"}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </>
          )}
          {step === 3 && isOwner && (
            <>
              <div className="pt-4 flex justify-between items-center h-10">
                <Label className="text-xl font-bold">Side Letter</Label>
              </div>
              <FormField
                control={form.control}
                name="infoRights"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Information Rights
                      </FormLabel>
                      <FormDescription>
                        {formDescriptions.infoRights}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!isOwner}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="proRataRights"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Pro Rata Rights
                      </FormLabel>
                      <FormDescription>
                        {formDescriptions.proRataRights}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!isOwner}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="majorInvestorRights"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Major Investor Rights
                      </FormLabel>
                      <FormDescription>
                        {formDescriptions.majorInvestorRights}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!isOwner}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="termination"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Termination Rights
                      </FormLabel>
                      <FormDescription>
                        {formDescriptions.termination}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!isOwner}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="miscellaneous"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Miscellaneous</FormLabel>
                      <FormDescription>
                        {formDescriptions.miscellaneous}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!isOwner}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex flex-col gap-2">
                <Button type="submit" className="w-full">
                  {isLoadingSave ? <Icons.spinner /> : "Save & Close"}
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => setStep(2)}
                >
                  Back
                </Button>
              </div>
            </>
          )}
        </form>
      </Form>
      {investment && investment.fund && investment.investor && (
        <Share
          investment={investment}
          onEmailSent={() => setStep(3)}
          isOpen={isShareDialogOpen}
          onOpenChange={setIsShareDialogOpen}
          account={account}
        />
      )}
    </div>
  )
}
