"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

import { Icons } from "./icons"
import { Share } from "./share"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"
import { toast } from "./ui/use-toast"
import "react-quill/dist/quill.snow.css"
import { useCompletion } from "ai/react"
import Docxtemplater from "docxtemplater"
import { AlertCircle, Download, MenuIcon } from "lucide-react"
import mammoth from "mammoth"
import PizZip from "pizzip"

import { Database } from "@/types/supabase"
import { cn } from "@/lib/utils"

type User = Database["public"]["Tables"]["users"]["Row"]

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false })

const downloadDocument = (url: string) => {
  window.open(url, "_blank")
}

export default function Investments({
  investments,
  account,
}: {
  investments: any
  account: User
}) {
  const router = useRouter()
  const supabase = createClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedInvestment, setSelectedInvestment] = useState(null)
  const [editableEmailContent, setEditableEmailContent] = useState("")
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [generatingSafe, setGeneratingSafe] = useState<string | null>(null)
  const [generatingSideLetter, setGeneratingSideLetter] = useState<
    string | null
  >(null)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [selectedInvestmentId, setSelectedInvestmentId] = useState<
    string | null
  >(null)

  const { complete, isLoading: generatingSummary } = useCompletion({
    api: "/api/generate-summary",
  })

  const formatCurrency = (amountStr: string): string => {
    const amount = parseFloat(amountStr.replace(/,/g, ""))
    if (amount >= 1_000_000) {
      const millions = amount / 1_000_000
      return `$${
        millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)
      }M`
    } else if (amount >= 1000) {
      const thousands = amount / 1000
      return `$${
        thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(1)
      }k`
    } else {
      return `$${amount}`
    }
  }

  const formatInvestmentType = (
    type: "valuation-cap" | "discount" | "mfn" | string
  ): JSX.Element | string => {
    if (!type) {
      return <MissingInfoTooltip message="Investment type not set" />
    }
    const investmentTypes: Record<
      "valuation-cap" | "discount" | "mfn",
      string
    > = {
      "valuation-cap": "Valuation Cap",
      discount: "Discount",
      mfn: "MFN",
    }
    return investmentTypes[type as "valuation-cap" | "discount" | "mfn"] || type
  }

  const isOwner = (investment: any) => {
    return investment.created_by === account.auth_id
  }

  const isFounder = (investment: any) => {
    return investment.founder.id === account.id
  }
  const MissingInfoTooltip = ({ message }: { message: string }) => (
    <span className="text-red-500">
      <AlertCircle className="inline-block mr-2 h-4 w-4" />
      {message}
    </span>
  )

  const editInvestment = (investment: any) => {
    if (isOwner(investment)) {
      router.push(`/investments/${investment.id}`)
    } else if (isFounder(investment)) {
      router.push(`/investments/${investment.id}?step=2`)
    }
  }

  async function deleteInvestment(investment: any) {
    const { error } = await supabase
      .from("investments")
      .delete()
      .eq("id", investment.id)
    if (error) throw error
    toast({
      title: "Investment deleted",
      description: "This investment has been deleted",
    })
    router.refresh()
  }

  async function summarizeInvestment(
    investment: any,
    doc: Docxtemplater
  ): Promise<string> {
    console.log("Starting summarizeInvestment function")
    try {
      const blob = doc.getZip().generate({ type: "blob" })
      const arrayBuffer = await blob.arrayBuffer()
      console.log("Document converted to arrayBuffer")

      const { value: htmlContent } = await mammoth.convertToHtml({
        arrayBuffer,
      })
      console.log(
        "Document converted to HTML:",
        htmlContent.substring(0, 100) + "..."
      )

      console.log("Calling AI completion...")
      const result = await complete("", {
        body: {
          content: htmlContent,
        },
      })
      console.log("AI completion result:", result)

      if (result) {
        const { error: summaryUpdateError } = await supabase
          .from("investments")
          .update({ summary: result })
          .eq("id", investment.id)

        if (summaryUpdateError) {
          console.error(
            "Error updating investment summary:",
            summaryUpdateError
          )
        }
      }

      return result || ""
    } catch (error) {
      console.error("Error in summarizing investment:", error)
      return ""
    }
  }

  const emailContent = async (investment: any) => {
    console.log("Generating email content")
    const safeLink = `/links/view/${investment.id}`
    const sideLetterLink = investment.side_letter_id
      ? `/links/view/${investment.side_letter_id}`
      : null

    console.log("Initial summary:", investment.summary)

    let summary = investment.summary || ""
    if (!summary) {
      console.log("No summary found, generating SAFE and summary")
      const safeDoc = await generateSafe(investment)
      summary = await summarizeInvestment(investment, safeDoc) || ""
    }

    const content = `
      <div>
        <p>Hi ${investment.founder.name.split(" ")[0]},</p><br>
        <p>
          ${
            investment.fund.name
          } has shared a SAFE agreement with you. You can view and download the SAFE Agreement <a href="${
      window.location.origin
    }${safeLink}">here</a>
          ${
            sideLetterLink
              ? `and the Side Letter <a href="${window.location.origin}${sideLetterLink}">here</a>`
              : ""
          }.
        </p><br>
        <p>
          Summary: ${summary}
        </p><br>
        <p>
          Disclaimer: This summary is for informational purposes only and does
          not constitute legal advice. For any legal matters or specific
          questions, you should consult with a qualified attorney.
        </p>
      </div>
    `

    console.log("Generated email content:", content)
    return content
  }

  const setSelectedInvestmentAndEmailContent = async (investment: any) => {
    console.log("Setting selected investment and email content")
    setSelectedInvestment(investment)
    const content = await emailContent(investment)
    console.log("Setting editable email content:", content)
    setEditableEmailContent(content)
  }

  async function sendEmail(investment: any) {
    setIsSendingEmail(true)
    try {
      const emailContentToSend = editableEmailContent.replace(
        /<br\s*\/?>/gi,
        ""
      )

      const body = {
        investmentData: investment,
        emailContent: emailContentToSend,
      }

      const response = await fetch("/api/send-investment-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to send email: ${errorText}`)
      }

      toast({
        title: "Email sent",
        description: `The email has been sent to ${investment.founder.email}`,
      })
    } catch (error) {
      console.error("Error in sendEmail function:", error)
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSendingEmail(false)
      setDialogOpen(false)
    }
  }

  async function createSafeUrl(
    investment: any,
    doc: Docxtemplater
  ): Promise<string | null> {
    const filepath = `${investment.id}`

    try {
      const file = doc.getZip().generate({ type: "nodebuffer" })
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filepath, file, {
          upsert: true,
          contentType:
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          cacheControl: "3600",
        })

      if (uploadError) {
        console.error("Upload error:", uploadError)
        return null
      }

      const { data: newSignedUrlData, error: newSignedUrlError } =
        await supabase.storage.from("documents").createSignedUrl(filepath, 3600)
      if (newSignedUrlError) {
        console.error(
          "Failed to create signed URL after upload:",
          newSignedUrlError
        )
        return null
      }

      const { error: linkError } = await supabase.rpc("upsert_link_data", {
        id_arg: investment.id,
        filename_arg: `${investment.company.name} <> ${investment.fund.name} SAFE.docx`,
        url_arg: newSignedUrlData?.signedUrl,
        created_by_arg: account.auth_id,
        created_at_arg: investment.date,
        password_arg: null,
        expires_arg: null,
        auth_id_arg: account.auth_id,
      })

      if (linkError) {
        console.error(linkError)
      }

      return newSignedUrlData?.signedUrl || null
    } catch (error) {
      console.error("Error in createSafeUrl function:", error)
      return null
    }
  }

  async function generateSafe(investment: any) {
    const formattedDate = formatSubmissionDate(investment.date)
    const templateFileName = selectTemplate(investment.investment_type || "mfn")
    const doc = await loadAndPrepareTemplate(
      templateFileName,
      investment,
      formattedDate
    )
    return doc
  }

  function selectTemplate(type: string): string {
    switch (type) {
      case "valuation-cap":
        return "SAFE-Valuation-Cap.docx"
      case "discount":
        return "SAFE-Discount.docx"
      case "mfn":
        return "SAFE-MFN.docx"
      default:
        return "SAFE-MFN.docx"
    }
  }

  async function loadAndPrepareTemplate(
    templateFileName: string,
    investment: any,
    formattedDate: string
  ): Promise<Docxtemplater> {
    const response = await fetch(`/${templateFileName}`)
    const arrayBuffer = await response.arrayBuffer()
    const zip = new PizZip(arrayBuffer)
    const doc = new Docxtemplater().loadZip(zip)
    doc.setData({
      company_name: investment.company.name || "{company_name}",
      investing_entity_name: investment.fund.name || "{investing_entity_name}",
      byline: investment.fund.byline || "",
      purchase_amount: investment.purchase_amount || "{purchase_amount}",
      valuation_cap: investment.valuation_cap || "{valuation_cap}",
      discount: investment.discount
        ? (100 - Number(investment.discount)).toString()
        : "{discount}",
      state_of_incorporation:
        investment.company.state_of_incorporation || "{state_of_incorporation}",
      date: formattedDate || "{date}",
      investor_name: investment.investor.name || "{investor_name}",
      investor_title: investment.investor.title || "{investor_title}",
      investor_email: investment.investor.email || "{investor_email}",
      investor_address_1: investment.fund.street || "{investor_address_1}",
      investor_address_2:
        investment.fund.city_state_zip || "{investor_address_2}",
      founder_name: investment.founder.name || "{founder_name}",
      founder_title: investment.founder.title || "{founder_title}",
      founder_email: investment.founder.email || "{founder_email}",
      company_address_1: investment.company.street || "{company_address_1}",
      company_address_2:
        investment.company.city_state_zip || "{company_address_2}",
    })
    doc.render()
    return doc
  }

  async function processSafe(investment: any) {
    setGeneratingSafe(investment.id)
    try {
      const safeDoc = await generateSafe(investment)
      const safeUrl = await createSafeUrl(investment, safeDoc)

      if (safeUrl) {
        // Update the database with the safe_url immediately
        const { error: updateError } = await supabase
          .from("investments")
          .update({ safe_url: safeUrl })
          .eq("id", investment.id)

        if (updateError) {
          console.error("Error updating investment with safe_url:", updateError)
          toast({
            description: "There was an error updating the investment details",
            variant: "destructive",
          })
        } else {
          toast({
            description:
              "The SAFE document has been generated and a shareable link has been created",
          })
        }
      } else {
        toast({
          description: "There was an error generating the SAFE document",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error processing SAFE document:", error)
      toast({
        description: "There was an error generating the SAFE document",
        variant: "destructive",
      })
    } finally {
      setGeneratingSafe(null)
      router.refresh()
    }
  }

  async function processSideLetter(investment: any) {
    setGeneratingSideLetter(investment.id)
    // Only process if the side letter is not empty
    if (!investment.side_letter) {
      toast({
        description:
          "Please select at least one option to generate a side letter",
        action: (
          <Button
            variant="outline"
            onClick={() => router.push(`/investments/${investment.id}?step=3`)}
          >
            Edit Investment
          </Button>
        ),
      })
      setGeneratingSideLetter(null)
      return null
    }
    try {
      const sideLetterDoc = await generateSideLetter(investment)
      const sideLetterUrl = await createSideLetterUrl(investment, sideLetterDoc)
      const sideLetter = {
        ...(investment.side_letter_id && { id: investment.side_letter_id }),
        info_rights: investment.side_letter.info_rights,
        pro_rata_rights: investment.side_letter.pro_rata_rights,
        major_investor_rights: investment.side_letter.major_investor_rights,
        termination: investment.side_letter.termination,
        miscellaneous: investment.side_letter.miscellaneous,
        side_letter_url: sideLetterUrl,
      }
      // Upsert the side_letters table with this data using the id of the investment
      const { data: sideLetterData, error: sideLetterError } = await supabase
        .from("side_letters")
        .upsert({ ...sideLetter })
        .select("id")
      if (sideLetterError) throw sideLetterError

      // Download the generated side letter
      if (sideLetterUrl) {
        toast({
          description:
            "The side letter has been generated and a shareable link has been created",
        })
      } else {
        toast({
          description: "There was an error generating the side letter",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error processing side letter:", error)
      toast({
        description: "There was an error generating the side letter",
        variant: "destructive",
      })
    } finally {
      setGeneratingSideLetter(null)
    }
  }

  async function generateSideLetter(investment: any) {
    const formattedDate = formatSubmissionDate(investment.date)
    const doc = await loadAndPrepareSideLetterTemplate(
      investment,
      formattedDate
    )
    return doc
  }

  function formatSubmissionDate(dateInput: string | Date): string {
    let date: Date

    if (typeof dateInput === "string") {
      // Try to parse the string date
      date = new Date(dateInput)
    } else if (dateInput instanceof Date) {
      date = dateInput
    } else {
      // If the input is neither a string nor a Date, use current date
      date = new Date()
    }

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.error("Invalid date:", dateInput)
      // Use current date as fallback
      date = new Date()
    }

    const monthName = new Intl.DateTimeFormat("en-US", {
      month: "long",
    }).format(date)
    const day = date.getDate()
    const year = date.getFullYear()
    const suffix = getNumberSuffix(day)
    return `${monthName} ${day}${suffix}, ${year}`
  }

  function getNumberSuffix(day: number): string {
    if (day >= 11 && day <= 13) {
      return "th"
    }
    switch (day % 10) {
      case 1:
        return "st"
      case 2:
        return "nd"
      case 3:
        return "rd"
      default:
        return "th"
    }
  }

  async function loadAndPrepareSideLetterTemplate(
    investment: any,
    formattedDate: string
  ): Promise<Docxtemplater> {
    const response = await fetch(`/Side-Letter.docx`)
    const arrayBuffer = await response.arrayBuffer()
    const zip = new PizZip(arrayBuffer)
    const doc = new Docxtemplater(zip, { linebreaks: true })
    doc.setData({
      company_name: investment.company.name || "{company_name}",
      investing_entity_name: investment.fund.name || "{investing_entity_name}",
      byline: investment.fund.byline || "",
      purchase_amount: investment.purchase_amount || "{purchase_amount}",
      valuation_cap: investment.valuation_cap || "{valuation_cap}",
      discount: investment.discount
        ? (100 - Number(investment.discount)).toString()
        : "{discount}",
      state_of_incorporation:
        investment.company.state_of_incorporation || "{state_of_incorporation}",
      date: formattedDate || "{date}",
      investor_name: investment.investor.name || "{investor_name}",
      investor_title: investment.investor.title || "{investor_title}",
      investor_email: investment.investor.email || "{investor_email}",
      investor_address_1: investment.fund.street || "{investor_address_1}",
      investor_address_2:
        investment.fund.city_state_zip || "{investor_address_2}",
      founder_name: investment.founder.name || "{founder_name}",
      founder_title: investment.founder.title || "{founder_title}",
      founder_email: investment.founder.email || "{founder_email}",
      company_address_1: investment.company.street || "{company_address_1}",
      company_address_2:
        investment.company.city_state_zip || "{company_address_2}",
      info_rights: investment.side_letter.info_rights || false,
      pro_rata_rights: investment.side_letter.pro_rata_rights || false,
      major_investor_rights:
        investment.side_letter.major_investor_rights || false,
      termination: investment.side_letter.termination || false,
      miscellaneous: investment.side_letter.miscellaneous || false,
    })
    doc.render()
    return doc
  }

  async function createSideLetterUrl(
    investment: any,
    doc: Docxtemplater
  ): Promise<string | null> {
    const filepath = `${investment.side_letter_id}`

    try {
      const file = doc.getZip().generate({ type: "nodebuffer" })
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filepath, file, {
          upsert: true,
          contentType:
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          cacheControl: "3600",
        })

      if (uploadError) {
        console.error("Upload error:", uploadError)
        return null
      }

      const { data: newSignedUrlData, error: newSignedUrlError } =
        await supabase.storage.from("documents").createSignedUrl(filepath, 3600)
      if (newSignedUrlError) {
        console.error(
          "Failed to create signed URL after upload:",
          newSignedUrlError
        )
        return null
      }

      const { error: linkError } = await supabase.rpc("upsert_link_data", {
        id_arg: investment.side_letter_id,
        filename_arg: `${investment.company.name} <> ${investment.fund.name} Side Letter.docx`,
        url_arg: newSignedUrlData?.signedUrl,
        created_by_arg: account.auth_id,
        created_at_arg: investment.date,
        password_arg: null,
        expires_arg: null,
        auth_id_arg: account.auth_id,
      })

      if (linkError) {
        console.error(linkError)
      }

      return newSignedUrlData?.signedUrl || null
    } catch (error) {
      console.error("Error in createSideLetterUrl function:", error)
      return null
    }
  }

  const getNextStep = (investment: any) => {
    if (!investment.company || !investment.founder) {
      return {
        text: "Share",
        action: () => {
          // This will be handled by the Share component
        },
        className: "bg-[#74EBD5] text-white hover:bg-[#5ED1BB]",
        nonOwnerText: "Waiting for required info",
      }
    } else if (
      !investment.safe_url ||
      (investment.side_letter && !investment.side_letter.side_letter_url)
    ) {
      return {
        text: "Generate",
        action: () => processDocuments(investment),
        className: "bg-[#9FACE6] text-white hover:bg-[#8A9BD1]",
        nonOwnerText: "Waiting to generate docs",
      }
    } else {
      return {
        text: "Send",
        action: () => {
          setSelectedInvestmentAndEmailContent(investment)
          setDialogOpen(true)
        },
        className: "bg-[#87C4DB] text-white hover:bg-[#72AFD6]",
        nonOwnerText: "Awaiting signature",
      }
    }
  }

  async function processDocuments(investment: any) {
    setGeneratingSafe(investment.id)
    setGeneratingSideLetter(investment.id)
    try {
      await processSafe(investment)
      if (investment.side_letter) {
        await processSideLetter(investment)
      }
      toast({
        description:
          "Documents have been generated and shareable links have been created",
      })
    } catch (error) {
      console.error("Error processing documents:", error)
      toast({
        description: "There was an error generating the documents",
        variant: "destructive",
      })
    } finally {
      setGeneratingSafe(null)
      setGeneratingSideLetter(null)
      router.refresh()
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "n/a"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "2-digit",
      timeZone: "UTC",
    })
  }

  return (
    <div className="container mx-auto py-10">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/6">Investment</TableHead>
            <TableHead className="w-1/6">Type</TableHead>
            <TableHead className="w-1/6">Amount</TableHead>
            <TableHead className="w-1/6">Date</TableHead>
            <TableHead className="w-1/6">Next Steps</TableHead>
            <TableHead className="w-1/6">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {investments.map((investment: any) => {
            const nextStep = getNextStep(investment)
            return (
              <TableRow key={investment.id}>
                <TableCell className="font-medium">
                  {investment.company ? (
                    investment.company.name
                  ) : (
                    <MissingInfoTooltip message="Company name missing" />
                  )}
                  {" <> "}
                  {investment.fund ? (
                    `${investment.fund.name}`
                  ) : (
                    <MissingInfoTooltip message="Fund name missing" />
                  )}
                </TableCell>
                <TableCell>
                  {formatInvestmentType(investment.investment_type)}
                  {investment.investment_type === "valuation-cap" &&
                    ` (${formatCurrency(investment.valuation_cap)})`}
                  {investment.investment_type === "discount" &&
                    ` (${investment.discount}%)`}
                </TableCell>
                <TableCell>
                  {investment.purchase_amount ? (
                    formatCurrency(investment.purchase_amount)
                  ) : (
                    <MissingInfoTooltip message="Purchase amount not set" />
                  )}
                </TableCell>
                <TableCell>{formatDate(investment.date)}</TableCell>
                <TableCell>
                  {isOwner(investment) ? (
                    <Button
                      size="sm"
                      onClick={nextStep.action}
                      disabled={
                        nextStep.text === "Generate" &&
                        (generatingSafe === investment.id ||
                          generatingSideLetter === investment.id)
                      }
                      className={cn("w-28", nextStep.className, {
                        "opacity-50 cursor-not-allowed":
                          nextStep.text === "Generate" &&
                          (generatingSafe === investment.id ||
                            generatingSideLetter === investment.id),
                      })}
                    >
                      {nextStep.text === "Generate" &&
                      (generatingSafe === investment.id ||
                        generatingSideLetter === investment.id) ? (
                        <Icons.spinner className="h-4 w-4 animate-spin" />
                      ) : (
                        nextStep.text
                      )}
                    </Button>
                  ) : (
                    <span className="text-sm text-gray-500">
                      {nextStep.nonOwnerText}
                    </span>
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {isOwner(investment) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost">
                            <Download className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {investment.safe_url ? (
                            <>
                              <DropdownMenuItem
                                onClick={() =>
                                  downloadDocument(investment.safe_url)
                                }
                              >
                                Download SAFE Agreement
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => processSafe(investment)}
                              >
                                Update SAFE Agreement
                              </DropdownMenuItem>
                            </>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => processSafe(investment)}
                            >
                              Generate SAFE Agreement
                            </DropdownMenuItem>
                          )}
                          {investment.side_letter_id &&
                          investment.side_letter?.side_letter_url ? (
                            <>
                              <DropdownMenuItem
                                onClick={() =>
                                  downloadDocument(
                                    investment.side_letter.side_letter_url
                                  )
                                }
                              >
                                Download Side Letter
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => processSideLetter(investment)}
                              >
                                Update Side Letter
                              </DropdownMenuItem>
                            </>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => processSideLetter(investment)}
                            >
                              Generate Side Letter
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost">
                          <MenuIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => editInvestment(investment)}
                        >
                          Edit
                        </DropdownMenuItem>
                        {isOwner(investment) && (
                          <DropdownMenuItem
                            onClick={() => deleteInvestment(investment)}
                          >
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="flex flex-col">
          <DialogHeader>
            <DialogTitle>Send Email</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 flex-grow">
            <div className="flex flex-col gap-2 flex-grow">
              <ReactQuill
                value={editableEmailContent}
                onChange={setEditableEmailContent}
                className="flex-grow"
              />
            </div>
            <div>
              <Button
                onClick={() => sendEmail(selectedInvestment)}
                disabled={isSendingEmail || generatingSummary}
                className="w-full"
              >
                {isSendingEmail ? (
                  <Icons.spinner className="h-4 w-4 animate-spin" />
                ) : (
                  "Send Email"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Share
        investmentId={selectedInvestmentId || ""}
        onEmailSent={() => router.refresh()}
        isOpen={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
      />
    </div>
  )
}
