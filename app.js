/* =========================================================
   ERVAS MEDICINAIS CAP — app.js
   =========================================================

   ╔═══════════════════════════════════════════════════════╗
   ║  CONFIGURAÇÃO — edite só esta parte                    ║
   ╚═══════════════════════════════════════════════════════╝ */

// Chave Pix que vai receber os pagamentos. Pode ser:
//   e-mail ........ "loja@exemplo.com"
//   celular ....... "+5511999999999"   (com +55 e DDD, só números)
//   CPF/CNPJ ...... "12345678900"      (só números)
//   aleatória ..... "123e4567-e12b-12d1-a456-426655440000"
const CHAVE_PIX = "SEU-EMAIL-AQUI@exemplo.com";

// Nome de quem recebe o Pix (aparece no app do banco do cliente).
// Sem acentos, até 25 letras. Use o mesmo nome da conta.
const NOME_RECEBEDOR = "ERVAS MEDICINAIS CAP";

// Cidade de quem recebe o Pix. Sem acentos, até 15 letras.
const CIDADE = "SAO PAULO";

// Link de pagamento com cartão (Mercado Pago, InfinitePay, PagSeguro...).
// Deixe "" (vazio) para esconder a opção de cartão.
const LINK_CARTAO = "https://link.mercadopago.com.br/SEU-LINK";

// Pedido mínimo para pagar com cartão, em reais.
const MINIMO_CARTAO = 100.0;

// Link de pagamento com criptomoeda (NOWPayments, Binance Pay...).
// Deixe "" (vazio) para esconder a opção de cripto.
const LINK_CRIPTO = "https://nowpayments.io/payment/?iid=SEU-ID";

// WhatsApp que recebe os pedidos: 55 + DDD + número, só números.
// Ex.: (11) 91234-5678  →  "5511912345678"
const WHATSAPP_VENDEDOR = "5511999999999";

// Taxa fixa de entrega, em reais (use ponto: 20.0 = R$ 20,00).
const TAXA_ENTREGA = 20.0;

// Valor mínimo e máximo do pedido (soma dos produtos, sem a entrega).
const PEDIDO_MINIMO = 100.0;
const PEDIDO_MAXIMO = 1000.0;

// Endereço para retirada no local (aparece para o cliente).
const ENDERECO_RETIRADA = "Rua Exemplo, 123 — Centro";

// Horário de funcionamento para retirada (formato 24h "HH:MM").
const HORA_ABERTURA = "09:00";
const HORA_FECHAMENTO = "18:00";

// Dias em que há retirada: 0 = domingo, 1 = segunda ... 6 = sábado.
const DIAS_FUNCIONAMENTO = [1, 2, 3, 4, 5, 6];

// Quantos minutos leva para o pedido ficar pronto.
const TEMPO_PREPARO_MINUTOS = 40;

// De quantos em quantos minutos aparecem os horários de retirada.
const INTERVALO_HORARIOS_MINUTOS = 15;

/* ╔═══════════════════════════════════════════════════════╗
   ║  FIM DA CONFIGURAÇÃO — daqui para baixo é o app        ║
   ╚═══════════════════════════════════════════════════════╝ */

const ROTAS = ["inicio", "carrinho", "entrega", "dados", "pagamento", "confirmacao"];
const MOEDA = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const reduzMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const estado = {
  carrinho: {},        // { idProduto: quantidade }
  modo: null,          // "retirada" | "entrega"
  horario: null,       // ISO da retirada
  endereco: "",
  localizacao: null,   // { lat, lng, precisao } — só em memória, nunca salvo
  nome: "",
  telefone: "",
  pagamento: null,     // "pix" | "cartao" | "cripto"
  numero: null,        // número do pedido
};

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
const brl = (v) => MOEDA.format(v);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ---------- Armazenamento local (só carrinho e dados do cliente) ---------- */
const CHAVE_LS = "ervas-cap-v1";
function salvar() {
  try {
    localStorage.setItem(CHAVE_LS, JSON.stringify({ carrinho: estado.carrinho, nome: estado.nome, telefone: estado.telefone }));
  } catch (e) { /* navegação privada: segue sem salvar */ }
}
function carregar() {
  try {
    const d = JSON.parse(localStorage.getItem(CHAVE_LS) || "{}");
    if (d.carrinho && typeof d.carrinho === "object") {
      for (const [id, q] of Object.entries(d.carrinho)) if (produto(id) && q > 0) estado.carrinho[id] = Math.min(99, q | 0);
    }
    estado.nome = d.nome || "";
    estado.telefone = d.telefone || "";
  } catch (e) { /* ignora */ }
}

