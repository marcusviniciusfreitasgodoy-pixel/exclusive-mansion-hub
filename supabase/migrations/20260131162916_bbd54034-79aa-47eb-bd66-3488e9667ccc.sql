-- Adicionar campos de contato na tabela construtoras
ALTER TABLE public.construtoras 
ADD COLUMN IF NOT EXISTS email_contato TEXT,
ADD COLUMN IF NOT EXISTS telefone TEXT;

-- Atualizar a construtora existente com os dados de contato
UPDATE public.construtoras 
SET email_contato = 'contato@godoyprime.com.br',
    telefone = '5521964075124'
WHERE nome_empresa = 'Godoy Prime Construtora';