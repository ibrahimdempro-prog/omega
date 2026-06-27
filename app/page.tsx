import AuthGuard from "@/components/AuthGuard";
import ConversationHub from "@/components/ConversationHub";
import ModulesPanel from "@/components/ModulesPanel";
import StatusBar from "@/components/StatusBar";

export default function Home() {
  return (
    <AuthGuard>
      <StatusBar />
      <div
        className="grid w-full"
        style={{
          gridTemplateColumns: "1.3fr 1fr",
          gap: "12px",
        }}
      >
        <ConversationHub />
        <ModulesPanel />
      </div>
    </AuthGuard>
  );
}
