import { LeftPanel } from "../../components/LeftPanel";

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#f7f8fc]">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        {<LeftPanel />}
        {children}
      </div>
    </main>
  );
}
