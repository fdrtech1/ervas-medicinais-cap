/* =========================================================
   PRODUTOS — Ervas Medicinais Cap
   Edite aqui os produtos do cardápio. Cada produto é um bloco { ... }.

   - id:        identificador único, sem espaços nem acentos. Não repita.
   - nome:      nome que aparece no cardápio.
   - descricao: texto curto. IMPORTANTE: não escreva promessas de cura,
                tratamento ou efeito no corpo. Venda como chá / erva.
   - preco:     número com PONTO como separador decimal.
                Ex.: 100 = R$ 100,00   |   49.9 = R$ 49,90
   - icone:     ilustração do card: "folha", "ramo" ou "xicara".
   - selo:      etiqueta opcional no canto do card ("" para nenhuma).
   - itens:     lista opcional do que vem no kit (aparece em tópicos).
                Use [] para não mostrar nada.

   Para adicionar um produto, copie um bloco inteiro, cole abaixo
   do último (não esqueça a vírgula entre os blocos) e mude o id.
   ========================================================= */

const PRODUTOS = [
  {
    id: "kit-1",
    nome: "Kit 1",
    descricao: "Seleção de ervas secas para quem quer conhecer nossos chás. Aromas suaves para o dia a dia.",
    preco: 100.0,
    icone: "folha",
    selo: "Para começar",
    itens: ["3 ervas secas selecionadas", "Embalagem kraft reutilizável", "Cartão com modo de preparo"],
  },
  {
    id: "kit-2",
    nome: "Kit 2",
    descricao: "Mais variedade na sua xícara: ervas e um blend aromático da casa, embalados à mão.",
    preco: 200.0,
    icone: "ramo",
    selo: "Mais pedido",
    itens: ["6 ervas secas selecionadas", "1 blend aromático da casa", "Cartão com modo de preparo"],
  },
  {
    id: "kit-3",
    nome: "Kit 3",
    descricao: "O kit completo para presentear ou montar seu cantinho do chá, com acessório incluso.",
    preco: 400.0,
    icone: "xicara",
    selo: "Completo",
    itens: ["10 ervas secas selecionadas", "3 blends aromáticos da casa", "Infusor de inox", "Caixa para presente"],
  },
];