/* ---------- Ilustrações SVG ---------- */
const ILUSTRACOES = {
  folha: `<svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="54" fill="#d6e8c4"/><path d="M28 90C27 52 52 28 94 25c2 40-24 66-66 65z" fill="#4a8a3f"/><path d="M28 90C46 72 64 54 88 31" stroke="#24431f" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M47 71l-3-15M58 60l-2-15M69 49l-1-13M47 71l15 3M58 60l15 3M69 49l13 2" stroke="#24431f" stroke-width="2.4" stroke-linecap="round"/><path d="M28 90l-7 8" stroke="#24431f" stroke-width="3.5" stroke-linecap="round"/></svg>`,
  ramo: `<svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="54" fill="#f0dccb"/><path d="M60 104c-3-26 1-56 0-84" stroke="#2f4a2a" stroke-width="3.5" fill="none" stroke-linecap="round"/><g fill="#4a8a3f"><ellipse cx="45" cy="80" rx="15" ry="6.5" transform="rotate(-28 45 80)"/><ellipse cx="75" cy="72" rx="15" ry="6.5" transform="rotate(28 75 72)"/><ellipse cx="46" cy="58" rx="13" ry="6" transform="rotate(-32 46 58)"/><ellipse cx="74" cy="50" rx="13" ry="6" transform="rotate(32 74 50)"/><ellipse cx="49" cy="38" rx="10" ry="5" transform="rotate(-36 49 38)"/></g><g fill="#6fa95e"><ellipse cx="71" cy="31" rx="9" ry="4.5" transform="rotate(36 71 31)"/><ellipse cx="60" cy="20" rx="4.5" ry="8"/></g><circle cx="82" cy="88" r="5" fill="#c8734a"/><circle cx="90" cy="80" r="3.5" fill="#c8734a"/></svg>`,
  xicara: `<svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="54" fill="#e6efda"/><path d="M44 40c-4-6 4-10 0-16M58 40c-4-6 4-10 0-16M72 40c-4-6 4-10 0-16" stroke="#7a8f6e" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="58" cy="94" rx="38" ry="7" fill="#d9c9a3"/><path d="M28 50h60v8c0 19-13 32-30 32S28 77 28 58z" fill="#c8734a"/><path d="M28 50h60v6H28z" fill="#a9502c"/><path d="M88 58c12-2 16 12 2 18" stroke="#a9502c" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M44 68c2-10 12-14 22-12-2 10-12 15-22 12z" fill="#e8f2dc"/><path d="M44 68c6-4 12-7 22-12" stroke="#4a8a3f" stroke-width="1.8" fill="none"/></svg>`,
};
const folhaSVG = (cor) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.5C4.5 7 4 16.5 12 22.5c8-6 7.5-15.5 0-21z" fill="${cor}"/><path d="M12 4v18" stroke="rgba(0,0,0,.25)" stroke-width="1.2"/></svg>`;

/* ---------- Cálculos ---------- */
const produto = (id) => PRODUTOS.find((p) => p.id === id);
const qtd = (id) => estado.carrinho[id] || 0;
const totalItens = () => Object.values(estado.carrinho).reduce((a, b) => a + b, 0);
const subtotal = () => Object.entries(estado.carrinho).reduce((s, [id, q]) => s + (produto(id)?.preco || 0) * q, 0);
const taxa = () => (estado.modo === "entrega" ? TAXA_ENTREGA : 0);
const total = () => Math.round((subtotal() + taxa()) * 100) / 100;
const faixaOk = () => subtotal() >= PEDIDO_MINIMO && subtotal() <= PEDIDO_MAXIMO;
const entregaOk = () =>
  (estado.modo === "retirada" && !!estado.horario) ||
  (estado.modo === "entrega" && (!!estado.localizacao || estado.endereco.trim().length >= 5));
const digitosTel = () => estado.telefone.replace(/\D/g, "");
const dadosOk = () => estado.nome.trim().length >= 2 && digitosTel().length >= 10 && digitosTel().length <= 11;
const cartaoDisponivel = () => !!LINK_CARTAO && total() >= MINIMO_CARTAO;
const pagamentoOk = () =>
  estado.pagamento === "pix" ||
  (estado.pagamento === "cartao" && cartaoDisponivel()) ||
  (estado.pagamento === "cripto" && !!LINK_CRIPTO);

function mensagemFaixa() {
  const s = subtotal();
  if (totalItens() === 0) return { ok: false, texto: `Adicione produtos. Pedido mínimo: ${brl(PEDIDO_MINIMO)}.` };
  if (s < PEDIDO_MINIMO) return { ok: false, texto: `Faltam ${brl(PEDIDO_MINIMO - s)} para o pedido mínimo de ${brl(PEDIDO_MINIMO)}.` };
  if (s > PEDIDO_MAXIMO) return { ok: false, texto: `Seu pedido passou do máximo de ${brl(PEDIDO_MAXIMO)}. Remova ${brl(s - PEDIDO_MAXIMO)} em produtos para continuar.` };
  return { ok: true, texto: "Tudo certo! Seu pedido está dentro do valor permitido." };
}

