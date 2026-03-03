import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users, Webhook, LayoutDashboard, ArrowLeft } from "lucide-react";

const ADMIN_EMAIL = "henriquer01@rojasdev.cloud";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.email !== ADMIN_EMAIL && session.user.role !== "ADMIN") {
    redirect("/chat");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-muted/30">
        <div className="p-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5" />
            Admin Panel
          </h2>
        </div>
        <nav className="px-4 space-y-1">
          <Link href="/admin">
            <Button variant="ghost" className="w-full justify-start">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/admin/users">
            <Button variant="ghost" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              Usuários
            </Button>
          </Link>
          <Link href="/admin/webhooks">
            <Button variant="ghost" className="w-full justify-start">
              <Webhook className="mr-2 h-4 w-4" />
              Webhooks
            </Button>
          </Link>
          <div className="pt-4">
            <Link href="/chat">
              <Button variant="outline" className="w-full justify-start">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Chat
              </Button>
            </Link>
          </div>
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
