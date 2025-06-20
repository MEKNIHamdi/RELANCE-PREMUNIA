"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Import seulement les icônes nécessaires pour réduire le bundle
import { Upload, FileText, ImageIcon, Video, Music } from "lucide-react"

interface UploadedFile {
  url: string
  pathname: string
  size: number
  uploadedAt: Date
}

export default function FileUpload() {
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const result = await response.json()
      setUploadedFiles((prev) => [
        ...prev,
        {
          url: result.url,
          pathname: result.pathname,
          size: file.size,
          uploadedAt: new Date(),
        },
      ])
    } catch (error) {
      console.error("Upload error:", error)
    } finally {
      setUploading(false)
    }
  }

  const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase()
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "")) return <ImageIcon className="size-4" />
    if (["mp4", "avi", "mov", "webm"].includes(ext || "")) return <Video className="size-4" />
    if (["mp3", "wav", "ogg"].includes(ext || "")) return <Music className="size-4" />
    return <FileText className="size-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="size-5" />
            File Upload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
            <Upload className="size-12 mx-auto mb-4 text-muted-foreground" />
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Choose a file to upload to Vercel Blob</p>
              <input type="file" onChange={handleFileUpload} disabled={uploading} className="hidden" id="file-upload" />
              <Button asChild disabled={uploading} className="cursor-pointer">
                <label htmlFor="file-upload">{uploading ? "Uploading..." : "Select File"}</label>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getFileIcon(file.pathname)}
                    <div>
                      <p className="font-medium text-sm">{file.pathname}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)} • {file.uploadedAt.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => window.open(file.url, "_blank")}>
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
