import Pipeline from "../components/Pipeline"

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Pipeline
        steps={[
          { id: "1", label: "Install", status: "success" },
          { id: "2", label: "Build", status: "running" },
          { id: "3", label: "Deploy", status: "pending" },
        ]}
      />
    </main>
  )
}
