import { Component, ErrorInfo, ReactNode } from "react"
import { AlertOctagon, RotateCcw, Home } from "lucide-react"
import { Button } from "./Button"
import { Card } from "./Card"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })
    console.error("Uncaught runtime error caught by SolarWise ErrorBoundary:", error, errorInfo)
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.reload()
  }

  private handleTryAgain = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 text-center shadow-xl border-slate-200">
            <div className="inline-flex p-3 rounded-2xl bg-rose-100 text-rose-700 mb-4">
              <AlertOctagon className="h-8 w-8" />
            </div>

            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              SolarWise encountered an unexpected error while processing calculations or rendering the interface.
            </p>

            {this.state.error && (
              <div className="text-left bg-slate-100 p-3 rounded-lg border border-slate-200 text-[11px] font-mono text-slate-700 mb-6 overflow-x-auto max-h-32">
                <div className="font-bold text-rose-700 mb-1">{this.state.error.name}:</div>
                <div>{this.state.error.message}</div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={this.handleTryAgain}
                className="gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Try Again
              </Button>
              <Button
                size="sm"
                onClick={this.handleReset}
                className="gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white"
              >
                <Home className="h-3.5 w-3.5" /> Reload Application
              </Button>
            </div>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
