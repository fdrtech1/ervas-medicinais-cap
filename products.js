/* =========================================================
   PRODUTOS — Ervas Medicinais Cap (tabacaria & larica)

   Os preços abaixo foram baseados em valores reais de tabacarias online e
   supermercados/apps de delivery do Brasil (nov/2026). Ajuste para o seu
   custo e margem.

   1) CATEGORIAS: as seções do cardápio, na ordem em que aparecem.
      - id:       identificador (sem espaços). Usado no campo "categoria".
      - nome:     título da seção.
      - texto:    frase curta embaixo do título.
      - cor:      "ouro", "verde" ou "vermelho".
      - destaque: true = cards grandes (1 por linha no celular).

   2) PRODUTOS: cada produto é um bloco { ... }.
      - id:        identificador único, sem espaços nem acentos. Não repita.
      - categoria: id de uma das categorias acima.
      - nome:      nome que aparece no cardápio.
      - descricao: texto curto. Não escreva promessas de efeito no corpo.
      - preco:     número com PONTO decimal. Ex.: 6 = R$ 6,00 | 18.9 = R$ 18,90
                   Nos COMBOS use preco: "soma" — o app calcula sozinho
                   somando o preço de todos os itens do combo.
      - icone:     ilustração do card. Opções:
                   "combo", "seda", "tabaco", "piteira", "dichavador",
                   "isqueiro", "bandeja", "salgadinho", "chocolate",
                   "refri", "cookie", "bala"
      - selo:      etiqueta opcional no canto do card ("" para nenhuma).
      - itens:     o que vem no combo. Cada item pode ser:
                   { id: "seda-king-brown", qtd: 3 }
                       → usa o nome e o preço do produto avulso com esse id
                         (mudou o preço da seda? o combo muda junto)
                   { nome: "Tabaco para enrolar 20 g", qtd: 1, preco: 15.9 }
                       → item que não é vendido separado, com preço próprio
                   Produtos avulsos usam itens: [].
   ========================================================= */

const CATEGORIAS = [
  { id: "combos", nome: "Combos", texto: "Tudo separado e embalado junto. O preço é a soma dos itens.", cor: "ouro", destaque: true },
  { id: "tabacaria", nome: "Tabacaria", texto: "Sedas, tabaco, piteiras e acessórios.", cor: "verde", destaque: false },
  { id: "larica", nome: "Larica", texto: "Doce, salgado e gelado pra acompanhar.", cor: "vermelho", destaque: false },
];

