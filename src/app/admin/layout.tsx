import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { AdminSidebar } from "@/components/admin/AdminSidebar"

export const metadata = {
  title: "Admin — SekaiTech",
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    redirect("/auth/login")
  }

  return (
    <div className="flex min-h-screen bg-void-950">
      <AdminSidebar
        userName={session.user.name ?? "Admin"}
        userEmail={session.user.email ?? ""}
      />
      <main className="flex-1 ml-[260px] p-6 min-h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
