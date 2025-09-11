"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useFormStore } from "@/lib/stores"
import { apiClient } from "@/lib/api-client"
import { Sparkles, Settings, Loader2, FileText, Zap, ChevronUp, ChevronDown, MessageSquarePlus, Download, Eye, EyeOff, Trash2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { PerplexityLoading } from "@/components/ui/perplexity-loading"
import { PageHeading } from "@/components/ui/page-heading"

const PERPLEXITY_MODELS = [
  { id: "sonar-deep-research", name: "Sonar Deep Research", description: "Best for comprehensive analysis" },
  { id: "sonar-reasoning", name: "Sonar Reasoning", description: "Advanced reasoning capabilities" },
  { id: "sonar", name: "Sonar", description: "Standard model for general queries" },
  { id: "sonar-pro", name: "Sonar Pro", description: "Enhanced performance model" }
]

export function Results({ debugMode }: { debugMode?: boolean }) {
  const { formData, updateFormData, getFormData } = useFormStore()
  
  // Load saved results from store
  const savedResults = getFormData("results") || {}
  
  const [fullPrompt, setFullPrompt] = useState(savedResults.fullPrompt || "")
  const [selectedModel, setSelectedModel] = useState("sonar-deep-research")
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false)
  const [isGeneratingResult, setIsGeneratingResult] = useState(false)
  const [result, setResult] = useState(savedResults.aiAnalysis || "")
  const [error, setError] = useState("")
  
  // Collapsible and follow-up states
  const [isResultCollapsed, setIsResultCollapsed] = useState(false)
  const [followUpQuestion, setFollowUpQuestion] = useState(savedResults.followUpQuestion || "")
  const [followUpModel, setFollowUpModel] = useState("sonar-deep-research")
  const [isGeneratingFollowUp, setIsGeneratingFollowUp] = useState(false)
  const [followUpResult, setFollowUpResult] = useState(savedResults.followUpAnswer || "")
  const [followUpError, setFollowUpError] = useState("")

  // Rate limiting state
  const [lastApiCall, setLastApiCall] = useState<number>(0)
  const [isRateLimited, setIsRateLimited] = useState(false)

  // Check if we're in a rate limit cooldown
  const checkRateLimit = () => {
    const now = Date.now()
    const timeSinceLastCall = now - lastApiCall
    const cooldownPeriod = 10000 // 10 seconds between calls
    
    if (timeSinceLastCall < cooldownPeriod) {
      setIsRateLimited(true)
      const remainingTime = Math.ceil((cooldownPeriod - timeSinceLastCall) / 1000)
      setError(`Please wait ${remainingTime} seconds before making another request.`)
      
      // Clear rate limit after cooldown
      setTimeout(() => {
        setIsRateLimited(false)
        setError("")
      }, cooldownPeriod - timeSinceLastCall)
      
      return false
    }
    
    setLastApiCall(now)
    setIsRateLimited(false)
    return true
  }

  // Process result to separate think section from main content
  const processResult = (rawResult: string) => {
    const thinkMatch = rawResult.match(/<think>([\s\S]*?)<\/think>/i)
    const thinkSection = thinkMatch ? thinkMatch[1].trim() : ""
    const mainContent = rawResult.replace(/<think>[\s\S]*?<\/think>/i, "").trim()
    
    return { thinkSection, mainContent }
  }

  const { thinkSection, mainContent } = result ? processResult(result) : { thinkSection: "", mainContent: "" }

  // Simple markdown renderer for basic formatting
  const renderMarkdown = (text: string) => {
    return text
      // Headers
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-6 mb-3">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-8 mb-4">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-8 mb-6">$1</h1>')
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Lists
      .replace(/^\- (.*$)/gm, '<li class="ml-4 mb-1">• $1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 mb-1 list-decimal">$1</li>')
      // Line breaks
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br>')
      // Wrap in paragraphs
      .replace(/^(?!<[h|l])/gm, '<p class="mb-4">')
      .replace(/(?<!>)$/gm, '</p>')
      // Clean up extra paragraph tags
      .replace(/<p class="mb-4"><\/p>/g, '')
      .replace(/<p class="mb-4">(<h[1-6])/g, '$1')
      .replace(/(<\/h[1-6]>)<\/p>/g, '$1')
      .replace(/<p class="mb-4">(<li)/g, '$1')
      .replace(/(<\/li>)<\/p>/g, '$1')
  }

  // Safe update function that handles localStorage quota errors
  const safeUpdateFormData = (path: string, value: any) => {
    try {
      updateFormData(path, value)
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded, clearing old data to make space')
        // Clear old results and other large data, then try again
        try {
          // Clear old results
          updateFormData("results.aiAnalysis", "")
          updateFormData("results.followUpAnswer", "")
          updateFormData("results.fullPrompt", "")
          
          // Clear other potentially large sections
          updateFormData("summary.editedFullStory", "")
          
          // Try saving again with cleared space
          updateFormData(path, value)
          console.log('Successfully saved after clearing space')
        } catch (secondError) {
          console.error('Failed to save even after clearing space:', secondError)
          // Show user-friendly message but don't set as error (results still work in session)
          console.warn("Storage full - results won't persist across sessions but are still available for download")
        }
      } else {
        console.error('Error saving to storage:', error)
      }
    }
  }

  // Clear all results
  const clearResults = () => {
    setResult("")
    setFollowUpResult("")
    setFollowUpQuestion("")
    setError("")
    setFollowUpError("")
    
    // Clear from store
    safeUpdateFormData("results.aiAnalysis", "")
    safeUpdateFormData("results.followUpQuestion", "")
    safeUpdateFormData("results.followUpAnswer", "")
  }

  // Get localStorage usage info for debug mode
  const getStorageInfo = () => {
    try {
      const used = JSON.stringify(localStorage).length
      const total = 5 * 1024 * 1024 // Approximate 5MB limit
      const percentage = Math.round((used / total) * 100)
      return { used, total, percentage }
    } catch {
      return { used: 0, total: 0, percentage: 0 }
    }
  }

  // Download function for markdown
  const downloadMarkdown = () => {
    const date = new Date().toISOString().split('T')[0]
    const filename = `immigration-analysis-${date}.md`
    const content = `# Immigration & Tax Analysis\n\nGenerated on: ${new Date().toLocaleDateString()}\n\n${mainContent}`
    
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Generate the full prompt when component mounts (with debouncing to avoid rate limits)
  useEffect(() => {
    // Only generate if we don't already have a prompt or if form data changed significantly
    if (!fullPrompt || !savedResults.fullPrompt) {
      const timeoutId = setTimeout(() => {
        generateFullPrompt()
      }, 500) // Debounce to avoid rapid API calls
      
      return () => clearTimeout(timeoutId)
    }
  }, [formData, fullPrompt, savedResults.fullPrompt])

  const generateFullPrompt = async () => {
    setIsGeneratingPrompt(true)
    setError("")
    
    try {
      // Get the full story from the backend
      const storyResponse = await apiClient.getFullStory(formData)
      
      // Get destination country from form data
      const destinationCountry = formData.destination?.country || "Unknown"
      
      // Generate prompt using backend prompt.py
      const promptResponse = await fetch('/api/backend/generate-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'local-development-key'
        },
        body: JSON.stringify({
          profile_story: storyResponse.story,
          destination_country: destinationCountry,
          include_raw_data: false,
          raw_data: ""
        })
      })
      
      if (!promptResponse.ok) {
        if (promptResponse.status === 429) {
          throw new Error("Rate limit exceeded. Please wait a moment before trying again.")
        }
        throw new Error(`Failed to generate prompt: ${promptResponse.statusText}`)
      }
      
      const promptData = await promptResponse.json()
      setFullPrompt(promptData.prompt)
      
      // Save prompt to store (full version)
      safeUpdateFormData("results.fullPrompt", promptData.prompt)
      safeUpdateFormData("results.generatedAt", new Date().toISOString())
      
    } catch (error) {
      console.error("Error generating full prompt:", error)
      if (error instanceof Error && error.message.includes("Rate limit")) {
        setError("Rate limit exceeded. Please wait 30 seconds before generating a new prompt.")
      } else {
        setError("Failed to generate the analysis prompt. Please try again.")
      }
    } finally {
      setIsGeneratingPrompt(false)
    }
  }

  const generateResult = async () => {
    if (!fullPrompt.trim()) {
      setError("Please ensure the prompt is generated before proceeding.")
      return
    }

    if (!checkRateLimit()) {
      return
    }

    setIsGeneratingResult(true)
    setError("")
    setResult("")
    
    // Clear any existing follow-up results when generating new analysis
    setFollowUpResult("")
    setFollowUpQuestion("")
    safeUpdateFormData("results.followUpQuestion", "")
    safeUpdateFormData("results.followUpAnswer", "")
    
    try {
      const response = await apiClient.getPerplexityAnalysis(fullPrompt, selectedModel)
      setResult(response.result)
      
      // Save result to store (full version - let safeUpdateFormData handle quota issues)
      safeUpdateFormData("results.aiAnalysis", response.result)
      safeUpdateFormData("results.model", selectedModel)
      safeUpdateFormData("results.generatedAt", new Date().toISOString())
      
    } catch (error) {
      console.error("Error generating result:", error)
      if (error instanceof Error && (error.message.includes("429") || error.message.includes("Rate limit"))) {
        setError("Rate limit exceeded. Please wait a few minutes before generating another analysis.")
      } else {
        setError("Failed to generate the analysis. Please check your connection and try again.")
      }
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

    if (!checkRateLimit()) {
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
      
      // Save follow-up to store (full version)
      safeUpdateFormData("results.followUpQuestion", followUpQuestion)
      safeUpdateFormData("results.followUpAnswer", response.result)
      
    } catch (error) {
      console.error("Error generating follow-up:", error)
      if (error instanceof Error && (error.message.includes("429") || error.message.includes("Rate limit"))) {
        setFollowUpError("Rate limit exceeded. Please wait a few minutes before asking another follow-up question.")
      } else {
        setFollowUpError("Failed to generate the follow-up response. Please check your connection and try again.")
      }
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
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Select the AI model and generate your analysis (We will default this to Sonar Deep Research)
            </p>
            <div className="text-xs text-muted-foreground">
              Storage: {getStorageInfo().percentage}% used
            </div>
          </div>
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
                disabled={isGeneratingResult || isGeneratingPrompt || !fullPrompt.trim() || isRateLimited}
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
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation()
                        downloadMarkdown()
                      }}
                      className="h-8 px-3 text-xs"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                    {debugMode && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation()
                          clearResults()
                        }}
                        className="h-8 px-3 text-xs text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Clear
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="h-auto p-1">
                      {isResultCollapsed ? (
                        <ChevronDown className="w-5 h-5 text-green-600" />
                      ) : (
                        <ChevronUp className="w-5 h-5 text-green-600" />
                      )}
                    </Button>
                  </div>
                </CardTitle>
                <p className="text-sm text-muted-foreground text-left">
                  Comprehensive VISA and TAX guidance based on your profile
                  {isResultCollapsed && " • Click to expand"}
                </p>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-6">
                {/* Debug Think Section - Only show in debug mode */}
                {debugMode && thinkSection && (
                  <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Eye className="w-4 h-4 text-yellow-600" />
                      <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">AI Reasoning (Debug Mode)</h4>
                    </div>
                    <div className="text-sm text-yellow-700 dark:text-yellow-300 whitespace-pre-wrap font-mono">
                      {thinkSection}
                    </div>
                  </div>
                )}

                {/* Main Content - Rendered Markdown */}
                <div className="prose prose-lg max-w-none dark:prose-invert">
                  <div dangerouslySetInnerHTML={{ __html: renderMarkdown(mainContent) }} />
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
              <MessageSquarePlus className="w-6 h-6 text-orange-600" />
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

              {/* Model Selection - Debug Mode Only */}
              {debugMode && (
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
              )}

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
                      <MessageSquarePlus className="w-5 h-5" />
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
              <MessageSquarePlus className="w-6 h-6 text-indigo-600" />
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
              <div dangerouslySetInnerHTML={{ __html: renderMarkdown(followUpResult) }} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
