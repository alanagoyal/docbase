"use client"

import React, { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { formDescriptions } from "@/utils/form-descriptions"
import { createClient } from "@/utils/supabase/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useLoadScript, type Libraries } from "@react-google-maps/api"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import Confetti from "react-confetti"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Database } from "@/types/supabase"
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

type InvestmentData = {
  founder_id?: string
  company_id?: string
  investor_id?: string
  fund_id?: string
  purchase_amount: string
  investment_type: "valuation-cap" | "discount" | "mfn"
  valuation_cap?: string
  discount?: string
  date: Date
  created_by?: string
  safe_url?: string | null
  summary?: string | null
  info_rights?: boolean
  pro_rata_rights?: boolean
  major_investor_rights?: string
  termination?: string
  miscellaneous?: string
  side_letter_id?: string | null
}

type User = Database["public"]["Tables"]["users"]["Row"]

export default function InvestmentForm({
  investment,
  account,
  isEditMode = false,
}: {
  investment?: any
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
  const [showConfetti, setShowConfetti] = useState(false)
  const [entities, setEntities] = useState<any[]>([])
  const [selectedEntity, setSelectedEntity] = useState<string | undefined>(
    undefined
  )
  const [showFundSelector, setShowFundSelector] = useState(true)
  const [showCompanySelector, setShowCompanySelector] = useState(true)
  const isFormLocked = searchParams.get("sharing") === "true"
  const [isOwner, setIsOwner] = useState(true)
  const [isLoadingSave, setIsLoadingSave] = useState(false)
  const [isLoadingNext, setIsLoadingNext] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)

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
      if (isFormLocked) {
        form.reset({
          ...form.getValues(),
          founderEmail: account.email || "",
        })
      }
    }
  }, [account, isFormLocked])

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
      founder:users!founder_id (name, title, email),
      company:companies (id, name, street, city_state_zip, state_of_incorporation, founder_id),
      investor:users!investor_id (name, title, email),
      fund:funds (id, name, byline, street, city_state_zip, investor_id),
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

      // Ensure the correct entity selector is shown based on the step
      if (step === 1) {
        setShowFundSelector(true)
        if (data.fund && data.fund.investor_id === account.auth_id) {
          setSelectedEntity(data.fund.id)
        } else {
          setSelectedEntity(undefined)
        }
      } else if (step === 2) {
        setShowCompanySelector(true)
        if (data.company && data.company.founder_id === account.auth_id) {
          setSelectedEntity(data.company.id)
        } else {
          setSelectedEntity(undefined)
        }
      } else {
        setSelectedEntity(undefined)
        if (step === 1) {
          setShowFundSelector(false)
        }
        if (step === 2) {
          setShowCompanySelector(false)
        }
      }

      // If the user is editing an investment that is not theirs, lock the form
      if (account.auth_id !== data.created_by) {
        setIsOwner(false)
      }
      if (data.side_letter) {
        setSideLetterId(data.side_letter.id)
      }
    }
  }

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
      const typedFundData = fundData.map((fund) => ({ ...fund, type: "fund" }))
      const typedCompanyData = companyData.map((company) => ({
        ...company,
        type: "company",
      }))
      setEntities([...typedFundData, ...typedCompanyData])

      // Ensure the correct entity selector is shown based on the step
      if (step === 1 && typedFundData.length > 0) {
        setShowFundSelector(true)
      } else if (step === 2 && typedCompanyData.length > 0) {
        setShowCompanySelector(true)
      }
    }
  }

  async function onSubmit(values: InvestmentFormValues) {
    // Process the investment
    if (isEditMode) {
      toast({
        description: "Investment updated",
      })
      router.push("/investments")
      await processInvestment(values)
      router.refresh()
    } else {
      setShowConfetti(true)
      toast({
        title: "Your SAFE agreement has been created",
        description:
          "You can view, edit, or download it by visiting your Investments.",
      })
      try {
        await processInvestment(values)
      } finally {
        setShowConfetti(false)
      }
      router.push("/investments")
      router.refresh()
    }
  }

  async function processInvestorDetails(values: InvestmentFormValues) {
    if (
      values.investorName === "" &&
      values.investorTitle === "" &&
      values.investorEmail === ""
    )
      return null

    try {
      const investorData = {
        name: values.investorName,
        title: values.investorTitle,
        email: values.investorEmail,
        updated_at: new Date(),
      }

      // Check if user already exists and update
      const { data: existingInvestor, error: existingInvestorError } =
        await supabase
          .from("users")
          .select("id")
          .eq("email", values.investorEmail)

      if (existingInvestor && existingInvestor.length > 0) {
        const { error: updateError } = await supabase
          .from("users")
          .update(investorData)
          .eq("id", existingInvestor[0].id)
        if (updateError) throw updateError
        return existingInvestor[0].id

        // Insert new user
      } else {
        const { data, error } = await supabase
          .from("users")
          .insert(investorData)
          .select("id")
        if (error) throw error
        return data[0].id
      }
    } catch (error) {
      console.error("Error processing investor details:", error)
      return null
    }
  }

  async function processFundDetails(
    values: InvestmentFormValues,
    investorId: string | null
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
        investor_id: investorId,
      }

      // Check if fund already exists
      const { data: existingFund, error: existingFundError } = await supabase
        .from("funds")
        .select("id, investor_id")
        .eq("name", values.fundName)
        .maybeSingle()

      if (existingFund) {
        // Update the fund, keeping the existing investor_id if no new one is provided
        const updateData = {
          ...fundData,
          investor_id: investorId || existingFund.investor_id,
        }
        const { error: updateError } = await supabase
          .from("funds")
          .update(updateData)
          .eq("id", existingFund.id)
        if (updateError) throw updateError
        return existingFund.id
      } else {
        // Insert new fund
        const { data: newFund, error: newFundError } = await supabase
          .from("funds")
          .insert(fundData)
          .select()
        if (newFundError) throw newFundError
        return newFund[0].id
      }
    } catch (error) {
      console.error("Error processing fund details:", error)
    }
  }

  async function processFounderDetails(values: InvestmentFormValues) {
    if (
      values.founderName === "" &&
      values.founderTitle === "" &&
      values.founderEmail === ""
    )
      return null

    try {
      const founderData = {
        name: values.founderName,
        title: values.founderTitle,
        email: values.founderEmail,
        updated_at: new Date(),
      }

      // Check if the founder already exists and update
      const { data: existingFounder, error: existingFounderError } =
        await supabase
          .from("users")
          .select("id")
          .eq("email", values.founderEmail)

      if (existingFounder && existingFounder.length > 0) {
        const { error: updateError } = await supabase
          .from("users")
          .update(founderData)
          .eq("id", existingFounder[0].id)
        if (updateError) throw updateError
        return existingFounder[0].id

        // Insert new founder
      } else {
        const { data: newFounder, error: newFounderError } = await supabase
          .from("users")
          .insert(founderData)
          .select("id")
        if (newFounderError) throw newFounderError
        return newFounder[0].id
      }
    } catch (error) {
      console.error("Error processing founder details:", error)
    }
  }

  async function processCompanyDetails(
    values: InvestmentFormValues,
    founderId: string | null
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
        founder_id: founderId,
      }

      // Check if company already exists
      const { data: existingCompany, error: existingCompanyError } =
        await supabase
          .from("companies")
          .select("id, founder_id")
          .eq("name", values.companyName)
          .maybeSingle()

      if (existingCompany) {
        // Update the company, keeping the existing founder_id if no new one is provided
        const updateData = {
          ...companyData,
          founder_id: founderId || existingCompany.founder_id,
        }
        const { error: updateError } = await supabase
          .from("companies")
          .update(updateData)
          .eq("id", existingCompany.id)
        if (updateError) throw updateError
        return existingCompany.id
      } else {
        // Insert new company
        const { data: newCompany, error: newCompanyError } = await supabase
          .from("companies")
          .insert(companyData)
          .select()
        if (newCompanyError) throw newCompanyError
        return newCompany[0].id
      }
    } catch (error) {
      console.error("Error processing company details:", error)
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
      const dealData: InvestmentData = {
        purchase_amount: values.purchaseAmount,
        investment_type: values.type,
        valuation_cap: values.valuationCap,
        discount: values.discount,
        date: values.date,
      }

      let investmentIdResult: string | null = null

      if (!investmentId) {
        dealData.created_by = account.auth_id!

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
      const investmentData: InvestmentData = {
        ...(founderId && { founder_id: founderId }),
        ...(companyId && { company_id: companyId }),
        ...(investorId && { investor_id: investorId }),
        ...(fundId && { fund_id: fundId }),
        purchase_amount: values.purchaseAmount,
        investment_type: values.type,
        ...(values.valuationCap && { valuation_cap: values.valuationCap }),
        ...(values.discount && { discount: values.discount }),
        date: values.date,
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
        investmentData.created_by = account.auth_id!

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
      if (showFundSelector && selectedEntityDetails.type === "fund") {
        form.setValue("fundName", selectedEntityDetails.name || "")
        form.setValue("fundByline", selectedEntityDetails.byline || "")
        form.setValue("fundStreet", selectedEntityDetails.street || "")
        form.setValue(
          "fundCityStateZip",
          selectedEntityDetails.city_state_zip || ""
        )
  
        // Fetch investor details
        const { data: investorData, error: investorError } = await supabase
          .from("users")
          .select("name, title, email")
          .eq("id", selectedEntityDetails.investor_id)
          .single()
  
        if (!investorError && investorData) {
          form.setValue("investorName", investorData.name || "")
          form.setValue("investorTitle", investorData.title || "")
          form.setValue("investorEmail", investorData.email || "")
        }
      } else if (
        showCompanySelector &&
        selectedEntityDetails.type === "company"
      ) {
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
  
        // Fetch founder details
        const { data: founderData, error: founderError } = await supabase
          .from("users")
          .select("name, title, email")
          .eq("id", selectedEntityDetails.founder_id)
          .single()
  
        if (!founderError && founderData) {
          form.setValue("founderName", founderData.name || "")
          form.setValue("founderTitle", founderData.title || "")
          form.setValue("founderEmail", founderData.email || "")
        }
      }
    } else {
      // Reset form fields if "Add new" is selected
      if (showFundSelector) {
        form.setValue("fundName", "")
        form.setValue("fundByline", "")
        form.setValue("fundStreet", "")
        form.setValue("fundCityStateZip", "")
        form.setValue("investorName", "")
        form.setValue("investorTitle", "")
        form.setValue("investorEmail", "")
      } else if (showCompanySelector) {
        form.setValue("companyName", "")
        form.setValue("companyStreet", "")
        form.setValue("companyCityStateZip", "")
        form.setValue("stateOfIncorporation", "")
        form.setValue("founderName", "")
        form.setValue("founderTitle", "")
        form.setValue("founderEmail", "")
      }
    }
  }

  async function processStepZero(type: "save" | "next") {
    setIsLoadingNext(type === "next")
    setIsLoadingSave(type === "save")
    const values = form.getValues()
    const investmentId = await processDealInfo(values)
    router.push(`/investments/${investmentId}`)
    setIsLoadingNext(false)
    setIsLoadingSave(false)
    if (type === "next") {
      setStep(1)
    }
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
      setShowConfetti(true)
      toast({
        title: "Congratulations!",
        description:
          "Your information has been saved. You'll receive an email with the next steps once all parties have provided their information.",
      })
      try {
        await processStepTwo("save")
      } finally {
        setShowConfetti(false)
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
      {showConfetti && <Confetti />}
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
                        disabled={isFormLocked || !isOwner}
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
                      defaultValue={field.value}
                      disabled={isFormLocked || !isOwner}
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
                          disabled={isFormLocked || !isOwner}
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
                        <Input {...field} disabled={isFormLocked || !isOwner} />
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
                            disabled={isFormLocked || !isOwner}
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
                {(isEditMode || isFormLocked) && (
                  <Button
                    type="button"
                    className="w-full"
                    onClick={saveStepZero}
                  >
                    {isLoadingSave ? <Icons.spinner /> : "Save"}
                  </Button>
                )}
                <Button
                  type="button"
                  className="w-full"
                  onClick={advanceStepZero}
                  variant={isEditMode || isFormLocked ? "secondary" : "default"}
                >
                  {isLoadingNext ? <Icons.spinner /> : "Next"}
                </Button>
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <div className="pt-4 flex justify-between items-center h-10">
                <Label className="text-xl font-bold">Investor Details</Label>
              </div>
              {showFundSelector &&
                entities.some((entity) => entity.type === "fund") && (
                  <FormItem>
                    <FormLabel>Select Entity</FormLabel>
                    <EntitySelector
                      entities={entities}
                      selectedEntity={selectedEntity}
                      onSelectChange={handleSelectChange}
                      entityType="fund"
                      disabled={isFormLocked || !isOwner}
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
                      <Input {...field} disabled={isFormLocked || !isOwner} />
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
                      <Textarea {...field} disabled={isFormLocked || !isOwner} />
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
                disabled={isFormLocked || !isOwner}
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
                      <Input {...field} disabled={isFormLocked || !isOwner} />
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
                      <Input {...field} disabled={isFormLocked || !isOwner} />
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
                      <Input {...field} disabled={isFormLocked || !isOwner} />
                    </FormControl>
                    <FormDescription>
                      {formDescriptions.investorEmail}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
                <div className="flex flex-col gap-2">
                {(isEditMode || isFormLocked) && (
                  <Button
                    type="button"
                    className="w-full"
                    onClick={saveStepOne}
                  >
                    {isLoadingSave ? <Icons.spinner /> : "Save"}
                  </Button>
                )}
                <div className="flex w-full gap-2">
                  <Button
                    variant="secondary"
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
                    variant={
                      isEditMode || isFormLocked ? "secondary" : "default"
                    }
                    onClick={advanceStepOne}
                  >
                    {isLoadingNext ? <Icons.spinner /> : "Next"}
                  </Button>
                </div>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <div className="pt-4 flex justify-between items-center h-10">
                <Label className="text-xl font-bold">Company Details</Label>
                {!isFormLocked && investmentId && (
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
              {showCompanySelector &&
                entities.some((entity) => entity.type === "company") && (
                  <FormItem>
                    <FormLabel>Select Entity</FormLabel>
                    <EntitySelector
                      entities={entities}
                      selectedEntity={selectedEntity}
                      onSelectChange={handleSelectChange}
                      entityType="company"
                      disabled={isFormLocked || !isOwner}
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
                      <Input {...field} disabled={isFormLocked || !isOwner} />
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
                disabled={isFormLocked || !isOwner}
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
                      <Input {...field} disabled={isFormLocked || !isOwner} />
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
                      <Input {...field} disabled={isFormLocked || !isOwner} />
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
                      <Input {...field} disabled={isFormLocked || !isOwner} />
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
                      <Input {...field} disabled={isFormLocked || !isOwner} />
                    </FormControl>
                    <FormDescription>
                      {formDescriptions.founderEmail}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col gap-2">
                {(isEditMode || isFormLocked) && (
                  <Button
                    type="button"
                    className="w-full"
                    onClick={saveStepTwo}
                  >
                    {isLoadingSave ? <Icons.spinner /> : "Save"}
                  </Button>
                )}
                <div className="flex w-full gap-2">
                  <Button
                    variant="secondary"
                    className="w-1/2"
                    onClick={() => {
                      setStep(1)
                    }}
                  >
                    Back{" "}
                  </Button>
                  <Button
                    type="button"
                    className="w-1/2"
                    variant={
                      isEditMode || isFormLocked ? "secondary" : "default"
                    }
                    onClick={advanceStepTwo}
                  >
                    {isLoadingNext ? <Icons.spinner /> : "Next"}
                  </Button>
                </div>
              </div>
            </>
          )}
          {step === 3 && (
            <>
              {isOwner && (
                <>
                  <div className="pt-4 flex justify-between items-center h-10">
                    <Label className="text-xl font-bold">
                      Side Letter
                    </Label>
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
                            disabled={isFormLocked || !isOwner}
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
                            disabled={isFormLocked || !isOwner}
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
                            disabled={isFormLocked || !isOwner}
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
                            disabled={isFormLocked || !isOwner}
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
                          <FormLabel className="text-base">
                            Miscellaneous
                          </FormLabel>
                          <FormDescription>
                            {formDescriptions.miscellaneous}
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isFormLocked || !isOwner}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </>
              )}
              <div className="flex flex-col gap-2">
                <Button type="submit" className="w-full">
                  {isEditMode || isFormLocked ? "Save" : "Submit"}
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
      <Share
        investmentId={investmentId || ""}
        onEmailSent={() => setStep(3)}
        isOpen={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
      />
    </div>
  )
}
