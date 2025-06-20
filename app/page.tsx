import Pipeline from "../components/Pipeline"

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">GitHub Link Project</h1>
        <p className="text-muted-foreground">Optimized for fast builds</p>
      </div>

      <Pipeline
        steps={[
          { id: "1", label: "Install", status: "success" },
          { id: "2", label: "Build", status: "success" },
          { id: "3", label: "Deploy", status: "success" },
        ]}
      />
    </main>
  )
}
