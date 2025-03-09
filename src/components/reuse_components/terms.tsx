"use client"

import * as React from "react"
import Image from "next/image"
import { X, Eye } from "phosphor-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

type VisuallyHiddenProps = React.HTMLAttributes<HTMLSpanElement>

const VisuallyHidden = React.forwardRef<HTMLSpanElement, VisuallyHiddenProps>(
  ({ children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        {...props}
        style={{
          position: 'absolute',
          border: 0,
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          wordWrap: 'normal',
        }}
      >
        {children}
      </span>
    )
  }
)

VisuallyHidden.displayName = "VisuallyHidden"

interface Template {
  id: string
  name: string
  preview: string
  thumbnail: string
}

const templates: Template[] = [
  {
    id: "1",
    name: "Terms & Condition template 1",
    preview: "/placeholder.svg?height=800&width=600",
    thumbnail: "/placeholder.svg?height=100&width=80"
  },
  {
    id: "2",
    name: "Terms & Condition template 2",
    preview: "/placeholder.svg?height=800&width=600",
    thumbnail: "/placeholder.svg?height=100&width=80"
  },
  {
    id: "3",
    name: "Terms & Condition template 3",
    preview: "/placeholder.svg?height=800&width=600",
    thumbnail: "/placeholder.svg?height=100&width=80"
  }
]

interface TermsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (templateId: string) => void
}

export function TermsModal({ open, onOpenChange, onSelect }: TermsModalProps) {
  const [selectedTemplate, setSelectedTemplate] = React.useState<string>("1")
  const [previewTemplate, setPreviewTemplate] = React.useState<Template | null>(null)

  const handlePreview = (template: Template) => {
    setPreviewTemplate(template)
  }

  const closePreview = () => {
    setPreviewTemplate(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-[20px] font-semibold">
            {previewTemplate ? "Preview" : "Terms & Condition"}
          </DialogTitle>
        </DialogHeader>
        {previewTemplate ? (
          <div className="w-full h-full min-h-[500px] bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{previewTemplate.name}</h3>
              <Button variant="ghost" size="icon" onClick={closePreview}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative w-full h-[calc(100vh-200px)]">
              <Image
                src={previewTemplate.preview}
                alt="PDF Preview"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        ) : (
          <>
            <div className="py-4">
              <RadioGroup
                value={selectedTemplate}
                onValueChange={setSelectedTemplate}
                className="space-y-3"
              >
                {templates.map((template) => (
                  <Card
                    key={template.id}
                    className={`p-4 cursor-pointer transition-colors bg-[#F4F5F6] hover:bg-[#F4F5F6]/80`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="relative w-[60px] h-[80px] flex-shrink-0">
                        <Image
                          src={template.thumbnail}
                          alt={template.name}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <div className="flex-1 px-4">
                        <p className="text-base font-normal mb-1">{template.name}</p>
                        <Button
                          variant="link"
                          className="p-0 h-auto text-[#0B4776] text-[16px] font-normal flex items-center"
                          onClick={() => handlePreview(template)}
                        >
                          <Eye className="w-4 h-4 " />
                          <span className="mb-[1px]">Preview</span>
                        </Button>
                      </div>
                      <RadioGroupItem
                        value={template.id}
                        id={template.id}
                        className="data-[state=checked]:border-[#3B86F2] data-[state=checked]:text-[#18181B]"
                      />
                    </div>
                  </Card>
                ))}
              </RadioGroup>
            </div>
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-[#0B4776] text-[#0B4776]"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  onSelect(selectedTemplate)
                  onOpenChange(false)
                }}
                className="bg-[#0B4776] hover:bg-[#0B4776]/90 text-white"
              >
                Done
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