const PRODUTOS = [
  // ---------- COMBOS ----------
  // O preço de cada combo é a soma dos itens (preco: "soma").
  {
    id: "combo-kingston",
    categoria: "combos",
    nome: "Combo Kingston",
    descricao: "O essencial pra enrolar, com uma larica completa junto.",
    preco: "soma",
    icone: "combo",
    selo: "Pra começar",
    itens: [
      { nome: "Tabaco para enrolar 20 g", qtd: 1, preco: 15.9 },
      { id: "seda-king-brown", qtd: 3 },
      { id: "piteira-papel", qtd: 1 },
      { id: "piteira-vidro", qtd: 1 },
      { id: "isqueiro", qtd: 1 },
      { id: "salgadinho", qtd: 1 },
      { id: "chocolate", qtd: 1 },
      { id: "cookies", qtd: 1 },
      { id: "refri-lata", qtd: 1 },
    ],
  },
  {
    id: "combo-montego-bay",
    categoria: "combos",
    nome: "Combo Montego Bay",
    descricao: "Com dichavador e bandeja de metal, mais tabaco e larica pra dividir.",
    preco: "soma",
    icone: "combo",
    selo: "Mais pedido",
    itens: [
      { id: "tabaco-50", qtd: 1 },
      { id: "tabaco-25", qtd: 1 },
      { id: "seda-king-brown", qtd: 5 },
      { id: "piteira-vidro", qtd: 1 },
      { id: "piteira-papel", qtd: 2 },
      { id: "dichavador-metal", qtd: 1 },
      { id: "bandeja-metal", qtd: 1 },
      { id: "isqueiro", qtd: 2 },
      { id: "salgadinho", qtd: 2 },
      { id: "chocolate", qtd: 1 },
      { id: "cookies", qtd: 1 },
      { id: "refri-lata", qtd: 2 },
    ],
  },
  {
    id: "combo-zion",
    categoria: "combos",
    nome: "Combo Zion",
    descricao: "O kit completo da casa: acessórios, estoque de tabaco e larica de respeito.",
    preco: "soma",
    icone: "combo",
    selo: "Completo",
    itens: [
      { nome: "Tabaco para enrolar 100 g", qtd: 1, preco: 69.8 },
      { id: "seda-king-brown", qtd: 10 },
      { id: "piteira-vidro", qtd: 2 },
      { id: "piteira-papel", qtd: 3 },
      { id: "dichavador-metal", qtd: 1 },
      { id: "bandeja-metal", qtd: 1 },
      { id: "isqueiro", qtd: 3 },
      { id: "salgadinho", qtd: 4 },
      { id: "chocolate", qtd: 3 },
      { id: "cookies", qtd: 2 },
      { id: "bala-goma", qtd: 2 },
      { id: "refri-lata", qtd: 6 },
    ],
  },

  // ---------- TABACARIA ----------
  { id: "seda-king-brown", categoria: "tabacaria", nome: "Seda King Size Brown", descricao: "Livreto de papel natural, tamanho king size.", preco: 6.0, icone: "seda", selo: "", itens: [] },
  { id: "seda-slim-branca", categoria: "tabacaria", nome: "Seda Slim Branca", descricao: "Livreto de folhas finas, tamanho slim.", preco: 3.5, icone: "seda", selo: "", itens: [] },
  { id: "tabaco-25", categoria: "tabacaria", nome: "Tabaco para Enrolar 25 g", descricao: "Pacote com fecho, corte fino.", preco: 18.9, icone: "tabaco", selo: "", itens: [] },
  { id: "tabaco-50", categoria: "tabacaria", nome: "Tabaco para Enrolar 50 g", descricao: "Pacote maior com fecho, corte fino.", preco: 34.9, icone: "tabaco", selo: "Rende mais", itens: [] },
  { id: "piteira-papel", categoria: "tabacaria", nome: "Piteira de Papel", descricao: "Livreto picotado, fácil de enrolar.", preco: 3.5, icone: "piteira", selo: "", itens: [] },
  { id: "piteira-vidro", categoria: "tabacaria", nome: "Piteira de Vidro", descricao: "Reutilizável e lavável.", preco: 12.0, icone: "piteira", selo: "", itens: [] },
  { id: "dichavador-metal", categoria: "tabacaria", nome: "Dichavador de Metal", descricao: "4 partes, dentes afiados e ímã na tampa.", preco: 35.0, icone: "dichavador", selo: "", itens: [] },
  { id: "isqueiro", categoria: "tabacaria", nome: "Isqueiro", descricao: "Isqueiro a gás, cores sortidas.", preco: 5.0, icone: "isqueiro", selo: "", itens: [] },
  { id: "bandeja-metal", categoria: "tabacaria", nome: "Bandeja de Metal", descricao: "Tamanho médio, estampada.", preco: 30.0, icone: "bandeja", selo: "", itens: [] },

  // ---------- LARICA ----------
  { id: "salgadinho", categoria: "larica", nome: "Salgadinho", descricao: "Pacote de 100 g, sabores sortidos.", preco: 9.9, icone: "salgadinho", selo: "", itens: [] },
  { id: "chocolate", categoria: "larica", nome: "Chocolate", descricao: "Barra ao leite de 90 g.", preco: 11.0, icone: "chocolate", selo: "", itens: [] },
  { id: "cookies", categoria: "larica", nome: "Cookies", descricao: "Pacote com gotas de chocolate.", preco: 6.5, icone: "cookie", selo: "", itens: [] },
  { id: "bala-goma", categoria: "larica", nome: "Bala de Goma", descricao: "Pacote de 150 g, sabores de fruta.", preco: 7.5, icone: "bala", selo: "", itens: [] },
  { id: "refri-lata", categoria: "larica", nome: "Refri Lata", descricao: "Lata de 350 ml gelada, sabores sortidos.", preco: 6.5, icone: "refri", selo: "", itens: [] },
];
