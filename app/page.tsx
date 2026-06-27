import AuthGuard from "@/components/AuthGuard";
import ConversationHub from "@/components/ConversationHub";
import StatusBar from "@/components/StatusBar";

export default function Home() {
  return (
    <AuthGuard>
      <StatusBar />
      <ConversationHub />
    </AuthGuard>
  );
}
