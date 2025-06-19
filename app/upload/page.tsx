import FileUpload from "../../components/FileUpload"

export default function UploadPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">File Upload</h1>
        <p className="text-muted-foreground">Upload files to Vercel Blob storage</p>
      </div>
      <FileUpload />
    </div>
  )
}
