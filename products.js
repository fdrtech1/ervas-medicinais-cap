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
      - de:        (opcional, combos) quanto custaria comprar tudo separado.
                   Aparece riscado ao lado do preço. Use 0 para esconder.
      - icone:     ilustração do card. Opções:
                   "combo", "seda", "tabaco", "piteira", "dichavador",
                   "isqueiro", "bandeja", "salgadinho", "chocolate",
                   "refri", "cookie", "bala"
      - selo:      etiqueta opcional no canto do card ("" para nenhuma).
      - itens:     lista do que vem (usada nos combos). [] = nada.
   ========================================================= */

const CATEGORIAS = [
  { id: "combos", nome: "Combos", texto: "Tudo separado pra você, com desconto no preço fechado.", cor: "ouro", destaque: true },
  { id: "tabacaria", nome: "Tabacaria", texto: "Sedas, tabaco, piteiras e acessórios.", cor: "verde", destaque: false },
  { id: "larica", nome: "Larica", texto: "Doce, salgado e gelado pra acompanhar.", cor: "vermelho", destaque: false },
];

const PRODUTOS = [
  // ---------- COMBOS ----------
  // Kingston: 34,90 + 3×6,00 + 3,50 + 12,00 + 5,00 + 9,90 + 11,00 + 6,50 + 6,50 = 107,30
  {
    id: "combo-kingston",
    categoria: "combos",
    nome: "Combo Kingston",
    descricao: "O essencial pra enrolar, com uma larica completa junto.",
    preco: 100.0,
    de: 107.3,
    icone: "combo",
    selo: "Pra começar",
    itens: ["Tabaco para enrolar 50 g", "3 sedas King Size Brown", "Piteira de papel + piteira de vidro", "Isqueiro", "Salgadinho, chocolate, cookies e refri lata"],
  },
  // Montego Bay: 35 + 30 + 34,90 + 18,90 + 5×6 + 12 + 2×3,50 + 2×5 + 2×9,90 + 11 + 6,50 + 2×6,50 = 228,10
  {
    id: "combo-montego-bay",
    categoria: "combos",
    nome: "Combo Montego Bay",
    descricao: "Com dichavador e bandeja de metal, mais tabaco e larica pra dividir.",
    preco: 200.0,
    de: 228.1,
    icone: "combo",
    selo: "Mais pedido",
    itens: ["Tabaco para enrolar 50 g + 25 g", "5 sedas King Size Brown", "Piteira de vidro + 2 de papel", "Dichavador de metal", "Bandeja de metal", "2 isqueiros", "2 salgadinhos, chocolate, cookies e 2 refris"],
  },
  // Zion: 35 + 30 + 4×34,90 + 10×6 + 2×12 + 3×3,50 + 3×5 + 4×9,90 + 3×11 + 2×6,50 + 2×7,50 + 6×6,50 = 453,70
  {
    id: "combo-zion",
    categoria: "combos",
    nome: "Combo Zion",
    descricao: "O kit completo da casa: acessórios, estoque de tabaco e larica de respeito.",
    preco: 400.0,
    de: 453.7,
    icone: "combo",
    selo: "Completo",
    itens: ["4 tabacos para enrolar 50 g", "10 sedas King Size Brown", "2 piteiras de vidro + 3 de papel", "Dichavador de metal", "Bandeja de metal", "3 isqueiros", "4 salgadinhos, 3 chocolates, 2 cookies, 2 balas de goma e 6 refris"],
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
