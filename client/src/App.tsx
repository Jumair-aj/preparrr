"use client"

import { useState, useEffect } from "react"
import Editor from "@monaco-editor/react"
import { questions, type Question } from "./data"
import { useTheme } from "./context/theme-context"
import { Button } from "./components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "./components/ui/alert"
import { Badge } from "./components/ui/badge"
import { Progress } from "./components/ui/progress"
import {
  CheckCircle,
  XCircle,
  Code,
  FileCode,
  Terminal,
  Clock,
  Cpu,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  BarChart
} from "lucide-react"
import { ThemeToggle } from "./components/theme-toggle"
// import { output } from "framer-motion/client"

export default function App() {
  const { theme } = useTheme()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [code, setCode] = useState(`// Write your solution for "${questions[0].title}" here\n\n`)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    stats?: { time: string; memory: string }
  } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [timer, setTimer] = useState(0)
  const [timerActive, setTimerActive] = useState(false)

  const question: Question = questions[currentQuestionIndex]

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined = undefined

    if (timerActive) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timerActive])

  useEffect(() => {
    // Start timer when page loads
    setTimerActive(true)

    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Enter to submit
      if (e.ctrlKey && e.key === "Enter") {
        executeCode()
      }

      // Alt+Left/Right to navigate questions
      if (e.altKey && e.key === "ArrowLeft") {
        navigateQuestion(-1)
      }
      if (e.altKey && e.key === "ArrowRight") {
        navigateQuestion(1)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const executeCode = async () => {
    setIsSubmitting(true)
    setResult(null)
    setProgress(0)

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval)
          return prev
        }
        return prev + 5
      })
    }, 50)

    try {
      const result = await fetch("https://preparrr-run-server.vercel.app/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, testCases: question.testCases }),
      })
      const data = await result.json()
      if (!result.ok) {
        throw new Error(data.message || "Code execution failed")
      }
      // For demo purposes, we'll just check if the code contains certain keywords
      // const isCorrect =
      //   code.includes("return") &&
      //   (code.toLowerCase().includes(question.title.toLowerCase()) || code.includes(question.expectedSolution))

      clearInterval(progressInterval)
      setProgress(100)

      // Add a small delay before showing the result for a smoother transition
      setTimeout(() => {
        if (data.success) {
          setResult({
            success: true,
            message: data?.message || "All test cases passed! Your solution is correct.",
            stats: {
              time: `${Math.floor(Math.random() * 20) + 50}ms`,
              memory: `${Math.floor(Math.random() * 2) + 38}.${Math.floor(Math.random() * 9)}MB`,
            },
          })
        } else {
          setResult({
            success: false,
            message: data?.message || "Your solution failed some test cases. Please try again.",
          })
        }
        setIsSubmitting(false)
      }, 300)
    } catch {
      clearInterval(progressInterval)
      setProgress(100)

      setTimeout(() => {
        setResult({
          success: false,
          message: "An error occurred while executing your code.",
        })
        setIsSubmitting(false)
      }, 300)
    }
  }

  const navigateQuestion = (direction: number) => {
    const newIndex = currentQuestionIndex + direction
    if (newIndex >= 0 && newIndex < questions.length) {
      handleQuestionChange(newIndex)
    }
  }

  const handleQuestionChange = (index: number) => {
    setCurrentQuestionIndex(index)
    setCode(`// Write your solution for "${questions[index].title}" here\n\n`)
    setResult(null)
  }

  const getDifficultyColor = (index: number) => {
    const colors = ["emerald", "amber", "rose"]
    return colors[index % 3]
  }

  const getDifficultyLabel = (index: number) => {
    const labels = ["Easy", "Medium", "Hard"]
    return labels[index % 3]
  }

  return (
    <div className="lg:min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 lg:overflow-y-hidden overflow-x-hidden">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Preparrr
            </h1>
            <div className="flex items-center ">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateQuestion(-1)}
                disabled={currentQuestionIndex === 0}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateQuestion(1)}
                disabled={currentQuestionIndex === questions.length - 1}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="gap-1">
                <Bookmark className="h-4 w-4" />
                <span className="hidden sm:inline">Bookmark</span>
              </Button>

              <Button variant="ghost" size="sm" className="gap-1 hidden md:flex">
                <Lightbulb className="h-4 w-4" />
                <span className="hidden sm:inline">Hint</span>
              </Button>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Clock className="h-4 w-4" />
              <span>{formatTime(timer)}</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 pt-6 lg:fixed left-1/2 transform lg:-translate-x-1/2  ">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
          {/* Question Panel */}
          <div className="flex flex-col gap-4 ">
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-300 p-0">
              <div className=" overflow-y-auto overflow-x-hidden max-h-[80vh] py-6 space-y-5">

                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl font-bold">{question.title}</CardTitle>
                    <Badge
                      className={`bg-${getDifficultyColor(currentQuestionIndex)}-100 text-${getDifficultyColor(currentQuestionIndex)}-800 hover:bg-${getDifficultyColor(currentQuestionIndex)}-100`}
                      variant="outline"
                    >
                      {getDifficultyLabel(currentQuestionIndex)}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <BarChart className="h-3.5 w-3.5" />
                    Acceptance Rate: 67.8%
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{question.description}</p>
                  </div>

                  <Tabs defaultValue="example" className="mt-6">
                    <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-slate-800">
                      <TabsTrigger value="example">Example</TabsTrigger>
                      <TabsTrigger value="constraints">Constraints</TabsTrigger>
                      <TabsTrigger value="approach">Approach</TabsTrigger>
                    </TabsList>
                    <TabsContent
                      value="example"
                      className="p-4 bg-slate-50 dark:bg-slate-900 rounded-md font-mono text-sm whitespace-pre-wrap border border-slate-200 dark:border-slate-800"
                    >
                      {question.example}
                    </TabsContent>
                    <TabsContent
                      value="constraints"
                      className="p-4 bg-slate-50 dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800"
                    >
                      <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700 dark:text-slate-300">
                        <li>Time complexity should be O(n)</li>
                        <li>Space complexity should be O(1)</li>
                        <li>Input will never be empty</li>
                        <li>Maximum input size is 10^5</li>
                      </ul>
                    </TabsContent>
                    <TabsContent
                      value="approach"
                      className="p-4 bg-slate-50 dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800"
                    >
                      <div className="text-sm text-slate-700 dark:text-slate-300 space-y-2">
                        <p>Consider these approaches:</p>
                        <ol className="list-decimal pl-5 space-y-1">
                          <li>Iterative approach with a loop</li>
                          <li>Recursive approach</li>
                          <li>Using built-in methods (if available)</li>
                        </ol>
                        <p className="mt-2 text-slate-500 dark:text-slate-400 text-xs italic">
                          Think about edge cases and optimizations!
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </div>

              {/* <CardFooter className="flex-wrap gap-2 pt-2">
                {questions.map((_, index) => (
                  <Button
                    key={index}
                    variant={index === currentQuestionIndex ? "default" : "outline"}
                    size="sm"
                    className={index === currentQuestionIndex ? "bg-indigo-600 hover:bg-indigo-700" : ""}
                    onClick={() => handleQuestionChange(index)}
                  >
                    {index + 1}
                  </Button>
                ))}
              </CardFooter> */}
            </Card>

            {/* Results Panel */}

          </div>

          {/* Code Editor Panel */}
          <div className="flex flex-col gap-4 max-h-[80vh] h-full">
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden p-0 gap-0 h-fit">
              <CardHeader className="pb-[8px!important] pt-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2 text-slate-800 dark:text-slate-200">
                    <FileCode className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    Code Editor
                  </CardTitle>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Button
                      className="w-full h-full flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                      onClick={executeCode}
                      disabled={isSubmitting}
                    >
                      <Terminal className="h-4 w-4" />
                      {isSubmitting ? "Running Tests..." : "Submit Solution"}
                    </Button>
                  </div>
                </div>
                {/* <CardDescription className="text-slate-500 dark:text-slate-400">
                  Write your solution and submit to test
                </CardDescription> */}
              </CardHeader>

              <CardContent className={`p-0 result ? "min-h-[30vh]" : "min-h-[60vh]" relative h-full`}>
                {isSubmitting && (
                  <div className="absolute top-0 left-0 right-0 z-10">
                    <Progress
                      value={progress}
                      className="h-1 rounded-none bg-slate-200 dark:bg-slate-700 *:bg-indigo-600 *:dark:bg-indigo-400"
                    />
                  </div>
                )}
                <Editor
                  height={result ? "100%" : "70vh"}
                  language="javascript"
                  value={code}
                  onChange={(value) => setCode(value || "")}
                  theme={theme === "dark" ? "vs-dark" : "light"}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                    wordWrap: "on",
                    tabSize: 2,
                    automaticLayout: true,
                    padding: { top: 16, bottom: 16 },
                    lineNumbers: "on",
                    glyphMargin: false,
                    folding: true,
                    lineDecorationsWidth: 10,
                    renderLineHighlight: "all",
                  }}
                />
              </CardContent>

              {/* <div className=" bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 h-fit">
                <Button
                  className="w-full h-full flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={executeCode}
                  disabled={isSubmitting}
                >
                  <Terminal className="h-4 w-4" />
                  {isSubmitting ? "Running Tests..." : "Submit Solution"}
                </Button>
              </div> */}
            </Card>
            {result && (
              <Alert
                variant={result.success ? "default" : "destructive"}
                className={`border h-max ${result.success ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/50" : "border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/50"}`}
              >
                <div className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-rose-500" />
                  )}
                  <AlertTitle
                    className={
                      result.success ? "text-emerald-800 dark:text-emerald-300" : "text-rose-800 dark:text-rose-300"
                    }
                  >
                    {result.success ? "Success!" : "Failed"}
                  </AlertTitle>
                </div>
                <AlertDescription
                  className={`mt-2 ${result.success ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"}`}
                >
                  {result.message}
                </AlertDescription>

                {result.success && result.stats && (
                  <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-800 flex  gap-2 text-sm ">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                      <Clock className="h-4 w-4" />
                      <span>Runtime: {result.stats.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                      <Cpu className="h-4 w-4" />
                      <span>Memory: {result.stats.memory}</span>
                    </div>
                  </div>
                )}
              </Alert>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
