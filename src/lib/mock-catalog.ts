import type { CatalogData, Product, ProductVariation } from "./catalog.types";

const IMG = {
  brigadeiroChocolate: "/assets/02-brigadeiros/brigadeiro-chocolate-close.jpg",
  brigadeiroPersonalizado: "/assets/02-brigadeiros/brigadeiro-chocolate-personalizado.jpg",
  brigadeiroVerdes: "/assets/02-brigadeiros/brigadeiros-variados-forminhas-verdes.jpg",
  chocolateCoco: "/assets/02-brigadeiros/chocolate-coco-forminhas-brancas.jpg",
  mixRosaAmarelo: "/assets/02-brigadeiros/mix-rosa-amarelo-coco.jpg",
  variedadesVerdes: "/assets/02-brigadeiros/variedades-em-forminhas-verdes.jpg",
  aliceClose: "/assets/03-personalizados/alice-personagem-close.jpg",
  aliceConjunto: "/assets/03-personalizados/alice-conjunto.jpg",
  aliceChave: "/assets/03-personalizados/alice-chave-dourada-close.jpg",
  angelClose: "/assets/03-personalizados/angel-close-rosa.jpg",
  anjoBranco: "/assets/03-personalizados/anjo-branco-dourado-close.jpg",
  bailarinaClose: "/assets/03-personalizados/bailarina-close.jpg",
  bailarinaConjunto: "/assets/03-personalizados/bailarina-conjunto.jpg",
  dinossauro: "/assets/03-personalizados/dinossauro-sortidos.jpg",
  estrelaDourada: "/assets/03-personalizados/estrela-dourada-close.jpg",
  fazendinha: "/assets/03-personalizados/fazendinha-conjunto.jpg",
  iniciais: "/assets/03-personalizados/iniciais-numeros-dourados.jpg",
  numeros: "/assets/03-personalizados/numeros-personalizados.jpg",
  religioso: "/assets/03-personalizados/religioso-conjunto.jpg",
  stitch: "/assets/03-personalizados/stitch-close-azul.jpg",
  verdeDourado: "/assets/03-personalizados/verde-dourado-tematico.jpg",
  caixaSortidos: "/assets/04-caixas/caixa-brigadeiros-sortidos.jpg",
  caixaMista: "/assets/04-caixas/caixa-mista-escura-e-clara.jpg",
};

const CATEGORIES = {
  brigadeiros: "11111111-1111-4111-8111-111111111111",
  personalizados: "22222222-2222-4222-8222-222222222222",
  caixas: "33333333-3333-4333-8333-333333333333",
  presentes: "44444444-4444-4444-8444-444444444444",
  ocasoes: "55555555-5555-4555-8555-555555555555",
};

let seq = 0;
function id(): string {
  seq += 1;
  return `demo-${seq.toString().padStart(4, "0")}`;
}

function variation(name: string, price: number | null, order: number): ProductVariation {
  return { id: id(), name, price, is_available: true, display_order: order };
}

type ProductSeed = {
  categoryId: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  price: number | null;
  features: string[];
  isFeatured: boolean;
  image: string;
  variations?: [string, number | null][];
};

function product(seed: ProductSeed): Product {
  seq += 1;
  const productId = `demo-product-${seq.toString().padStart(4, "0")}`;
  return {
    id: productId,
    category_id: seed.categoryId,
    name: seed.name,
    slug: seed.slug,
    short_description: seed.shortDescription,
    description: seed.description,
    price: seed.price,
    features: seed.features,
    is_available: true,
    is_featured: seed.isFeatured,
    display_order: seq,
    product_images: [{ id: id(), image_url: seed.image, alt_text: seed.name, display_order: 0 }],
    product_variations: (seed.variations ?? []).map(([name, price], index) =>
      variation(name, price, index + 1),
    ),
  };
}

