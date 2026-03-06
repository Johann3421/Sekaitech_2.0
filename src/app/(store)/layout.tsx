import { SmartNavbar } from "@/components/store/SmartNavbar"
import { Footer } from "@/components/store/Footer"

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SmartNavbar />
      <main className="min-h-screen pt-24 bg-void-950">{children}</main>
      <Footer />
    </>
  )
}
