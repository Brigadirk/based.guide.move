import fs from "fs"
import path from "path"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, ArrowLeft, Calendar, Mail, Building } from "lucide-react"

export const metadata = { title: "Privacy Policy" }

export default async function PrivacyPolicyPage() {
  const filePath = path.join(process.cwd(), "privacypolicy", "privacy.md")
  const markdown = fs.readFileSync(filePath, "utf8")

  // Enhanced markdown → HTML helper with better styling
  let html = markdown
    // headings with improved Tailwind typography and spacing
    .replace(/^######\s+(.*)$/gm, '<h6 class="text-lg font-semibold mt-8 mb-4 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 pb-2">$1</h6>')
    .replace(/^#####\s+(.*)$/gm, '<h5 class="text-lg font-semibold mt-8 mb-4 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 pb-2">$1</h5>')
    .replace(/^####\s+(.*)$/gm, '<h4 class="text-xl font-semibold mt-8 mb-4 text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2">$1</h4>')
    .replace(/^###\s+(.*)$/gm, '<h3 class="text-2xl font-bold mt-10 mb-6 text-slate-900 dark:text-slate-100 border-b-2 border-primary/20 pb-3 flex items-center gap-2"><span class="w-2 h-6 bg-primary rounded-sm"></span>$1</h3>')
    .replace(/^##\s+(.*)$/gm, '<h2 class="text-3xl font-bold mt-12 mb-8 text-slate-900 dark:text-slate-100 border-b-2 border-primary/30 pb-4 flex items-center gap-3"><span class="w-3 h-8 bg-gradient-to-b from-primary to-primary/60 rounded"></span>$1</h2>')
    .replace(/^#\s+(.*)$/gm, '<h1 class="text-4xl font-bold mt-0 mb-8 text-slate-900 dark:text-slate-100 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">$1</h1>')
    // enhanced bold text
    .replace(/\*\*(.*?)\*\*/g, "<strong class='font-semibold text-slate-900 dark:text-slate-100'>$1</strong>")
    // convert markdown links to HTML links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "<a href='$2' target='_blank' class='text-primary underline hover:text-primary/80 font-medium'>$1</a>")
    // enhanced lists with better spacing
    .replace(/^-\s+(.*)$/gm, "<li class='text-slate-700 dark:text-slate-300 leading-relaxed'>$1</li>")

  // wrap consecutive <li> blocks into a styled <ul>
  html = html.replace(/(?:<li[\s\S]*?<\/li>\s*)+/g, (match) => 
    `<ul class="list-disc pl-6 space-y-3 my-6 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border-l-4 border-primary/30">${match}</ul>`
  )

  // enhanced paragraphs with better spacing and typography
  html = html
    .split(/\n{2,}/)
    .map((block) => {
      if (block.match(/^<\w/)) return block
      if (block.trim() === '') return ''
      return `<p class="text-slate-700 dark:text-slate-300 leading-relaxed mb-4 text-base">${block.replace(/\n/g, " ")}</p>`
    })
    .filter(block => block.trim() !== '')
    .join("\n")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="container mx-auto max-w-4xl px-4 py-12 space-y-8">
        
        {/* Header Card */}
        <Card className="border-2 border-slate-200 dark:border-slate-700 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-b border-slate-200 dark:border-slate-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    Privacy Policy
                  </CardTitle>
                  <div className="flex items-center gap-4 mt-2">
                    <Badge variant="secondary" className="bg-slate-200 dark:bg-slate-700">
                      <Calendar className="w-3 h-3 mr-1" />
                      Last Updated: July 17th 2025
                    </Badge>
                    <Badge variant="outline" className="border-primary/30">
                      <Building className="w-3 h-3 mr-1" />
                      GDPR Compliant
                    </Badge>
                  </div>
                </div>
              </div>
              <Link 
                href="/" 
                className="flex items-center gap-2 px-4 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Assessment
              </Link>
            </div>
          </CardHeader>
        </Card>

        {/* Content Card */}
        <Card className="border-2 border-slate-200 dark:border-slate-700 shadow-xl">
          <CardContent className="p-0">
            <div className="p-8 lg:p-12">
              <article 
                className="prose prose-slate dark:prose-invert max-w-none
                          prose-headings:scroll-mt-16
                          prose-h1:text-4xl prose-h1:font-bold prose-h1:mb-8
                          prose-h2:text-3xl prose-h2:font-bold prose-h2:mt-12 prose-h2:mb-8
                          prose-h3:text-2xl prose-h3:font-bold prose-h3:mt-10 prose-h3:mb-6
                          prose-p:text-base prose-p:leading-relaxed prose-p:mb-4
                          prose-strong:font-semibold prose-strong:text-slate-900 dark:prose-strong:text-slate-100
                          prose-ul:my-6 prose-li:my-1
                          prose-a:text-primary prose-a:underline prose-a:font-medium hover:prose-a:text-primary/80" 
                dangerouslySetInnerHTML={{ __html: html }} 
              />
            </div>
            
            {/* Footer Section */}
            <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-6">
              <div className="flex items-center justify-center gap-6 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>Questions? Contact our privacy team</span>
                </div>
                <div className="w-px h-4 bg-slate-300 dark:bg-slate-600"></div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>Based.guide - Dutch Privacy Law Compliant</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links Card */}
        <Card className="border border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <Shield className="w-6 h-6 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Data Protection</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Your data is encrypted and secure</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <Calendar className="w-6 h-6 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">No Data Storage</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">We never store your data</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <Mail className="w-6 h-6 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Your Rights</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Full GDPR compliance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 