const PRODUCTS: Product[] = [
  product({
    categoryId: CATEGORIES.caixas,
    name: "Caixa com 25 brigadeiros",
    slug: "caixa-com-25-brigadeiros",
    shortDescription: "Sabores tradicionais",
    description:
      "Caixa com 25 brigadeiros gourmet em sabores tradicionais, feitos no dia. Perfeita para festas, presentear ou adoçar o seu momento.",
    price: 75.0,
    features: ["25 unidades", "Sabores tradicionais", "Feitos no dia"],
    isFeatured: true,
    image: IMG.caixaSortidos,
    variations: [
      ["25 unidades", 75.0],
      ["50 unidades", 140.0],
    ],
  }),
  product({
    categoryId: CATEGORIES.brigadeiros,
    name: "Brigadeiro Tradicional",
    slug: "brigadeiro-tradicional",
    shortDescription: "O clássico brigadeiro de chocolate",
    description:
      "Nosso brigadeiro tradicional, com chocolate cremoso e granulado macio. Feito na hora do pedido, com todo o carinho de sempre.",
    price: 4.5,
    features: ["Chocolate cremoso", "Feito no dia", "Granulado macio"],
    isFeatured: true,
    image: IMG.brigadeiroChocolate,
    variations: [
      ["Unidade", 4.5],
      ["Caixa c/ 6", 25.0],
      ["Caixa c/ 12", 48.0],
    ],
  }),
  product({
    categoryId: CATEGORIES.brigadeiros,
    name: "Brigadeiro Premium",
    slug: "brigadeiro-premium",
    shortDescription: "Chocolate meio amargo com toque especial",
    description:
      "Brigadeiro gourmet com chocolate intenso e acabamento delicado. Uma versão sofisticada do clássico.",
    price: 6.5,
    features: ["Chocolate intenso", "Acabamento gourmet", "Feito no dia"],
    isFeatured: true,
    image: IMG.brigadeiroPersonalizado,
    variations: [
      ["Unidade", 6.5],
      ["Caixa c/ 9", 54.0],
    ],
  }),
  product({
    categoryId: CATEGORIES.brigadeiros,
    name: "Beijinho de Coco",
    slug: "beijinho-de-coco",
    shortDescription: "Coco cremoso com leite condensado",
    description: "O clássico beijinho de coco, cremoso por dentro e coberto com coco fresco.",
    price: 4.0,
    features: ["Coco natural", "Cobertura de coco"],
    isFeatured: false,
    image: IMG.chocolateCoco,
  }),
  product({
    categoryId: CATEGORIES.brigadeiros,
    name: "Brigadeiros Variados",
    slug: "brigadeiros-variados",
    shortDescription: "Mix de sabores em forminhas",
    description: "Uma seleção de brigadeiros em sabores variados, perfeita para dividir.",
    price: 5.0,
    features: ["Sabores variados", "Ideal para festas"],
    isFeatured: false,
    image: IMG.brigadeiroVerdes,
  }),
  product({
    categoryId: CATEGORIES.brigadeiros,
    name: "Mix Rosa e Coco",
    slug: "mix-rosa-e-coco",
    shortDescription: "Brigadeiros rosa, amarelo e coco",
    description: "Combinação delicada de brigadeiros rosé e beijinhos de coco.",
    price: 5.5,
    features: ["Sabores delicados", "Acabamento especial"],
    isFeatured: false,
    image: IMG.mixRosaAmarelo,
  }),
  product({
    categoryId: CATEGORIES.personalizados,
    name: "Kit Personalizado 20 unidades",
    slug: "kit-personalizado-20",
    shortDescription: "Escolha até 4 sabores",
    description:
      "Monte seu kit com até 4 sabores diferentes e embalagem personalizada. Perfeito para festas e eventos.",
    price: 89.9,
    features: ["Até 4 sabores", "Embalagem personalizada", "Fita e adesivo"],
    isFeatured: true,
    image: IMG.aliceConjunto,
    variations: [
      ["Kit 20 unidades", 89.9],
      ["Kit 40 unidades", 169.9],
    ],
  }),
  product({
    categoryId: CATEGORIES.personalizados,
    name: "Tema Alice",
    slug: "tema-alice",
    shortDescription: "Brigadeiros temáticos da Alice",
    description:
      "Brigadeiros decorados com o tema Alice no País das Maravilhas. Encantam qualquer festa infantil.",
    price: 7.0,
    features: ["Decoração temática", "Feito no dia", "Pedido mínimo 20un"],
    isFeatured: true,
    image: IMG.aliceClose,
  }),
  product({
    categoryId: CATEGORIES.personalizados,
    name: "Tema Bailarina",
    slug: "tema-bailarina",
    shortDescription: "Delicadeza em cada detalhe",
    description: "Brigadeiros personalizados com o tema bailarina, em tons suaves e elegantes.",
    price: 7.5,
    features: ["Tema bailarina", "Tons delicados", "Pedido mínimo 20un"],
    isFeatured: false,
    image: IMG.bailarinaClose,
  }),
  product({
    categoryId: CATEGORIES.personalizados,
    name: "Tema Stitch",
    slug: "tema-stitch",
    shortDescription: "O personagem azul favorito da galera",
    description: "Kit personalizado com o tema Stitch. Diversão garantida na festa.",
    price: 7.5,
    features: ["Tema Stitch", "Kit montado", "Pedido mínimo 20un"],
    isFeatured: false,
    image: IMG.stitch,
  }),
  product({
    categoryId: CATEGORIES.personalizados,
    name: "Iniciais e Números Dourados",
    slug: "iniciais-numeros-dourados",
    shortDescription: "Personalização dourada para presentes",
    description: "Brigadeiros com iniciais ou números em dourado, ideais para datas especiais.",
    price: 8.0,
    features: ["Personalização dourada", "Iniciais ou números", "Pedido mínimo 20un"],
    isFeatured: false,
    image: IMG.iniciais,
  }),
  product({
    categoryId: CATEGORIES.caixas,
    name: "Caixa Amor",
    slug: "caixa-amor",
    shortDescription: "12 brigadeiros premium",
    description: "Caixa temática com 12 brigadeiros premium. Perfeita para presente de amor.",
    price: 79.9,
    features: ["12 brigadeiros premium", "Caixa temática", "Fita de cetim"],
    isFeatured: true,
    image: IMG.caixaSortidos,
    variations: [
      ["Caixa c/ 12", 79.9],
      ["Caixa c/ 24", 149.9],
    ],
  }),
  product({
    categoryId: CATEGORIES.caixas,
    name: "Caixa Festa",
    slug: "caixa-festa",
    shortDescription: "24 brigadeiros variados",
    description:
      "Caixa com 24 brigadeiros em sabores variados. Ideal para festas e confraternizações.",
    price: 129.9,
    features: ["24 brigadeiros", "Sabores variados", "Caixa decorada"],
    isFeatured: false,
    image: IMG.caixaMista,
  }),
  product({
    categoryId: CATEGORIES.presentes,
    name: "Presente Dia das Mães",
    slug: "presente-dia-das-maes",
    shortDescription: "Kit especial para mamãe",
    description: "Kit com caixa de brigadeiros, flores e cartão personalizado para o Dia das Mães.",
    price: 119.9,
    features: ["Brigadeiros gourmet", "Flores naturais", "Cartão personalizado"],
    isFeatured: true,
    image: IMG.anjoBranco,
  }),
  product({
    categoryId: CATEGORIES.presentes,
    name: "Presente Namorados",
    slug: "presente-namorados",
    shortDescription: "Caixa romântica para casais",
    description:
      "Caixa temática com brigadeiros em tons românticos, acompanhada de um mimo especial.",
    price: 99.9,
    features: ["Brigadeiros rosé", "Mimo incluso", "Embalagem romântica"],
    isFeatured: false,
    image: IMG.angelClose,
  }),
  product({
    categoryId: CATEGORIES.presentes,
    name: "Estrela Dourada",
    slug: "estrela-dourada",
    shortDescription: "Presente delicado e sofisticado",
    description: "Brigadeiros com acabamento dourado e embalagem delicada para presentear.",
    price: 89.9,
    features: ["Acabamento dourado", "Embalagem delicada"],
    isFeatured: false,
    image: IMG.estrelaDourada,
  }),
  product({
    categoryId: CATEGORIES.ocasoes,
    name: "Casamento — Mesa de Doces",
    slug: "casamento-mesa-de-doces",
    shortDescription: "Service completo para casamentos",
    description:
      "Mesa de brigadeiros personalizada para casamento. A partir de 100 unidades, com montagem e decoração.",
    price: 3.5,
    features: ["A partir de 100un", "Personalização completa", "Montagem inclusa"],
    isFeatured: true,
    image: IMG.verdeDourado,
  }),
  product({
    categoryId: CATEGORIES.ocasoes,
    name: "Chá de Bebê",
    slug: "cha-de-bebe",
    shortDescription: "Mesa de doces para o chá",
    description: "Pacote completo com mesa de brigadeiros e decoração temática para o chá de bebê.",
    price: 199.9,
    features: ["50 brigadeiros", "Decoração inclusa", "Mesa temática"],
    isFeatured: false,
    image: IMG.religioso,
  }),
  product({
    categoryId: CATEGORIES.ocasoes,
    name: "Empresas e Eventos",
    slug: "empresas-e-eventos",
    shortDescription: "Coffee break corporativo",
    description:
      "Service de brigadeiros para empresas, coffee breaks, lançamentos e eventos corporativos.",
    price: 4.0,
    features: ["Pedido mínimo 50un", "Entrega programada"],
    isFeatured: false,
    image: IMG.variedadesVerdes,
  }),
];

