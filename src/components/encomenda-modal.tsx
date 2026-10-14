import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { buildComandaMessage, formatBRL } from "@/lib/comanda";
import type { Product, ProductVariation } from "@/lib/catalog.types";
import "@/styles/estrela-encomenda.css";

type Modalidade = "" | "entrega" | "retirada";

type Erros = {
  nome?: string;
  data?: string;
  modalidade?: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
};

type EncomendaModalProps = {
  product: Product;
  variation: ProductVariation | null;
  quantity: number;
  whatsappNumber: string;
  onClose: () => void;
};

const NOTA_PADRAO = "Olá! Gostaria de saber se conseguem preparar meu pedido para essa data. 🥰";

function todayLocalISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDateBR(iso: string): string {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export function EncomendaModal({
  product,
  variation,
  quantity,
  whatsappNumber,
  onClose,
}: EncomendaModalProps) {
  const [nome, setNome] = useState("");
  const [data, setData] = useState("");
  const [pagamento, setPagamento] = useState("Dinheiro");
  const [modalidade, setModalidade] = useState<Modalidade>("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [cep, setCep] = useState("");
  const [referencia, setReferencia] = useState("");
  const [nota, setNota] = useState(NOTA_PADRAO);
  const [erros, setErros] = useState<Erros>({});
  const [formError, setFormError] = useState("");

  const hoje = todayLocalISO();
  const unitPrice = variation?.price ?? product.price;
  const optionLabel = variation?.name ?? "Padrão";

  useEffect(() => {
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = anterior;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  function montarEndereco(): string {
    return [
      `${rua.trim()}, ${numero.trim()}`,
      complemento.trim(),
      bairro.trim(),
      cidade.trim(),
      cep.trim() ? `CEP ${cep.trim()}` : "",
      referencia.trim() ? `Referência: ${referencia.trim()}` : "",
    ]
      .filter(Boolean)
      .join(" - ");
  }

  function validar(): Erros {
    const lista: Erros = {};
    if (nome.trim().length < 2) lista.nome = "Informe seu nome.";
    if (!data) lista.data = "Escolha a data desejada.";
    else if (data < hoje) lista.data = "A data não pode ser no passado.";
    if (!modalidade) lista.modalidade = "Escolha entrega ou retirada.";
    if (modalidade === "entrega") {
      if (!rua.trim()) lista.rua = "Informe a rua.";
      if (!numero.trim()) lista.numero = "Informe o número.";
      if (!bairro.trim()) lista.bairro = "Informe o bairro.";
      if (!cidade.trim()) lista.cidade = "Informe a cidade.";
    }
    return lista;
  }

  function prepararLink(): string | null {
    const lista = validar();
    setErros(lista);
    if (Object.keys(lista).length > 0) return null;

    const numero = whatsappNumber.replace(/\D/g, "");
    if (!numero) {
      setFormError("Ainda não temos o número do WhatsApp da loja configurado.");
      return null;
    }

    const productUrl =
      typeof window !== "undefined" ? `${window.location.origin}/produto/${product.slug}` : null;

    const mensagem = buildComandaMessage({
      customerName: nome.trim(),
      desiredDate: formatDateBR(data),
      modality: modalidade === "retirada" ? "retirada" : "entrega",
      address: modalidade === "entrega" ? montarEndereco() : null,
      productName: product.name,
      optionLabel,
      quantity,
      unitPrice,
      total: unitPrice != null ? unitPrice * quantity : null,
      payment: pagamento,
      note: nota.trim(),
      productUrl,
    });

    return `https://api.whatsapp.com/send?phone=${numero}&text=${encodeURIComponent(mensagem)}`;
  }

  function enviar(event: React.FormEvent) {
    event.preventDefault();
    const link = prepararLink();
    if (!link) return;
    setFormError("");
    const janela = window.open(link, "_blank");
    if (janela) {
      try {
        janela.opener = null;
      } catch {
        /* ignora */
      }
    }
    if (!janela) {
      window.location.href = link;
    }
    onClose();
  }

  return (
    <div className="eg-encomenda" role="dialog" aria-modal="true" aria-label="Pedido de encomenda">
      <div className="eg-card">
        <header className="eg-head">
          <div>
            <h2>Fazer pedido</h2>
            <p>{product.name}</p>
          </div>
          <button className="eg-close" type="button" aria-label="Fechar" onClick={onClose}>
            <X size={18} />
          </button>
        </header>

        <form onSubmit={enviar}>
          <div className="eg-body">
            <div className="eg-resumo">
              <span>
                Produto: <strong>{product.name}</strong>
              </span>
              <span>
                Opção: <strong>{optionLabel}</strong>
              </span>
              <span>
                Quantidade: <strong>{quantity}</strong>
              </span>
              <span>
                Valor unitário: <strong>{formatBRL(unitPrice)}</strong>
              </span>
            </div>

            <label className="eg-field">
              <span>Seu nome *</span>
              <input
                type="text"
                value={nome}
                autoComplete="name"
                placeholder="Como podemos te chamar?"
                onChange={(event) => setNome(event.target.value)}
              />
              {erros.nome && <p className="eg-err">{erros.nome}</p>}
            </label>

            <label className="eg-field">
              <span>Data que preciso</span>
              <input
                type="date"
                min={hoje}
                value={data}
                onChange={(event) => setData(event.target.value)}
              />
              {erros.data && <p className="eg-err">{erros.data}</p>}
            </label>

            <label className="eg-field">
              <span>💳 Forma de pagamento</span>
              <select value={pagamento} onChange={(event) => setPagamento(event.target.value)}>
                <option value="Dinheiro">Dinheiro</option>
                <option value="Pix">Pix</option>
                <option value="Cartão de crédito">Cartão de crédito</option>
              </select>
            </label>

            <div className="eg-field">
              <span>Forma de entrega</span>
              <div className="eg-mod">
                <button
                  type="button"
                  className={modalidade === "entrega" ? "active" : ""}
                  onClick={() => setModalidade("entrega")}
                >
                  Entrega
                </button>
                <button
                  type="button"
                  className={modalidade === "retirada" ? "active" : ""}
                  onClick={() => setModalidade("retirada")}
                >
                  Retirada
                </button>
              </div>
              {erros.modalidade && <p className="eg-err">{erros.modalidade}</p>}
            </div>

            {modalidade === "entrega" && (
              <>
                <div className="eg-row2">
                  <label className="eg-field">
                    <span>Rua / Avenida</span>
                    <input value={rua} onChange={(e) => setRua(e.target.value)} />
                    {erros.rua && <p className="eg-err">{erros.rua}</p>}
                  </label>
                  <label className="eg-field">
                    <span>Número</span>
                    <input value={numero} onChange={(e) => setNumero(e.target.value)} />
                    {erros.numero && <p className="eg-err">{erros.numero}</p>}
                  </label>
                </div>

                <div className="eg-row2">
                  <label className="eg-field">
                    <span>Complemento</span>
                    <input value={complemento} onChange={(e) => setComplemento(e.target.value)} />
                  </label>
                  <label className="eg-field">
                    <span>CEP</span>
                    <input value={cep} onChange={(e) => setCep(e.target.value)} />
                  </label>
                </div>

                <div className="eg-row2">
                  <label className="eg-field">
                    <span>Bairro</span>
                    <input value={bairro} onChange={(e) => setBairro(e.target.value)} />
                    {erros.bairro && <p className="eg-err">{erros.bairro}</p>}
                  </label>
                  <label className="eg-field">
                    <span>Cidade</span>
                    <input value={cidade} onChange={(e) => setCidade(e.target.value)} />
                    {erros.cidade && <p className="eg-err">{erros.cidade}</p>}
                  </label>
                </div>

                <label className="eg-field">
                  <span>Ponto de referência</span>
                  <input value={referencia} onChange={(e) => setReferencia(e.target.value)} />
                </label>

                <div className="eg-note eg-note-warn">
                  A entrega neste endereço precisa ser confirmada pela loja.
                </div>
              </>
            )}

            <label className="eg-field">
              <span>Mensagem</span>
              <textarea rows={3} value={nota} onChange={(event) => setNota(event.target.value)} />
            </label>

            <div className="eg-note">
              Ao enviar, abriremos o WhatsApp da loja com o resumo do seu pedido e o link do produto
              (com a foto) já prontos. É só tocar em enviar lá no WhatsApp. 💖
            </div>

            {formError && <div className="eg-note eg-note-warn">{formError}</div>}
          </div>

          <div className="eg-actions">
            <button className="eg-btn eg-btn-green" type="submit">
              <MessageCircle size={18} /> Enviar pedido no WhatsApp
            </button>
            <button className="eg-btn eg-btn-ghost" type="button" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
