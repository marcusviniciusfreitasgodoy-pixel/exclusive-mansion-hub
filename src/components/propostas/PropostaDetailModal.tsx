import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ExternalLink } from 'lucide-react';

export interface PropostaWithDetails {
  id: string;
  codigo: string;
  nome_completo: string;
  cpf_cnpj: string;
  telefone: string;
  email: string | null;
  endereco_resumido: string | null;
  unidade: string | null;
  matricula: string | null;
  valor_ofertado: number | null;
  moeda: string | null;
  sinal_entrada: string | null;
  parcelas: string | null;
  financiamento: string | null;
  outras_condicoes: string | null;
  validade_proposta: string | null;
  forma_aceite: string | null;
  assinatura_proponente: string | null;
  cnh_url: string | null;
  status: string | null;
  created_at: string | null;
  imovel?: { id: string; titulo: string } | null;
  imobiliaria?: { id: string; nome_empresa: string } | null;
}

const formatBRL = (value: number | null) => {
  if (!value) return '-';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const formatDate = (date: string | null) => {
  if (!date) return '-';
  return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
};

export const StatusBadgeProposta = ({ status }: { status: string | null }) => {
  const config: Record<string, { label: string; className: string }> = {
    pendente: { label: '⏳ Pendente', className: 'border-yellow-500 text-yellow-700 bg-yellow-50' },
    aceita: { label: '✅ Aceita', className: 'border-green-500 text-green-700 bg-green-50' },
    recusada: { label: '❌ Recusada', className: 'border-red-500 text-red-700 bg-red-50' },
    expirada: { label: '⏰ Expirada', className: 'border-gray-500 text-gray-700 bg-gray-50' },
  };
  const { label, className } = config[status || 'pendente'] || config.pendente;
  return <Badge variant="outline" className={className}>{label}</Badge>;
};

interface Props {
  open: boolean;
  onClose: () => void;
  proposta: PropostaWithDetails | null;
}

export function PropostaDetailModal({ open, onClose, proposta }: Props) {
  if (!proposta) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Proposta #{proposta.codigo}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header */}
          <div className="bg-muted p-4 rounded-lg flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{proposta.imovel?.titulo || 'Imóvel não informado'}</h3>
              <p className="text-sm text-muted-foreground">
                Criada em {formatDate(proposta.created_at)}
              </p>
              {proposta.imobiliaria && (
                <p className="text-sm text-muted-foreground">
                  Imobiliária: {proposta.imobiliaria.nome_empresa}
                </p>
              )}
            </div>
            <StatusBadgeProposta status={proposta.status} />
          </div>

          {/* Dados Pessoais */}
          <div>
            <h4 className="font-semibold mb-3">Dados do Proponente</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Nome</span>
                <p className="font-medium">{proposta.nome_completo}</p>
              </div>
              <div>
                <span className="text-muted-foreground">CPF/CNPJ</span>
                <p className="font-medium">{proposta.cpf_cnpj}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Telefone</span>
                <p className="font-medium">{proposta.telefone}</p>
              </div>
              <div>
                <span className="text-muted-foreground">E-mail</span>
                <p className="font-medium">{proposta.email || '-'}</p>
              </div>
              {proposta.endereco_resumido && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Endereço</span>
                  <p className="font-medium">{proposta.endereco_resumido}</p>
                </div>
              )}
            </div>
          </div>

          {/* Valores */}
          <div>
            <h4 className="font-semibold mb-3">Condições da Proposta</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Valor Ofertado</span>
                <p className="font-medium text-lg">{formatBRL(proposta.valor_ofertado)}</p>
              </div>
              {proposta.unidade && (
                <div>
                  <span className="text-muted-foreground">Unidade</span>
                  <p className="font-medium">{proposta.unidade}</p>
                </div>
              )}
              {proposta.sinal_entrada && (
                <div>
                  <span className="text-muted-foreground">Sinal / Entrada</span>
                  <p className="font-medium">{proposta.sinal_entrada}</p>
                </div>
              )}
              {proposta.parcelas && (
                <div>
                  <span className="text-muted-foreground">Parcelas</span>
                  <p className="font-medium">{proposta.parcelas}</p>
                </div>
              )}
              {proposta.financiamento && (
                <div>
                  <span className="text-muted-foreground">Financiamento</span>
                  <p className="font-medium">{proposta.financiamento}</p>
                </div>
              )}
              {proposta.validade_proposta && (
                <div>
                  <span className="text-muted-foreground">Validade</span>
                  <p className="font-medium">{proposta.validade_proposta}</p>
                </div>
              )}
              {proposta.outras_condicoes && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Outras Condições</span>
                  <p className="font-medium">{proposta.outras_condicoes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Assinatura */}
          {proposta.assinatura_proponente && (
            <div>
              <h4 className="font-semibold mb-3">Assinatura Digital</h4>
              <div className="border rounded-lg p-4 bg-white">
                <img
                  src={proposta.assinatura_proponente}
                  alt="Assinatura do proponente"
                  className="max-h-24 mx-auto"
                />
              </div>
            </div>
          )}

          {/* CNH */}
          {proposta.cnh_url && (
            <div>
              <h4 className="font-semibold mb-3">Documento (CNH)</h4>
              <a
                href={proposta.cnh_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
              >
                <ExternalLink className="h-4 w-4" />
                Abrir documento
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