/* ---------- Pix (BR Code / EMV do Banco Central) ---------- */
function campoEMV(id, valor) {
  const v = String(valor);
  return id + String(v.length).padStart(2, "0") + v;
}
function limparTexto(s, max) {
  return String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9 ]/g, "").trim().toUpperCase().slice(0, max);
}
function crc16(str) {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) crc = (crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}
function gerarPix(valor, txid) {
  let chave = CHAVE_PIX.trim();
  if (chave.includes("@")) chave = chave.toLowerCase();
  const conta = campoEMV("00", "br.gov.bcb.pix") + campoEMV("01", chave);
  let p =
    campoEMV("00", "01") +
    campoEMV("26", conta) +
    campoEMV("52", "0000") +
    campoEMV("53", "986") +
    (valor > 0 ? campoEMV("54", valor.toFixed(2)) : "") +
    campoEMV("58", "BR") +
    campoEMV("59", limparTexto(NOME_RECEBEDOR, 25) || "RECEBEDOR") +
    campoEMV("60", limparTexto(CIDADE, 15) || "BRASIL") +
    campoEMV("62", campoEMV("05", (txid || "***").replace(/[^A-Za-z0-9]/g, "").slice(0, 25) || "***")) +
    "6304";
  return p + crc16(p);
}

