import { RequireTier } from "@/components/auth/RequireTier";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RequireTier tier="premium">{children}</RequireTier>;
}
