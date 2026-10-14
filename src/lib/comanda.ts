export type ComandaData = {
  customerName: string;
  desiredDate: string;
  modality: "entrega" | "retirada";
  address: string | null;
  productName: string;
  optionLabel: string;
  quantity: number;
  unitPrice: number | null;
  total: number | null;
  payment: string;
  note: string;
  productUrl?: string | null;
};

export function formatBRL(value: number | null): string {
  return value == null
    ? "Sob consulta"
    : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function buildComandaMessage(data: ComandaData): string {
  const lines: string[] = [
    "🍫 *COMANDA — ESTRELA GOURMET* 💖",
    "",
    `👤 Nome: ${data.customerName}`,
    `📅 Data desejada: ${data.desiredDate}`,
    `🚚 ${data.modality === "entrega" ? "Entrega" : "Retirada"}`,
  ];
  if (data.modality === "entrega" && data.address) {
    lines.push(`📍 Endereço: ${data.address}`);
    lines.push("❓ Vocês conseguem entregar nesse endereço?");
  }
  lines.push(
    `📦 Produto: ${data.productName}`,
    `🧁 Opção: ${data.optionLabel}`,
    `🔢 Quantidade: ${data.quantity}`,
    `💳 Forma de pagamento: ${data.payment}`,
    `💰 Valor unitário: ${formatBRL(data.unitPrice)}`,
    `💵 Total: ${formatBRL(data.total)}`,
  );
  if (data.productUrl) {
    lines.push(`🔗 Veja a foto do produto: ${data.productUrl}`);
  }
  lines.push("", data.note, "", "Pedido realizado pelo site Estrela Gourmet ✨");
  return lines.join("\n");
}