/* ---------- Animações ---------- */
function animarValor(el, valor) {
  if (!el) return;
  const de = typeof el._valor === "number" ? el._valor : valor;
  el._valor = valor;
  cancelAnimationFrame(el._raf);
  if (reduzMovimento || de === valor) { el.textContent = brl(valor); return; }
  const ini = performance.now(), dur = 550;
  const passo = (t) => {
    const p = Math.min(1, (t - ini) / dur);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = brl(de + (valor - de) * e);
    if (p < 1) el._raf = requestAnimationFrame(passo);
  };
  el._raf = requestAnimationFrame(passo);
  el.classList.remove("piscar"); void el.offsetWidth; el.classList.add("piscar");
}
function pulsarCarrinho() {
  const b = $("#btn-carrinho");
  b.classList.remove("pulsar"); void b.offsetWidth; b.classList.add("pulsar");
}
let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("visivel");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("visivel"), 2400);
}
function criarFolhasFundo() {
  if (reduzMovimento) return;
  const box = $("#folhas-fundo");
  const cores = ["#4a8a3f", "#6fa95e", "#2f4a2a", "#c8734a", "#9cbf7a"];
  const n = window.innerWidth < 600 ? 12 : 20;
  for (let i = 0; i < n; i++) {
    const f = document.createElement("span");
    f.className = "folha-cai";
    const tam = 16 + Math.random() * 22;
    f.style.cssText = `left:${Math.random() * 100}%;width:${tam}px;height:${tam}px;--dur:${9 + Math.random() * 10}s;--delay:${-Math.random() * 18}s;--deriva:${(Math.random() * 160 - 80).toFixed(0)}px;--giro:${(Math.random() * 540 - 270).toFixed(0)}deg;opacity:${(0.35 + Math.random() * 0.35).toFixed(2)}`;
    f.innerHTML = folhaSVG(cores[i % cores.length]);
    box.appendChild(f);
  }
}
function confete() {
  if (reduzMovimento || !Element.prototype.animate) return;
  const box = $("#confete");
  const cores = ["#4a8a3f", "#6fa95e", "#2f4a2a", "#c8734a", "#9cbf7a", "#e0b04f"];
  const x0 = window.innerWidth / 2, y0 = window.innerHeight * 0.32;
  for (let i = 0; i < 46; i++) {
    const f = document.createElement("span");
    f.className = "folha-confete";
    const tam = 14 + Math.random() * 16;
    f.style.cssText = `left:${x0}px;top:${y0}px;width:${tam}px;height:${tam}px`;
    f.innerHTML = folhaSVG(cores[i % cores.length]);
    box.appendChild(f);
    const ang = Math.random() * Math.PI * 2, dist = 90 + Math.random() * 220;
    const dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist * 0.8 - 90;
    const giro = Math.random() * 900 - 450;
    const a = f.animate(
      [
        { transform: "translate(-50%,-50%) scale(.2) rotate(0deg)", opacity: 1 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1) rotate(${giro / 2}deg)`, opacity: 1, offset: 0.35 },
        { transform: `translate(calc(-50% + ${dx * 1.3}px), calc(-50% + ${dy + window.innerHeight * 0.6}px)) scale(.9) rotate(${giro}deg)`, opacity: 0 },
      ],
      { duration: 1900 + Math.random() * 1100, easing: "cubic-bezier(.15,.7,.4,1)", delay: Math.random() * 120 }
    );
    a.onfinish = () => f.remove();
  }
}

/* ---------- Produtos (tela inicial) ---------- */
function controleQtd(p) {
  const q = qtd(p.id);
  if (q === 0) return `<button type="button" class="btn btn-primario btn-add" data-add="${p.id}">${iconeMais} Adicionar</button>`;
  return `<div class="qtd" role="group" aria-label="Quantidade de ${esc(p.nome)}">
      <button type="button" class="qtd-btn" data-menos="${p.id}" aria-label="Diminuir ${esc(p.nome)}">−</button>
      <output class="qtd-num" aria-live="polite">${q}</output>
      <button type="button" class="qtd-btn" data-mais="${p.id}" aria-label="Aumentar ${esc(p.nome)}">+</button>
    </div>`;
}
const iconeMais = `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>`;

function renderProdutos() {
  const lista = $("#lista-produtos");
  lista.innerHTML = PRODUTOS.map(
    (p, i) => `
    <li class="produto" data-id="${p.id}" style="--i:${i}">
      <div class="produto-arte">
        ${p.selo ? `<span class="selo">${esc(p.selo)}</span>` : ""}
        ${ILUSTRACOES[p.icone] || ILUSTRACOES.folha}
      </div>
      <div class="produto-corpo">
        <div class="produto-topo">
          <h3 class="produto-nome">${esc(p.nome)}</h3>
          <p class="produto-preco">${brl(p.preco)}</p>
        </div>
        <p class="produto-desc">${esc(p.descricao)}</p>
        ${p.itens && p.itens.length ? `<ul class="produto-itens">${p.itens.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
        <div class="produto-acao" data-acao="${p.id}">${controleQtd(p)}</div>
      </div>
    </li>`
  ).join("");
}

function alterarQtd(id, delta) {
  const p = produto(id);
  if (!p) return;
  const antes = qtd(id);
  const nova = Math.max(0, Math.min(99, antes + delta));
  if (nova === antes) return;
  if (nova === 0) delete estado.carrinho[id];
  else estado.carrinho[id] = nova;
  salvar();
  const box = $(`[data-acao="${id}"]`);
  if (box) box.innerHTML = controleQtd(p);
  if (delta > 0) {
    pulsarCarrinho();
    if (subtotal() > PEDIDO_MAXIMO) toast(`Atenção: o máximo por pedido é ${brl(PEDIDO_MAXIMO)}.`);
    else if (antes === 0) toast(`${p.nome} adicionado ao carrinho`);
  }
  atualizarTudo();
  if (document.body.dataset.tela === "carrinho") renderCarrinho();
}

/* ---------- Carrinho ---------- */
function renderCarrinho() {
  const ids = Object.keys(estado.carrinho);
  $("#carrinho-vazio").hidden = ids.length > 0;
  $("#carrinho-cheio").hidden = ids.length === 0;
  $("#lista-carrinho").innerHTML = ids
    .map((id) => {
      const p = produto(id);
      return `<li class="item">
        <div class="item-arte">${ILUSTRACOES[p.icone] || ILUSTRACOES.folha}</div>
        <div class="item-info">
          <strong class="item-nome">${esc(p.nome)}</strong>
          <span class="item-unit">${brl(p.preco)} cada</span>
          <div class="item-linha">
            ${controleQtd(p).replace("btn-add", "btn-add btn-pequeno")}
            <strong class="item-total">${brl(p.preco * qtd(id))}</strong>
          </div>
        </div>
        <button type="button" class="item-remover" data-remover="${id}" aria-label="Remover ${esc(p.nome)}">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>
        </button>
      </li>`;
    })
    .join("");
  atualizarTudo();
}

function atualizarTudo() {
  const n = totalItens();
  const badge = $("#badge");
  badge.textContent = n;
  badge.hidden = n === 0;
  $("#btn-carrinho").setAttribute("aria-label", `Abrir carrinho, ${n} ${n === 1 ? "item" : "itens"}`);

  // Barra inferior da tela inicial
  $("#barra-total").classList.toggle("visivel", n > 0 && document.body.dataset.tela === "inicio");
  $("#barra-itens").textContent = `${n} ${n === 1 ? "item" : "itens"}`;
  animarValor($("#barra-valor"), subtotal());
  const f = mensagemFaixa();
  const bAviso = $("#barra-aviso");
  bAviso.textContent = f.ok ? "Pronto para finalizar" : f.texto;
  bAviso.classList.toggle("ok", f.ok);

  // Carrinho
  animarValor($("#carrinho-subtotal"), subtotal());
  animarValor($("#carrinho-total"), total());
  $("#carrinho-entrega").textContent =
    estado.modo === "entrega" ? brl(TAXA_ENTREGA) : estado.modo === "retirada" ? "Grátis (retirada)" : "Escolha na próxima etapa";
  const aviso = $("#aviso-faixa");
  aviso.textContent = f.texto;
  aviso.className = "aviso " + (f.ok ? "ok" : "erro");
  $("#btn-finalizar").disabled = !f.ok;
  const pct = Math.min(100, (subtotal() / PEDIDO_MAXIMO) * 100);
  const barra = $("#faixa-preenchida");
  barra.style.width = pct + "%";
  barra.classList.toggle("passou", subtotal() > PEDIDO_MAXIMO);
  barra.classList.toggle("ok", f.ok);

  // Outras telas
  animarValor($("#entrega-total"), total());
  animarValor($("#pagamento-total"), total());
}

/* ---------- Recebimento: retirada ou entrega ---------- */
function horaMin(hhmm) { const [h, m] = hhmm.split(":").map(Number); return [h || 0, m || 0]; }
function rotuloDia(d) {
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const dif = Math.round((d - hoje) / 86400000);
  const data = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  if (dif === 0) return `Hoje (${data})`;
  if (dif === 1) return `Amanhã (${data})`;
  const sem = d.toLocaleDateString("pt-BR", { weekday: "long" });
  return `${sem.charAt(0).toUpperCase() + sem.slice(1)} (${data})`;
}
const horaTxt = (d) => d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

function gerarHorarios() {
  const agora = new Date();
  const pronto = new Date(agora.getTime() + TEMPO_PREPARO_MINUTOS * 60000);
  const passo = INTERVALO_HORARIOS_MINUTOS * 60000;
  const [ha, ma] = horaMin(HORA_ABERTURA);
  const [hf, mf] = horaMin(HORA_FECHAMENTO);
  const dias = [];
  for (let d = 0; d < 10 && dias.length < 3; d++) {
    const dia = new Date(agora); dia.setDate(agora.getDate() + d); dia.setHours(0, 0, 0, 0);
    if (!DIAS_FUNCIONAMENTO.includes(dia.getDay())) continue;
    const ini = new Date(dia); ini.setHours(ha, ma, 0, 0);
    const fim = new Date(dia); fim.setHours(hf, mf, 0, 0);
    let t = new Date(Math.max(ini.getTime(), pronto.getTime()));
    // arredonda para o próximo intervalo a partir da abertura
    const desde = t - ini;
    if (desde > 0) t = new Date(ini.getTime() + Math.ceil(desde / passo) * passo);
    const slots = [];
    while (t <= fim) { slots.push(new Date(t)); t = new Date(t.getTime() + passo); }
    if (slots.length) dias.push({ dia, slots });
  }
  const sel = $("#horario");
  if (!dias.length) {
    sel.innerHTML = `<option value="">Sem horários disponíveis</option>`;
    $("#pronto-em").textContent = "—";
    estado.horario = null;
    return;
  }
  const valores = [];
  sel.innerHTML =
    `<option value="">Escolha um horário</option>` +
    dias.map(({ dia, slots }) =>
      `<optgroup label="${rotuloDia(dia)}">${slots.map((s) => { valores.push(s.toISOString()); return `<option value="${s.toISOString()}">${horaTxt(s)}</option>`; }).join("")}</optgroup>`
    ).join("");
  const primeiro = dias[0].slots[0];
  $("#pronto-em").textContent = `${rotuloDia(dias[0].dia).replace(/ \(.*\)/, "").toLowerCase()}, ${horaTxt(primeiro)}`;
  if (estado.horario && valores.includes(estado.horario)) sel.value = estado.horario;
  else estado.horario = null;
}
function textoHorario(iso) {
  const d = new Date(iso);
  const dia = new Date(d); dia.setHours(0, 0, 0, 0);
  return `${rotuloDia(dia)} às ${horaTxt(d)}`;
}
const linkMapa = (l) => `https://www.google.com/maps?q=${l.lat.toFixed(6)},${l.lng.toFixed(6)}`;

function atualizarEntrega() {
  $$('input[name="modo"]').forEach((r) => (r.checked = r.value === estado.modo));
  $("#bloco-retirada").hidden = estado.modo !== "retirada";
  $("#bloco-entrega").hidden = estado.modo !== "entrega";
  const st = $("#status-localizacao");
  if (estado.localizacao) {
    st.innerHTML = `<span class="ok-txt">✓ Localização recebida</span> (precisão de ~${estado.localizacao.precisao} m). <a href="${linkMapa(estado.localizacao)}" target="_blank" rel="noopener">Ver no mapa</a> · <button type="button" class="link" id="btn-tirar-local">remover</button>`;
    $("#btn-localizacao").lastChild.textContent = " Atualizar localização";
  } else if (!st.dataset.msg) {
    st.textContent = "";
  }
  let aviso = "";
  if (!estado.modo) aviso = "Escolha retirar no local ou entrega.";
  else if (estado.modo === "retirada" && !estado.horario) aviso = "Escolha o horário de retirada.";
  else if (estado.modo === "entrega" && !entregaOk()) aviso = "Envie sua localização ou escreva o endereço com um ponto de referência.";
  const el = $("#aviso-entrega");
  el.textContent = aviso;
  el.className = "aviso " + (aviso ? "info" : "");
  $("#btn-ir-dados").disabled = !entregaOk();
  atualizarTudo();
}

function pedirLocalizacao() {
  const st = $("#status-localizacao");
  const btn = $("#btn-localizacao");
  if (!("geolocation" in navigator)) {
    st.dataset.msg = "1";
    st.innerHTML = `<span class="erro-txt">Seu navegador não permite enviar a localização.</span> Escreva o endereço abaixo.`;
    return;
  }
  btn.disabled = true;
  st.dataset.msg = "1";
  st.textContent = "Buscando sua localização…";
  // Pede UMA única vez (getCurrentPosition). Não há rastreamento contínuo.
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      btn.disabled = false;
      delete st.dataset.msg;
      estado.localizacao = { lat: pos.coords.latitude, lng: pos.coords.longitude, precisao: Math.round(pos.coords.accuracy) };
      atualizarEntrega();
      toast("Localização recebida");
    },
    (err) => {
      btn.disabled = false;
      const msgs = {
        1: "Você não permitiu o acesso à localização.",
        2: "Não foi possível descobrir sua localização agora.",
        3: "Demorou demais para achar sua localização.",
      };
      st.innerHTML = `<span class="erro-txt">${msgs[err.code] || "Não foi possível obter a localização."}</span> Escreva o endereço abaixo.`;
      atualizarEntrega();
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
  );
}

/* ---------- Dados do cliente ---------- */
function mascaraTelefone(v) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (!d.length) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/* ---------- Pagamento ---------- */
function atualizarPagamento() {
  const cartao = $('input[name="pagamento"][value="cartao"]');
  const cripto = $('input[name="pagamento"][value="cripto"]');
  cartao.disabled = !cartaoDisponivel();
  cripto.disabled = !LINK_CRIPTO;
  $("#opcao-cartao").hidden = !LINK_CARTAO;
  $("#opcao-cripto").hidden = !LINK_CRIPTO;
  $("#cartao-sub").textContent = cartaoDisponivel() ? "Link de pagamento seguro" : `Disponível a partir de ${brl(MINIMO_CARTAO)}`;
  if (estado.pagamento && !pagamentoOk()) estado.pagamento = null;
  $$('input[name="pagamento"]').forEach((r) => (r.checked = r.value === estado.pagamento));

  $("#bloco-pix").hidden = estado.pagamento !== "pix";
  $("#bloco-cartao").hidden = estado.pagamento !== "cartao";
  $("#bloco-cripto").hidden = estado.pagamento !== "cripto";

  if (estado.pagamento === "pix") {
    const codigo = gerarPix(total(), estado.numero);
    $("#pix-codigo").value = codigo;
    $("#pix-valor").textContent = brl(total());
    $("#pix-recebedor").textContent = limparTexto(NOME_RECEBEDOR, 25);
    try { $("#pix-qr").innerHTML = QRCodigo.svg(codigo); }
    catch (e) { $("#pix-qr").innerHTML = `<p class="aviso erro">Não foi possível gerar o QR Code. Use o código copia e cola.</p>`; }
  }
  $("#cartao-valor").textContent = brl(total());
  $("#cripto-valor").textContent = brl(total());
  $("#btn-link-cartao").href = LINK_CARTAO || "#";
  $("#btn-link-cripto").href = LINK_CRIPTO || "#";
  $("#btn-ir-confirmar").disabled = !pagamentoOk();
  atualizarTudo();
}

async function copiarPix() {
  const ta = $("#pix-codigo");
  const btn = $("#btn-copiar-pix");
  let ok = false;
  try { await navigator.clipboard.writeText(ta.value); ok = true; }
  catch (e) {
    ta.focus(); ta.select(); ta.setSelectionRange(0, ta.value.length);
    try { ok = document.execCommand("copy"); } catch (e2) { ok = false; }
  }
  btn.classList.toggle("copiado", ok);
  btn.lastChild.textContent = ok ? " Código copiado!" : " Selecione e copie o código";
  toast(ok ? "Código Pix copiado. Cole no app do seu banco." : "Não deu para copiar automaticamente.");
  setTimeout(() => { btn.classList.remove("copiado"); btn.lastChild.textContent = " Copiar código Pix"; }, 3000);
}

/* ---------- Confirmação e WhatsApp ---------- */
const NOMES_PAGAMENTO = { pix: "Pix", cartao: "Cartão (link de pagamento)", cripto: "Criptomoeda (link de pagamento)" };

function montarMensagem() {
  const linhas = [];
  linhas.push(`🌿 *Novo pedido — Ervas Medicinais Cap*`);
  linhas.push(`Pedido: *${estado.numero}*`);
  linhas.push("");
  linhas.push(`*Cliente:* ${estado.nome.trim()}`);
  linhas.push(`*Telefone:* ${estado.telefone}`);
  linhas.push("");
  linhas.push(`*Itens:*`);
  for (const [id, q] of Object.entries(estado.carrinho)) {
    const p = produto(id);
    linhas.push(`• ${q}x ${p.nome} — ${brl(p.preco * q)}`);
  }
  linhas.push("");
  linhas.push(`Subtotal: ${brl(subtotal())}`);
  if (estado.modo === "entrega") linhas.push(`Taxa de entrega: ${brl(TAXA_ENTREGA)}`);
  linhas.push(`*Total: ${brl(total())}*`);
  linhas.push("");
  if (estado.modo === "retirada") {
    linhas.push(`*Recebimento:* Retirada no local`);
    linhas.push(`*Horário:* ${textoHorario(estado.horario)}`);
  } else {
    linhas.push(`*Recebimento:* Entrega`);
    if (estado.endereco.trim()) linhas.push(`*Endereço/referência:* ${estado.endereco.trim()}`);
    if (estado.localizacao) linhas.push(`*Localização:* ${linkMapa(estado.localizacao)}`);
  }
  linhas.push("");
  linhas.push(`*Pagamento:* ${NOMES_PAGAMENTO[estado.pagamento]}`);
  if (estado.pagamento === "pix") linhas.push(`Vou enviar o comprovante do Pix aqui.`);
  else linhas.push(`Vou enviar o comprovante do pagamento aqui.`);
  return linhas.join("\n");
}

function renderConfirmacao() {
  const itens = Object.entries(estado.carrinho)
    .map(([id, q]) => { const p = produto(id); return `<li><span>${q}× ${esc(p.nome)}</span><strong>${brl(p.preco * q)}</strong></li>`; })
    .join("");
  const receber =
    estado.modo === "retirada"
      ? `<dt>Retirada no local</dt><dd>${esc(textoHorario(estado.horario))}<br><small>${esc(ENDERECO_RETIRADA)}</small></dd>`
      : `<dt>Entrega</dt><dd>${estado.endereco.trim() ? esc(estado.endereco.trim()) : ""}${estado.localizacao ? `${estado.endereco.trim() ? "<br>" : ""}<a href="${linkMapa(estado.localizacao)}" target="_blank" rel="noopener">📍 Localização enviada</a>` : ""}</dd>`;
  $("#resumo-final").innerHTML = `
    <p class="numero-pedido">Pedido <strong>${esc(estado.numero)}</strong></p>
    <ul class="resumo-itens">${itens}</ul>
    <div class="linha"><span>Subtotal</span><span>${brl(subtotal())}</span></div>
    ${estado.modo === "entrega" ? `<div class="linha"><span>Taxa de entrega</span><span>${brl(TAXA_ENTREGA)}</span></div>` : ""}
    <div class="linha total"><span>Total</span><strong>${brl(total())}</strong></div>
    <dl class="resumo-dados">
      <dt>Cliente</dt><dd>${esc(estado.nome.trim())} · ${esc(estado.telefone)}</dd>
      ${receber}
      <dt>Pagamento</dt><dd>${esc(NOMES_PAGAMENTO[estado.pagamento])}</dd>
    </dl>`;
  const numero = WHATSAPP_VENDEDOR.replace(/\D/g, "");
  $("#btn-whatsapp").href = `https://wa.me/${numero}?text=${encodeURIComponent(montarMensagem())}`;
}

function novoPedido() {
  estado.carrinho = {};
  estado.modo = null;
  estado.horario = null;
  estado.endereco = "";
  estado.localizacao = null;
  estado.pagamento = null;
  estado.numero = null;
  $("#endereco").value = "";
  salvar();
  renderProdutos();
  location.hash = "#inicio";
  atualizarTudo();
}

/* ---------- Navegação entre telas ---------- */
function destinoPermitido(nome) {
  const i = ROTAS.indexOf(nome);
  if (i >= 2 && (totalItens() === 0 || !faixaOk())) return "carrinho";
  if (i >= 3 && !entregaOk()) return "entrega";
  if (i >= 4 && !dadosOk()) return "dados";
  if (i >= 5 && !pagamentoOk()) return "pagamento";
  return nome;
}

function rota() {
  let nome = location.hash.replace("#", "") || "inicio";
  if (!ROTAS.includes(nome)) nome = "inicio";
  const destino = destinoPermitido(nome);
  if (destino !== nome) { location.replace("#" + destino); return; }

  $$(".tela").forEach((t) => (t.hidden = t.dataset.tela !== nome));
  document.body.dataset.tela = nome;
  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });

  // Indicador de etapas
  const idx = ROTAS.indexOf(nome);
  $("#etapas").hidden = idx === 0;
  $$("#etapas li").forEach((li, i) => {
    li.classList.toggle("feita", i + 1 < idx);
    li.classList.toggle("atual", i + 1 === idx);
    if (i + 1 === idx) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
  });

  if (nome === "carrinho") renderCarrinho();
  if (nome === "entrega") { gerarHorarios(); atualizarEntrega(); }
  if (nome === "dados") { $("#nome").value = estado.nome; $("#telefone").value = estado.telefone; }
  if (nome === "pagamento") {
    if (!estado.numero) estado.numero = "CAP" + Date.now().toString(36).toUpperCase().slice(-6);
    atualizarPagamento();
  }
  if (nome === "confirmacao") { renderConfirmacao(); setTimeout(confete, 250); }
  atualizarTudo();

  const h = $(`.tela[data-tela="${nome}"] h1`);
  if (h && nome !== "inicio") h.focus({ preventScroll: true });
}

