"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Mic } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ConversationHubProps {
  title?: string;
}

export default function ConversationHub({
  title = "HUB CONVERSATIONNEL",
}: ConversationHubProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed) return;

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
      },
    ]);
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <section
      className="w-full font-mono text-sm"
      style={{ backgroundColor: "#13151A", color: "#E8E6E1" }}
    >
      <div className="flex flex-col gap-3 px-4 py-3">
        <p className="text-xs tracking-wider text-[#6B7280]">{title}</p>

        <div
          className="flex flex-col gap-2 overflow-y-auto"
          style={{ maxHeight: "320px" }}
        >
          {messages.length === 0 ? (
            <p className="py-8 text-center text-[#6B7280]">
              Aucun message pour l&apos;instant.
            </p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className="flex"
                style={{
                  justifyContent:
                    message.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "85%",
                    padding: "8px 10px",
                    borderRadius: "6px",
                    backgroundColor:
                      message.role === "user" ? "#2A2114" : "#1C1E22",
                    color: message.role === "user" ? "#FAC775" : "#D9D7D2",
                  }}
                >
                  {message.content}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div
          className="flex items-center gap-2 border-t pt-3"
          style={{ borderColor: "#22252A" }}
        >
          <Mic
            className="shrink-0"
            size={18}
            style={{ color: "#6B7280" }}
            aria-hidden
          />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-w-0 flex-1 bg-transparent font-mono text-sm outline-none"
            style={{ color: "#E8E6E1" }}
          />
          <button
            type="button"
            onClick={sendMessage}
            className="flex shrink-0 cursor-pointer items-center justify-center rounded-sm border-0 bg-transparent p-1"
            aria-label="Envoyer"
          >
            <ArrowUp size={18} style={{ color: "#FAC775" }} />
          </button>
        </div>
      </div>
    </section>
  );
}