export const MOCK_CATALOG: CatalogData = {
  categories: [
    {
      id: CATEGORIES.brigadeiros,
      name: "Brigadeiros",
      slug: "brigadeiros",
      icon: "🍫",
      display_order: 1,
    },
    {
      id: CATEGORIES.personalizados,
      name: "Personalizados",
      slug: "personalizados",
      icon: "🎀",
      display_order: 2,
    },
    { id: CATEGORIES.caixas, name: "Caixas", slug: "caixas", icon: "📦", display_order: 3 },
    {
      id: CATEGORIES.presentes,
      name: "Presentes",
      slug: "presentes",
      icon: "🎁",
      display_order: 4,
    },
    { id: CATEGORIES.ocasoes, name: "Ocasiões", slug: "ocasoes", icon: "🎉", display_order: 5 },
  ],
  products: PRODUCTS,
  settings: {
    business_name: "Estrela Gourmet",
    whatsapp_number: "5567999438984",
    instagram_url: "https://instagram.com/estrelagourmet",
    contact_info: "Feitos com amor em Vicentina/MS",
    order_info:
      "Encomendas com 2 dias de antecedência. Retirada e entrega combinadas pelo WhatsApp.",
    logo_url: null,
    hero_images: [
      "/assets/01-home/hero-principal-brigadeiros-caramelo-florais.jpg",
      "/assets/01-home/hero-alternativo-brigadeiros-chocolate.jpg",
      IMG.aliceConjunto,
      IMG.caixaSortidos,
      "/assets/03-personalizados/stitch-com-brigadeiros-variados.jpg",
    ],
    hero_title: "Pequenos detalhes, grandes momentos",
    hero_subtitle: "Brigadeiros que tornam a vida mais doce.",
  },
};

export function findMockProduct(slug: string): Product | null {
  return MOCK_CATALOG.products.find((item) => item.slug === slug) ?? null;
}
