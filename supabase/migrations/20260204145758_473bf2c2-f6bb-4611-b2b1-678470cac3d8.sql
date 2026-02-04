-- Adicionar campo para materiais promocionais
ALTER TABLE imoveis 
ADD COLUMN IF NOT EXISTS materiais_promocionais JSONB DEFAULT '{}';

-- Criar índice para performance em buscas
CREATE INDEX IF NOT EXISTS idx_imoveis_materiais 
ON imoveis USING GIN (materiais_promocionais);

-- Comment explaining the structure
COMMENT ON COLUMN imoveis.materiais_promocionais IS 'JSON structure: { bookDigital: {url, nome, tipo}, estudoRentabilidade: {url, nome, tipo}, tabelaVendas: {url, nome, tipo}, plantaUnidade: {url, nome, tipo}, personalizacao: [{titulo, disponivel}], seguranca: string[], sustentabilidade: string[], infraestrutura: string[] }';