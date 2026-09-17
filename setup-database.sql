-- ============================================
-- ESTRELA GOURMET - Setup do Banco de Dados
-- Cole este código no SQL Editor do Supabase
-- ============================================

-- Criar enum de roles
DO $$ BEGIN
  CREATE TYPE app_role AS ENUM ('admin', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Tabela de categorias
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL DEFAULT '🎂',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(10,2),
  features TEXT[] DEFAULT '{}',
  is_available BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de imagens dos produtos
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de variações dos produtos
CREATE TABLE IF NOT EXISTS product_variations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC(10,2),
  is_available BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de configurações do site
CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  business_name TEXT NOT NULL DEFAULT 'Estrela Gourmet',
  whatsapp_number TEXT NOT NULL DEFAULT '5500000000000',
  instagram_url TEXT NOT NULL DEFAULT '',
  contact_info TEXT NOT NULL DEFAULT '',
  order_info TEXT NOT NULL DEFAULT '',
  logo_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de perfis
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de roles
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variations_product ON product_variations(product_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);

-- ============================================
-- DADOS DE EXEMPLO
-- ============================================

-- Limpar dados anteriores (se houver)
DELETE FROM product_variations;
DELETE FROM product_images;
DELETE FROM products;
DELETE FROM categories;

-- Categorias
INSERT INTO categories (name, slug, icon, display_order) VALUES
('Brigadeiros', 'brigadeiros', '🍫', 1),
('Personalizados', 'personalizados', '🎀', 2),
('Caixas', 'caixas', '📦', 3),
('Presentes', 'presentes', '🎁', 4),
('Ocasiões', 'ocasoes', '🎉', 5);

-- Produtos - Brigadeiros
INSERT INTO products (category_id, name, slug, short_description, description, price, features, is_featured, display_order) VALUES
((SELECT id FROM categories WHERE slug='brigadeiros'), 'Brigadeiro Tradicional', 'brigadeiro-tradicional', 'O clássico brigadeiro cremoso', 'Nosso brigadeiro tradicional é feito com chocolate belga de alta qualidade, leite condensado artesanal e manteiga fresca. Cada um é enrolado à mão e coberto com granulado especial.', 4.50, ARRAY['Chocolate belga', 'Enrolado à mão', 'Granulado especial'], true, 1),
((SELECT id FROM categories WHERE slug='brigadeiros'), 'Brigadeiro de Morango', 'brigadeiro-morango', 'Brigadeiro sabor morango', 'Um brigadeiro suave com sabor natural de morango, feito com frutas frescas selecionadas.', 5.00, ARRAY['Frutas frescas', 'Cobertura especial'], false, 2),
((SELECT id FROM categories WHERE slug='brigadeiros'), 'Brigadeiro Premium', 'brigadeiro-premium', 'Chocolate 70% cacau', 'Para os verdadeiros apreciadores de chocolate. Feito com cacau 70% importado e toque de flor de sal.', 6.50, ARRAY['Cacau 70%', 'Flor de sal', 'Edição limitada'], true, 3),
((SELECT id FROM categories WHERE slug='brigadeiros'), 'Brigadeiro de Nutella', 'brigadeiro-nutella', 'Recheio generoso de Nutella', 'Um brigadeiro irresistível com centro cremoso de Nutella genuína.', 6.00, ARRAY['Nutella genuína', 'Recheio cremoso'], false, 4),
((SELECT id FROM categories WHERE slug='brigadeiros'), 'Beijinho', 'beijinho', 'Coco e leite condensado', 'O clássico beijinho de coco, cremoso e delicioso.', 4.00, ARRAY['Coco natural', 'Cobertura de coco'], false, 5);

-- Produtos - Personalizados
INSERT INTO products (category_id, name, slug, short_description, description, price, features, is_featured, display_order) VALUES
((SELECT id FROM categories WHERE slug='personalizados'), 'Kit Personalizado 20 unidades', 'kit-personalizado-20', 'Escolha até 4 sabores', 'Monte seu kit com até 4 sabores diferentes. Perfeito para festas e eventos.', 89.90, ARRAY['4 sabores', 'Embalagem personalizada', 'Fita e adesivo'], true, 1),
((SELECT id FROM categories WHERE slug='personalizados'), 'Kit Personalizado 40 unidades', 'kit-personalizado-40', 'Escolha até 6 sabores', 'Kit completo para festas maiores. Escolha até 6 sabores e personalise a embalagem.', 169.90, ARRAY['6 sabores', 'Embalagem premium', 'Cartão de mensagem'], false, 2),
((SELECT id FROM categories WHERE slug='personalizados'), 'Brigadeiro com Logo', 'brigadeiro-com-logo', 'Impressão de logo em chocolate', 'Brigadeiros com sua logo impressa em chocolate branco. Ideal para empresas e eventos corporativos.', 8.00, ARRAY['Logo personalizada', 'Chocolate branco', 'Pedido mínimo 30un'], false, 3);

-- Produtos - Caixas
INSERT INTO products (category_id, name, slug, short_description, description, price, features, is_featured, display_order) VALUES
((SELECT id FROM categories WHERE slug='caixas'), 'Caixa Amor', 'caixa-amor', '12 brigadeiros premium', 'Caixa temática com 12 brigadeiros premium Selection. Perfeito para presente de amor.', 79.90, ARRAY['12 brigadeiros premium', 'Caixa temática', 'Fita de cetim'], true, 1),
((SELECT id FROM categories WHERE slug='caixas'), 'Caixa Festa', 'caixa-festa', '24 brigadeiros variados', 'Caixa com 24 brigadeiros em sabores variados. Ideal para festas e confraternizações.', 129.90, ARRAY['24 brigadeiros', 'Sabores variados', 'Caixa decorada'], false, 2),
((SELECT id FROM categories WHERE slug='caixas'), 'Caixa Luxo', 'caixa-luxo', '18 brigadeiros gourmet', 'Nossa caixa mais premium com 18 brigadeiros gourmet selectionados.', 159.90, ARRAY['18 gourmet', 'Caixa de madeira', 'Certificado de autenticidade'], true, 3);

-- Produtos - Presentes
INSERT INTO products (category_id, name, slug, short_description, description, price, features, is_featured, display_order) VALUES
((SELECT id FROM categories WHERE slug='presentes'), 'Presente Dia das Mães', 'presente-dia-das-maes', 'Kit especial para mamãe', 'Kit com caixa de brigadeiros, flores e cartão personalizado para o Dia das Mães.', 119.90, ARRAY['Brigadeiros gourmet', 'Flores naturais', 'Cartão personalizado'], true, 1),
((SELECT id FROM categories WHERE slug='presentes'), 'Presente Namorados', 'presente-namorados', 'Caixa romântica para casais', 'Caixa temática com brigadeiros de morango e rosa, acompanhada de pelúcia.', 99.90, ARRAY['Brigadeiros rosa', 'Pelúcia inclusa', 'Embalagem romântica'], false, 2),
((SELECT id FROM categories WHERE slug='presentes'), 'Presente Aniversário', 'presente-aniversario', 'Surpresa doce personalizada', 'Caixa com brigadeiros personalizados com a idade do aniversariante.', 89.90, ARRAY['Número personalizado', 'Vela inclusa', 'Cartão de aniversário'], false, 3);

-- Produtos - Ocasiões
INSERT INTO products (category_id, name, slug, short_description, description, price, features, is_featured, display_order) VALUES
((SELECT id FROM categories WHERE slug='ocasoes'), 'Casamento - Buffet', 'casamento-buffet', 'Service para casamentos', 'Buffet de brigadeiros para casamento. A partir de 100 unidades com personalização total.', 3.50, ARRAY['A partir de 100un', 'Personalização total', 'Entrega e montagem'], true, 1),
((SELECT id FROM categories WHERE slug='ocasoes'), 'Chaá de Bebê', 'cha-bebe', 'Mesa de doces para o chá', 'Pacote completo para chá de bebê com mesa de brigadeiros e decoração.', 199.90, ARRAY['50 brigadeiros', 'Decoração inclusa', 'Mesa temática'], false, 2),
((SELECT id FROM categories WHERE slug='ocasoes'), 'Empresas e Eventos', 'empresas-eventos', 'Coffee break corporativo', 'Service de brigadeiros para empresas. Coffee break, lançamentos e eventos corporativos.', 4.00, ARRAY['Pedido mínimo 50un', 'Branding personalizado', 'Entrega programada'], false, 3);

-- Variações de produto
INSERT INTO product_variations (product_id, name, price, display_order) VALUES
((SELECT id FROM products WHERE slug='brigadeiro-tradicional'), 'Unidade', 4.50, 1),
((SELECT id FROM products WHERE slug='brigadeiro-tradicional'), 'Caixa c/10', 40.00, 2),
((SELECT id FROM products WHERE slug='brigadeiro-premium'), 'Unidade', 6.50, 1),
((SELECT id FROM products WHERE slug='brigadeiro-premium'), 'Caixa c/10', 58.00, 2),
((SELECT id FROM products WHERE slug='caixa-amor'), 'Caixa c/12', 79.90, 1),
((SELECT id FROM products WHERE slug='caixa-amor'), 'Caixa c/24', 149.90, 2);

-- Configurações do site
INSERT INTO site_settings (id, business_name, whatsapp_number, instagram_url, contact_info, order_info) VALUES
(1, 'Estrela Gourmet', '5511999999999', '@estrelagourmet', 'Vicentina - RJ', 'Encomendas com até 3 dias de antecedência')
ON CONFLICT (id) DO UPDATE SET
  business_name = EXCLUDED.business_name,
  whatsapp_number = EXCLUDED.whatsapp_number;