/* ---------- Eventos ---------- */
function ligarEventos() {
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-add],[data-mais],[data-menos],[data-remover],#btn-tirar-local");
    if (!t) return;
    if (t.dataset.add) alterarQtd(t.dataset.add, 1);
    else if (t.dataset.mais) alterarQtd(t.dataset.mais, 1);
    else if (t.dataset.menos) alterarQtd(t.dataset.menos, -1);
    else if (t.dataset.remover) alterarQtd(t.dataset.remover, -qtd(t.dataset.remover));
    else if (t.id === "btn-tirar-local") {
      estado.localizacao = null;
      $("#btn-localizacao").lastChild.textContent = " Enviar minha localização";
      atualizarEntrega();
    }
  });

  // Efeito de "levantar" ao tocar nos cards
  document.addEventListener("pointerdown", (e) => {
    const c = e.target.closest(".produto");
    if (c) c.classList.add("tocando");
  });
  const soltar = () => $$(".produto.tocando").forEach((c) => setTimeout(() => c.classList.remove("tocando"), 180));
  ["pointerup", "pointercancel"].forEach((ev) => document.addEventListener(ev, soltar));

  $("#btn-finalizar").addEventListener("click", () => { if (faixaOk()) location.hash = "#entrega"; });

  $$('input[name="modo"]').forEach((r) =>
    r.addEventListener("change", () => { estado.modo = r.value; atualizarEntrega(); })
  );
  $("#horario").addEventListener("change", (e) => { estado.horario = e.target.value || null; atualizarEntrega(); });
  $("#btn-localizacao").addEventListener("click", pedirLocalizacao);
  $("#endereco").addEventListener("input", (e) => { estado.endereco = e.target.value; atualizarEntrega(); });
  $("#btn-ir-dados").addEventListener("click", () => { if (entregaOk()) location.hash = "#dados"; });

  $("#telefone").addEventListener("input", (e) => {
    e.target.value = mascaraTelefone(e.target.value);
    estado.telefone = e.target.value;
  });
  $("#nome").addEventListener("input", (e) => (estado.nome = e.target.value));
  $("#form-dados").addEventListener("submit", (e) => {
    e.preventDefault();
    estado.nome = $("#nome").value;
    estado.telefone = mascaraTelefone($("#telefone").value);
    const erros = [];
    if (estado.nome.trim().length < 2) erros.push("Digite seu nome.");
    if (digitosTel().length < 10) erros.push("Digite o telefone com DDD, ex.: (11) 91234-5678.");
    const el = $("#erro-dados");
    el.textContent = erros.join(" ");
    el.className = "aviso " + (erros.length ? "erro" : "");
    if (erros.length) { (estado.nome.trim().length < 2 ? $("#nome") : $("#telefone")).focus(); return; }
    salvar();
    location.hash = "#pagamento";
  });

  $$('input[name="pagamento"]').forEach((r) =>
    r.addEventListener("change", () => { estado.pagamento = r.value; atualizarPagamento(); })
  );
  $("#btn-copiar-pix").addEventListener("click", copiarPix);
  $("#btn-ir-confirmar").addEventListener("click", () => { if (pagamentoOk()) location.hash = "#confirmacao"; });

  $("#btn-whatsapp").addEventListener("click", () => setTimeout(confete, 50));
  $("#btn-novo").addEventListener("click", novoPedido);

  window.addEventListener("hashchange", rota);
}

