-- Adicionar novos campos à tabela imoveis para suportar layout Sotheby's
ALTER TABLE public.imoveis ADD COLUMN IF NOT EXISTS listing_code TEXT;
ALTER TABLE public.imoveis ADD COLUMN IF NOT EXISTS property_type TEXT;
ALTER TABLE public.imoveis ADD COLUMN IF NOT EXISTS year_built INTEGER;
ALTER TABLE public.imoveis ADD COLUMN IF NOT EXISTS lot_size DECIMAL(15,2);
ALTER TABLE public.imoveis ADD COLUMN IF NOT EXISTS lot_size_unit TEXT DEFAULT 'm²';
ALTER TABLE public.imoveis ADD COLUMN IF NOT EXISTS parking_spaces INTEGER;
ALTER TABLE public.imoveis ADD COLUMN IF NOT EXISTS features_interior JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.imoveis ADD COLUMN IF NOT EXISTS features_exterior JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.imoveis ADD COLUMN IF NOT EXISTS amenities JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.imoveis ADD COLUMN IF NOT EXISTS headline TEXT;
ALTER TABLE public.imoveis ADD COLUMN IF NOT EXISTS price_secondary DECIMAL(15,2);
ALTER TABLE public.imoveis ADD COLUMN IF NOT EXISTS price_secondary_currency TEXT DEFAULT 'USD';
ALTER TABLE public.imoveis ADD COLUMN IF NOT EXISTS price_on_request BOOLEAN DEFAULT FALSE;
ALTER TABLE public.imoveis ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8);
ALTER TABLE public.imoveis ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8);
ALTER TABLE public.imoveis ADD COLUMN IF NOT EXISTS cep TEXT;
ALTER TABLE public.imoveis ADD COLUMN IF NOT EXISTS condicoes_pagamento TEXT;