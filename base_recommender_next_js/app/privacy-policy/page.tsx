import fs from "fs"
import path from "path"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = { title: "Privacy Policy" }

export default async function PrivacyPolicyPage() {
  const filePath = path.join(process.cwd(), "privacypolicy", "privacy.md")
  const markdown = fs.readFileSync(filePath, "utf8")

  // very small markdown → HTML helper for headings & lists
  let html = markdown
    // headings with Tailwind typography
    .replace(/^######\s+(.*)$/gm, '<h6 class="text-base font-semibold mt-5">$1</h6>')
    .replace(/^#####\s+(.*)$/gm, '<h5 class="text-base font-semibold mt-5">$1</h5>')
    .replace(/^####\s+(.*)$/gm, '<h4 class="text-lg font-semibold mt-6">$1</h4>')
    .replace(/^###\s+(.*)$/gm, '<h3 class="text-xl font-semibold mt-6">$1</h3>')
    .replace(/^##\s+(.*)$/gm, '<h2 class="text-2xl font-bold mt-6">$1</h2>')
    .replace(/^#\s+(.*)$/gm, '<h1 class="text-3xl font-bold mt-6">$1</h1>')
    // bold **text**
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    // unordered lists
    .replace(/^-\s+(.*)$/gm, "<li>$1</li>")

  // wrap consecutive <li> blocks into a single <ul>
  html = html.replace(/(?:<li>[\s\S]*?<\/li>\s*)+/g, (match) => `<ul class="list-disc pl-6 space-y-1">${match}</ul>`)

  // paragraphs for remaining plain text blocks
  html = html
    .split(/\n{2,}/)
    .map((block) => (block.match(/^<\w/) ? block : `<p>${block.replace(/\n/g, " ")}</p>`))
    .join("\n")

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto max-w-3xl px-4 py-8 space-y-6">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Privacy Policy</CardTitle>
            <Link href="/" className="text-sm underline text-primary">
              ← Back to questionnaire
            </Link>
          </CardHeader>
          <CardContent>
            <article className="space-y-4 text-sm leading-6" dangerouslySetInnerHTML={{ __html: html }} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 