"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useFormStore } from "@/lib/stores"
import { apiClient } from "@/lib/api-client"
import { Sparkles, Settings, Loader2, FileText, Zap, ChevronUp, ChevronDown, MessageCirclePlus } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { PerplexityLoading } from "@/components/ui/perplexity-loading"
import { PageHeading } from "@/components/ui/page-heading"
import { useDebug } from "@/lib/contexts/debug-context"

const PERPLEXITY_MODELS = [
  { id: "sonar-deep-research", name: "Sonar Deep Research", description: "Best for comprehensive analysis" },
  { id: "sonar-reasoning", name: "Sonar Reasoning", description: "Advanced reasoning capabilities" },
  { id: "sonar", name: "Sonar", description: "Standard model for general queries" },
  { id: "sonar-pro", name: "Sonar Pro", description: "Enhanced performance model" }
]

export function Results({ debugMode }: { debugMode?: boolean }) {
  const { formData } = useFormStore()
  const [fullPrompt, setFullPrompt] = useState("")
  const [selectedModel, setSelectedModel] = useState("sonar-deep-research")
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false)
  const [isGeneratingResult, setIsGeneratingResult] = useState(false)
  const [result, setResult] = useState("")
  const [error, setError] = useState("")
  
  // Collapsible and follow-up states
  const [isResultCollapsed, setIsResultCollapsed] = useState(false)
  const [followUpQuestion, setFollowUpQuestion] = useState("")
  const [followUpModel, setFollowUpModel] = useState("sonar-deep-research")
  const [isGeneratingFollowUp, setIsGeneratingFollowUp] = useState(false)
  const [followUpResult, setFollowUpResult] = useState("")
  const [followUpError, setFollowUpError] = useState("")

  // Generate the full prompt when component mounts
  useEffect(() => {
    generateFullPrompt()
  }, [formData])

  const generateFullPrompt = async () => {
    setIsGeneratingPrompt(true)
    setError("")
    
    try {
      // Get the full story from the backend
      const response = await apiClient.getFullStory(formData)
      
      // Clean the story by removing metadata sections
      const cleanStory = response.story
        .replace(/Completed[Ss]ections:[\s\S]*?(?=\n\n|\n[A-Z]|$)/g, '')
        .replace(/Destination:[\s\S]*?(?=\n\n|\n[A-Z]|$)/g, '')
        .replace(/Disclaimer:[\s\S]*?(?=\n\n|\n[A-Z]|$)/g, '')
        .replace(/^\s*-\s*$/gm, '') // Remove standalone dashes
        .replace(/\n{3,}/g, '\n\n') // Reduce multiple newlines
        .trim()
      
      // Create the comprehensive prompt
      const prompt = `As an expert immigration lawyer and tax advisor, please analyze the following individual's profile and provide comprehensive VISA and TAX guidance for their relocation plans. Include exactly how much tax they would pay in their first year of living there, with some guesstimates of how this could go in later years. Additionally suggest what visas they may want to apply for and why. 

INDIVIDUAL PROFILE:
${cleanStory}

ANALYSIS REQUESTED:
Please provide a detailed analysis covering:

1. VISA ELIGIBILITY & REQUIREMENTS:
   - Available visa options for this person's situation
   - Specific requirements and documentation needed
   - Timeline and application process
   - Likelihood of approval based on their profile
   - Alternative visa strategies if primary options are challenging

2. TAX IMPLICATIONS & OPTIMIZATION:
   - Tax residency implications in both current and destination countries
   - Potential tax obligations and liabilities
   - Tax optimization strategies specific to their financial situation
   - Double taxation treaty benefits if applicable
   - Recommended tax planning steps before and after relocation

3. SPECIFIC RECOMMENDATIONS:
   - Immediate action items to prepare for the move
   - Professional services they should engage (lawyers, tax advisors, etc.)
   - Common pitfalls to avoid in their specific situation
   - Timeline recommendations for the entire relocation process

Please be specific and actionable in your recommendations, considering their unique circumstances including family situation, financial profile, education background, and intended destination.`

      setFullPrompt(prompt)
    } catch (error) {
      console.error("Error generating full prompt:", error)
      setError("Failed to generate the analysis prompt. Please try again.")
    } finally {
      setIsGeneratingPrompt(false)
    }
  }

  const generateResult = async () => {
    if (!fullPrompt.trim()) {
      setError("Please ensure the prompt is generated before proceeding.")
      return
    }

    setIsGeneratingResult(true)
    setError("")
    setResult("")
    
    try {
      const response = await apiClient.getPerplexityAnalysis(fullPrompt, selectedModel)
      setResult(response.result)
    } catch (error) {
      console.error("Error generating result:", error)
      setError("Failed to generate the analysis. Please check your connection and try again.")
    } finally {
      setIsGeneratingResult(false)
    }
  }

  const generateFollowUp = async () => {
    if (!followUpQuestion.trim()) {
      setFollowUpError("Please enter a follow-up question.")
      return
    }

    if (!result.trim()) {
      setFollowUpError("Please generate the initial analysis first.")
      return
    }

    setIsGeneratingFollowUp(true)
    setFollowUpError("")
    setFollowUpResult("")
    
    try {
      // Create a follow-up prompt that includes the previous context
      const followUpPrompt = `Based on the previous analysis below, please answer this follow-up question:

FOLLOW-UP QUESTION: ${followUpQuestion}

PREVIOUS ANALYSIS CONTEXT:
${result}

Please provide a detailed answer to the follow-up question, referencing the previous analysis where relevant and providing any additional insights or clarifications.`

      const response = await apiClient.getPerplexityAnalysis(followUpPrompt, followUpModel)
      setFollowUpResult(response.result)
    } catch (error) {
      console.error("Error generating follow-up:", error)
      setFollowUpError("Failed to generate the follow-up response. Please check your connection and try again.")
    } finally {
      setIsGeneratingFollowUp(false)
    }
  }

  return (
    <div id="results" className="space-y-8 max-w-6xl mx-auto">
      <PageHeading 
        title="AI Analysis Results"
        description="Generate comprehensive VISA and TAX guidance based on your profile"
        icon={<Sparkles className="w-7 h-7 text-green-600" />}
      />

      {/* Analysis Prompt Card (Debug Only) */}
      {debugMode && (
        <Card className="shadow-sm border-l-4 border-l-orange-500">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/20">
          <CardTitle className="text-xl flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-600" />
            Analysis Prompt (Play around with it, and check the variety of the responses.)
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Review and edit the prompt that will be sent to the AI for analysis
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {isGeneratingPrompt ? (
              <div className="flex items-center gap-3 text-blue-600 p-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-lg font-medium">Generating comprehensive prompt...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <Label htmlFor="prompt" className="text-base font-semibold">
                  Full Analysis Prompt
                </Label>
                <Textarea
                  id="prompt"
                  value={fullPrompt}
                  onChange={(e) => setFullPrompt(e.target.value)}
                  className="min-h-[400px] font-mono text-sm"
                  placeholder="The analysis prompt will be generated automatically..."
                />
                <div className="flex justify-end">
                  <Button
                    onClick={generateFullPrompt}
                    variant="outline"
                    className="gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Regenerate Prompt
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      )}

      {/* Model Selection & Generate Card (Debug Only) */}
      {debugMode && (
        <Card className="shadow-sm border-l-4 border-l-purple-500">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950/20">
          <CardTitle className="text-xl flex items-center gap-3">
            <Settings className="w-6 h-6 text-purple-600" />
            AI Model Configuration (Only useful for testing: Sonar Deep Research is the best model for this use case in my experience. We can try the GPT API actually because it can surf the web too these days apparently)
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Select the AI model and generate your analysis (We will default this to Sonar Deep Research)
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="model" className="text-base font-semibold">
                Perplexity AI Model
              </Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERPLEXITY_MODELS.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{model.name}</span>
                        <span className="text-xs text-muted-foreground">{model.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-center">
              <Button
                onClick={generateResult}
                disabled={isGeneratingResult || isGeneratingPrompt || !fullPrompt.trim()}
                size="lg"
                className="px-8 py-3 text-lg font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-lg gap-3"
              >
                {isGeneratingResult ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Analysis...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Generate Result
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      )}

      {/* Generate Analysis Button (Always Visible when not in debug mode) */}
      {!debugMode && (
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex justify-center">
              <Button
                onClick={generateResult}
                disabled={isGeneratingResult || isGeneratingPrompt || !fullPrompt.trim()}
                size="lg"
                className="px-8 py-3 text-lg font-semibold shadow-lg gap-3"
              >
                {isGeneratingResult ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Analysis...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Analysis
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading Animation */}
      <PerplexityLoading 
        isLoading={isGeneratingResult} 
        loadingText="Generating Analysis..."
      />

      {/* Results Card - Collapsible */}
      {result && (
        <Collapsible open={!isResultCollapsed} onOpenChange={(open) => setIsResultCollapsed(!open)}>
          <Card className="shadow-sm border-l-4 border-l-green-500">
            <CollapsibleTrigger asChild>
              <CardHeader className="bg-gradient-to-r from-green-50 to-transparent dark:from-green-950/20 cursor-pointer hover:from-green-100 dark:hover:from-green-900/30 transition-colors">
                <CardTitle className="text-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-green-600" />
                    AI Analysis Result
                  </div>
                  <Button variant="ghost" size="sm" className="h-auto p-1">
                    {isResultCollapsed ? (
                      <ChevronDown className="w-5 h-5 text-green-600" />
                    ) : (
                      <ChevronUp className="w-5 h-5 text-green-600" />
                    )}
                  </Button>
                </CardTitle>
                <p className="text-sm text-muted-foreground text-left">
                  Comprehensive VISA and TAX guidance based on your profile
                  {isResultCollapsed && " • Click to expand"}
                </p>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-6">
                <div className="prose prose-lg max-w-none dark:prose-invert">
                  {result.split('\n').map((paragraph, idx) => (
                    paragraph.trim() ? (
                      <p key={idx} className="mb-4 leading-relaxed">{paragraph}</p>
                    ) : (
                      <br key={idx} />
                    )
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Follow-up Question Section */}
      {result && (
        <Card className="shadow-sm border-l-4 border-l-orange-500">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-transparent dark:from-orange-950/20">
            <CardTitle className="text-xl flex items-center gap-3">
              <MessageCirclePlus className="w-6 h-6 text-orange-600" />
              Follow-up Question
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Ask additional questions based on the analysis above
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="followup-question" className="text-base font-semibold">
                  Your Question
                </Label>
                <Textarea
                  id="followup-question"
                  value={followUpQuestion}
                  onChange={(e) => setFollowUpQuestion(e.target.value)}
                  placeholder="e.g., What specific documents do I need for the visa application? How much tax would I save in the first year? Are there any additional considerations for my family situation?"
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="followup-model" className="text-base font-semibold">
                  AI Model for Follow-up
                </Label>
                <Select value={followUpModel} onValueChange={setFollowUpModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PERPLEXITY_MODELS.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{model.name}</span>
                          <span className="text-xs text-muted-foreground">{model.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {followUpError && (
                <Alert variant="destructive">
                  <AlertDescription>{followUpError}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-center">
                <Button
                  onClick={generateFollowUp}
                  disabled={isGeneratingFollowUp || !followUpQuestion.trim()}
                  size="lg"
                  className="px-8 py-3 text-lg font-semibold bg-orange-600 hover:bg-orange-700 text-white shadow-lg gap-3"
                >
                  {isGeneratingFollowUp ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating Answer...
                    </>
                  ) : (
                    <>
                      <MessageCirclePlus className="w-5 h-5" />
                      Ask Follow-up Question
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Follow-up Loading Animation */}
      <PerplexityLoading 
        isLoading={isGeneratingFollowUp} 
        loadingText="Generating Follow-up Answer..."
      />

      {/* Follow-up Result Card */}
      {followUpResult && (
        <Card className="shadow-sm border-l-4 border-l-indigo-500">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-transparent dark:from-indigo-950/20">
            <CardTitle className="text-xl flex items-center gap-3">
              <MessageCirclePlus className="w-6 h-6 text-indigo-600" />
              Follow-up Answer
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              AI response to your follow-up question
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg border-l-4 border-l-indigo-400">
              <p className="text-sm font-medium text-indigo-800 dark:text-indigo-200 mb-1">Your Question:</p>
              <p className="text-sm text-indigo-700 dark:text-indigo-300 italic">"{followUpQuestion}"</p>
            </div>
            <div className="prose prose-lg max-w-none dark:prose-invert">
              {followUpResult.split('\n').map((paragraph, idx) => (
                paragraph.trim() ? (
                  <p key={idx} className="mb-4 leading-relaxed">{paragraph}</p>
                ) : (
                  <br key={idx} />
                )
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
