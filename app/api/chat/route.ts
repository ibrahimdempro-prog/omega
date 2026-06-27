interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface AnthropicResponse {
  content?: Array<{ type: string; text: string }>;
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "ANTHROPIC_API_KEY manquante" },
        { status: 500 },
      );
    }

    const body = (await request.json()) as { messages?: ChatMessage[] };
    const messages = body.messages;

    if (!Array.isArray(messages)) {
      return Response.json(
        { error: "Format de requête invalide" },
        { status: 500 },
      );
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system:
          "Tu es OMEGA, l'orchestrateur stratégique de DN8. Tu réponds de façon directe, sans blabla, orientée action et rentabilité. Tu n'as pas encore accès à la base de données ni aux outils — réponds uniquement à partir du contexte de la conversation.",
        messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return Response.json(
        { error: `Erreur API Anthropic: ${errorText}` },
        { status: 500 },
      );
    }

    const data = (await response.json()) as AnthropicResponse;
    const reply = data.content?.[0]?.text;

    if (!reply) {
      return Response.json(
        { error: "Réponse API invalide" },
        { status: 500 },
      );
    }

    return Response.json({ reply });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur interne du serveur";
    return Response.json({ error: message }, { status: 500 });
  }
}
