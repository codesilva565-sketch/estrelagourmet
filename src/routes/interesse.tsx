import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, MessageCircle, ShoppingBag, Trash2 } from "lucide-react";
import { useInterest } from "@/lib/interest-context";
import { getCatalog } from "@/lib/catalog.functions";

export const Route = createFileRoute("/interesse")({
  loader: () => getCatalog(),
  head: () => ({
    meta: [
      { title: "Lista de interesse — Estrela Gourmet" },
      { name: "description", content: "Organize seus doces e envie uma consulta de encomenda." },
    ],
  }),
  component: InterestPage,
});

function InterestPage() {
  const { settings } = Route.useLoaderData();
  const { items, removeItem, clear } = useInterest();
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  function send() {
    if (!name.trim() || items.length === 0) {
      setError("Informe seu nome e adicione pelo menos um produto.");
      return;
    }
    if (!settings.whatsapp_number) {
      setError("O WhatsApp da confeitaria ainda não foi configurado.");
      return;
    }
    const products = items
      .map(
        (item, index) =>
          `${index + 1}. ${item.productName} — ${item.quantity} unidade(s)${item.variationName ? ` — ${item.variationName}` : ""}${item.desiredDate ? ` — data: ${item.desiredDate}` : ""}${item.notes ? ` — obs: ${item.notes}` : ""}`,
      )
      .join("\n");
    const message = `Olá! Tudo bem? 💗\n\nVi o catálogo da Estrela Gourmet e gostaria de consultar uma encomenda.\n\nNome: ${name.trim()}\n\nProdutos:\n${products}\n\nData desejada: ${date || "A combinar"}\n\nObservações: ${notes.trim() || "Nenhuma"}\n\nVocês conseguem preparar para essa data? Poderiam confirmar a disponibilidade e o valor?`;
    window.open(
      `https://api.whatsapp.com/send?phone=${settings.whatsapp_number}&text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <div className="eg-site">
      <div className="eg-page">
        <header className="eg-header eg-header-detail">
          <div className="eg-brand">
            <span className="eg-brand-name">Estrela Gourmet</span>
          </div>
          <div className="eg-header-actions">
            <Link to="/" className="eg-icon-button" aria-label="Voltar ao catálogo">
              <ArrowLeft size={21} />
            </Link>
          </div>
        </header>
        <main className="eg-detail">
          <div style={{ maxWidth: 540, margin: "0 auto" }}>
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(24px,4vw,36px)",
                color: "#794a40",
                marginBottom: 4,
              }}
            >
              Sua lista de interesse
            </h1>
            <p style={{ fontSize: 12, color: "#98776c", marginBottom: 24 }}>
              Esta lista gera apenas uma consulta. A encomenda será confirmada pela confeiteira no
              WhatsApp.
            </p>

            {items.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 0" }}>
                <ShoppingBag size={40} color="#c87779" style={{ margin: "0 auto", opacity: 0.4 }} />
                <p
                  style={{
                    marginTop: 12,
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 22,
                    color: "#794a40",
                  }}
                >
                  Sua lista está vazia
                </p>
                <Link
                  to="/"
                  style={{
                    display: "inline-block",
                    marginTop: 16,
                    padding: "10px 24px",
                    borderRadius: 99,
                    background: "#c87779",
                    color: "white",
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 600,
                    fontSize: 16,
                    textDecoration: "none",
                  }}
                >
                  Ver cardápio
                </Link>
              </div>
            ) : (
              <>
                <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
                  {items.map((item) => (
                    <article
                      key={item.key}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "56px 1fr auto",
                        alignItems: "center",
                        gap: 10,
                        borderRadius: 10,
                        border: "1px solid #e7ceca",
                        padding: 10,
                        background: "#fff",
                      }}
                    >
                      <div
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 8,
                          overflow: "hidden",
                          background: "#f5e8e7",
                        }}
                      >
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt=""
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        )}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <h2
                          style={{
                            margin: 0,
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: 17,
                            fontWeight: 600,
                            color: "#4e352c",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.productName}
                        </h2>
                        <p style={{ margin: 0, fontSize: 11, color: "#98776c" }}>
                          {item.quantity} unidade(s)
                          {item.variationName ? ` — ${item.variationName}` : ""}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.key)}
                        aria-label={`Remover ${item.productName}`}
                        style={{
                          border: 0,
                          background: "transparent",
                          color: "#c87779",
                          cursor: "pointer",
                          padding: 6,
                        }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </article>
                  ))}
                </div>

                <div
                  style={{
                    borderTop: "1px solid #e7ceca",
                    paddingTop: 20,
                    display: "grid",
                    gap: 14,
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#4e352c",
                        marginBottom: 4,
                      }}
                    >
                      Seu nome *
                    </label>
                    <input
                      value={name}
                      maxLength={100}
                      onChange={(e) => setName(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid #e7ceca",
                        borderRadius: 8,
                        fontFamily: "inherit",
                        fontSize: 14,
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#4e352c",
                        marginBottom: 4,
                      }}
                    >
                      Data desejada
                    </label>
                    <input
                      type="date"
                      value={date}
                      min={new Date().toISOString().slice(0, 10)}
                      onChange={(e) => setDate(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid #e7ceca",
                        borderRadius: 8,
                        fontFamily: "inherit",
                        fontSize: 14,
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#4e352c",
                        marginBottom: 4,
                      }}
                    >
                      Observações gerais
                    </label>
                    <textarea
                      value={notes}
                      maxLength={1000}
                      rows={3}
                      onChange={(e) => setNotes(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid #e7ceca",
                        borderRadius: 8,
                        fontFamily: "inherit",
                        fontSize: 14,
                        resize: "vertical",
                      }}
                    />
                  </div>
                  {error && <p style={{ fontSize: 13, color: "#c44" }}>{error}</p>}
                  <button className="eg-send" onClick={send}>
                    <MessageCircle size={20} /> Enviar consulta pelo WhatsApp
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm("Limpar toda a lista?")) clear();
                    }}
                    style={{
                      border: 0,
                      background: "transparent",
                      color: "#98776c",
                      fontSize: 12,
                      cursor: "pointer",
                      textAlign: "center",
                      padding: 8,
                    }}
                  >
                    Limpar lista
                  </button>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
