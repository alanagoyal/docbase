"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

import { Icons } from "./icons"
import { Share } from "./share"
import { Button } from "./ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
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
import Docxtemplater from "docxtemplater"
import { AlertCircle, Link, MenuIcon, Plus } from "lucide-react"
import mammoth from "mammoth"
import PizZip from "pizzip"

import { Database } from "@/types/supabase"
import { VisuallyHidden } from "./ui/visually-hidden"

type User = Database["public"]["Tables"]["users"]["Row"]

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false })

const downloadDocument = (url: string) => {
  window.open(url, "_blank")
  toast({
    title: "Downloaded",
    description: "The file has been downloaded",
  })
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

  const handleShareClick = (investmentId: string) => {
    setSelectedInvestmentId(investmentId)
    setIsShareDialogOpen(true)
  }

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
      router.push(`/investments/new?id=${investment.id}&edit=true`)
    } else if (isFounder(investment)) {
      router.push(`/investments/new?id=${investment.id}&edit=true&step=2`)
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

  const emailContent = (investment: any) => {
    return `
      <div>
        <p>Hi ${investment.founder.name.split(" ")[0]},</p><br>
        <p>
          ${investment.fund.name} has shared a SAFE agreement with you.
          Please find the document attached to this email and find a brief
          summary of the document and its terms below.
        </p><br>
        <p>Summary: ${investment.summary}</p><br>
        <p>
          Disclaimer: This summary is for informational purposes only and does
          not constitute legal advice. For any legal matters or specific
          questions, you should consult with a qualified attorney.
        </p>
      </div>
    `
  }

  const setSelectedInvestmentAndEmailContent = (investment: any) => {
    setSelectedInvestment(investment)
    setEditableEmailContent(emailContent(investment))
  }

  async function summarizeInvestment(
    doc: Docxtemplater
  ): Promise<string | null> {
    try {
      const blob = doc.getZip().generate({ type: "blob" })
      const arrayBuffer = await blob.arrayBuffer()
      const { value: htmlContent } = await mammoth.convertToHtml({
        arrayBuffer,
      })

      const response = await fetch("/api/generate-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: htmlContent }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Error",
          description: "Failed to summarize investment",
        })
        throw new Error("Failed to summarize investment")
      }

      if (data.summary.length === 0) {
        toast({
          title: "Error",
          description: "Failed to summarize investment",
        })
        throw new Error("Failed to summarize investment")
      }

      return data.summary
    } catch (error) {
      console.error("Error in summarizing investment:", error)
      return null
    }
  }

  async function sendEmail(investment: any) {
    setIsSendingEmail(true)
    const safeFilepath = `${investment.id}.docx`
    const sideLetterFilepath = `${investment.id}-side-letter.docx`

    let safeDocNodeBuffer = null
    let sideLetterDocNodeBuffer = null

    try {
      console.log("Investment data:", investment)

      if (investment.safe_url) {
        const { data: safeDoc, error: safeDocError } = await supabase.storage
          .from("documents")
          .download(safeFilepath)

        if (safeDocError) {
          console.error("Error downloading SAFE document:", safeDocError)
        } else if (safeDoc) {
          const safeDocBuffer = await safeDoc.arrayBuffer()
          safeDocNodeBuffer = Buffer.from(safeDocBuffer)
        }
      }

      if (investment.side_letter_id && investment.side_letter?.side_letter_url) {
        const { data: sideLetterDoc, error: sideLetterDocError } =
          await supabase.storage.from("documents").download(sideLetterFilepath)

        if (sideLetterDocError) {
          console.error("Error downloading side letter:", sideLetterDocError)
        } else if (sideLetterDoc) {
          const sideLetterDocBuffer = await sideLetterDoc.arrayBuffer()
          sideLetterDocNodeBuffer = Buffer.from(sideLetterDocBuffer)
        }
      }

      const emailContentToSend = editableEmailContent.replace(
        /<br\s*\/?>/gi,
        ""
      )

      const body = {
        investmentData: investment,
        safeAttachment: safeDocNodeBuffer,
        sideLetterAttachment: sideLetterDocNodeBuffer,
        emailContent: emailContentToSend,
      }

      console.log("Request body:", JSON.stringify(body, null, 2))

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
    const filepath = `${investment.id}.docx`

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
        // Download the generated SAFE document
        downloadDocument(safeUrl)
        toast({
          description: "The SAFE document has been generated and downloaded",
        })

        // Generate summary and update database in the background
        summarizeInvestment(safeDoc).then(async (investmentSummary) => {
          if (investmentSummary) {
            const { error: updateError } = await supabase
              .from("investments")
              .update({ safe_url: safeUrl, summary: investmentSummary })
              .eq("id", investment.id)

            if (updateError) {
              console.error("Error updating investment:", updateError)
              toast({
                description:
                  "There was an error updating the investment details",
                variant: "destructive",
              })
            }
          }
        })
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
            onClick={() =>
              router.push(
                `/investments/new?id=${investment.id}&edit=true&step=3`
              )
            }
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
        downloadDocument(sideLetterUrl)
        toast({
          description: "The side letter has been generated and downloaded",
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
    const filepath = `${investment.id}-side-letter.docx`

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
      }
    } else if (!investment.safe_url) {
      return {
        text: "Generate SAFE",
        action: () => processSafe(investment),
      }
    } else {
      return {
        text: "Send",
        action: () => {
          setSelectedInvestmentAndEmailContent(investment)
          setDialogOpen(true)
        },
      }
    }
  }

  const handleEmailSent = () => {
    // Refresh the investments data or update the UI as needed
    router.refresh()
  }

  return (
    <div>
      <Table className="w-full mt-10">
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/8">Company</TableHead>
            <TableHead className="w-1/8">Founder</TableHead>
            <TableHead className="w-1/8">Fund</TableHead>
            <TableHead className="w-1/8">Type</TableHead>
            <TableHead className="w-1/8">Amount</TableHead>
            <TableHead className="w-1/8">Date</TableHead>
            <TableHead className="w-1/8">Next Steps</TableHead>
            <TableHead className="w-1/8"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {investments.map((investment: any) => {
            const nextStep = getNextStep(investment)
            return (
              <TableRow key={investment.id}>
                <TableCell>
                  {investment.company ? (
                    investment.company.name
                  ) : (
                    <MissingInfoTooltip message="Company name missing" />
                  )}
                </TableCell>
                <TableCell>
                  {investment.founder ? (
                    `${investment.founder.name} (${investment.founder.email})`
                  ) : (
                    <MissingInfoTooltip message="Founder information missing" />
                  )}
                </TableCell>
                <TableCell>
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
                <TableCell>
                  {new Date(investment.date).toLocaleDateString("en-US", {
                    month: "2-digit",
                    day: "2-digit",
                    year: "2-digit",
                  })}
                </TableCell>
                <TableCell>
                  {nextStep.text === "Share" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShareClick(investment.id)}
                      className="w-28"
                    >
                      Share
                    </Button>
                  ) : nextStep.text === "Send" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextStep.action}
                      className="w-28"
                    >
                      Send
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextStep.action}
                      disabled={
                        !isOwner(investment) || generatingSafe === investment.id
                      }
                      className="w-28"
                    >
                      {generatingSafe === investment.id ? (
                        <Icons.spinner className="h-4 w-4 animate-spin" />
                      ) : (
                        nextStep.text
                      )}
                    </Button>
                  )}
                </TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost">
                        {generatingSideLetter === investment.id ? (
                          <Icons.spinner className="h-4 w-4 ml-2 animate-spin" />
                        ) : (
                          <MenuIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {isOwner(investment) && (
                        <>
                          {investment.safe_url && (
                            <DropdownMenuItem
                              onClick={() =>
                                downloadDocument(investment.safe_url)
                              }
                            >
                              Download SAFE Agreement
                            </DropdownMenuItem>
                          )}
                          {investment.side_letter_id && (
                            <DropdownMenuItem
                              onClick={() => processSideLetter(investment)}
                            >
                              Generate Side Letter
                            </DropdownMenuItem>
                          )}
                          {investment.side_letter_id &&
                            investment.side_letter.side_letter_url && (
                              <DropdownMenuItem
                                onClick={() =>
                                  downloadDocument(
                                    investment.side_letter.side_letter_url
                                  )
                                }
                              >
                                Download Side Letter
                              </DropdownMenuItem>
                            )}
                        </>
                      )}
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
                disabled={isSendingEmail}
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
        onEmailSent={handleEmailSent}
        isOpen={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
      />
    </div>
  )
}