/* ---------- PWA: instalação e modo offline ---------- */
function configurarPWA() {
  let pedidoInstalacao = null;
  const btn = $("#btn-instalar");
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    pedidoInstalacao = e;
    btn.hidden = false;
  });
  btn.addEventListener("click", async () => {
    if (!pedidoInstalacao) return;
    pedidoInstalacao.prompt();
    await pedidoInstalacao.userChoice.catch(() => null);
    pedidoInstalacao = null;
    btn.hidden = true;
  });
  window.addEventListener("appinstalled", () => { btn.hidden = true; toast("App instalado!"); });

  // Dica para iPhone (o Safari não mostra botão de instalar)
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const instalado = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone;
  let dispensou = false;
  try { dispensou = localStorage.getItem("ervas-cap-dica-ios") === "1"; } catch (e) {}
  if (ios && !instalado && !dispensou) {
    $("#dica-ios").hidden = false;
    $("#fechar-dica-ios").addEventListener("click", () => {
      $("#dica-ios").hidden = true;
      try { localStorage.setItem("ervas-cap-dica-ios", "1"); } catch (e) {}
    });
  }

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js").catch(() => {}));
  }
}

/* ---------- Início ---------- */
function iniciar() {
  carregar();
  // Textos que vêm da configuração
  $("#regra-minimo").textContent = `Pedido mínimo ${brl(PEDIDO_MINIMO)}`;
  $("#faixa-min").textContent = `Mín. ${brl(PEDIDO_MINIMO)}`;
  $("#faixa-max").textContent = `Máx. ${brl(PEDIDO_MAXIMO)}`;
  $("#faixa-marca").style.left = `${(PEDIDO_MINIMO / PEDIDO_MAXIMO) * 100}%`;
  $("#taxa-entrega-txt").textContent = `Taxa fixa de ${brl(TAXA_ENTREGA)}`;
  $("#endereco-loja").textContent = ENDERECO_RETIRADA;
  $("#cartao-minimo").textContent = brl(MINIMO_CARTAO);
  $("#ano").textContent = new Date().getFullYear();

  renderProdutos();
  criarFolhasFundo();
  ligarEventos();
  configurarPWA();
  rota();
}

document.addEventListener("DOMContentLoaded", iniciar);
