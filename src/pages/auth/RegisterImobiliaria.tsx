import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import logo from '@/assets/logo-principal.png';
import barraTijucaBg from '@/assets/barra-tijuca-bg.jpg';

const registerSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
  nome_empresa: z.string().min(2, 'Nome da empresa é obrigatório'),
  creci: z.string().min(4, 'CRECI inválido'),
  telefone: z.string().optional(),
  email_contato: z.string().email('E-mail de contato inválido').optional().or(z.literal('')),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

export default function RegisterImobiliaria() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nome_empresa: '',
    creci: '',
    telefone: '',
    email_contato: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .substring(0, 15);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'telefone') {
      setFormData(prev => ({ ...prev, [name]: formatPhone(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validation = registerSchema.safeParse(formData);
      if (!validation.success) {
        toast({
          title: 'Erro de validação',
          description: validation.error.errors[0].message,
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      const { error } = await signUp(formData.email, formData.password, 'imobiliaria', {
        nome_empresa: formData.nome_empresa,
        creci: formData.creci,
        telefone: formData.telefone.replace(/\D/g, '') || undefined,
        email_contato: formData.email_contato || undefined,
      });

      if (error) {
        let message = 'Erro ao criar conta';
        if (error.message.includes('already registered')) {
          message = 'Este e-mail já está cadastrado';
        }
        toast({
          title: 'Erro',
          description: message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Conta criada!',
          description: 'Verifique seu e-mail para confirmar o cadastro.',
        });
        navigate('/auth/login');
      }
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro inesperado',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="flex min-h-screen flex-col items-center justify-center px-4 py-8 relative"
      style={{
        backgroundImage: `url(${barraTijucaBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center">
          <img src={logo} alt="Logo" className="mx-auto h-16" />
          <h1 className="mt-6 text-3xl font-bold text-primary">Cadastro Imobiliária</h1>
          <p className="mt-2 text-muted-foreground">
            Cadastre sua imobiliária para divulgar imóveis
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6 rounded-xl bg-white p-8 shadow-elegant">
          <div className="space-y-4">
            <div>
              <Label htmlFor="nome_empresa">Nome da Imobiliária</Label>
              <Input
                id="nome_empresa"
                name="nome_empresa"
                value={formData.nome_empresa}
                onChange={handleChange}
                placeholder="Imobiliária XYZ"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="creci">CRECI</Label>
              <Input
                id="creci"
                name="creci"
                value={formData.creci}
                onChange={handleChange}
                placeholder="12345-J"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="telefone">Telefone/WhatsApp (opcional)</Label>
              <Input
                id="telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                placeholder="(21) 99999-9999"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email_contato">E-mail de Contato (opcional)</Label>
              <Input
                id="email_contato"
                name="email_contato"
                type="email"
                value={formData.email_contato}
                onChange={handleChange}
                placeholder="contato@imobiliaria.com"
                className="mt-1"
              />
            </div>
            <hr className="my-4" />
            <div>
              <Label htmlFor="email">E-mail de Acesso</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="mt-1"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Criando conta...' : 'Criar Conta'}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Já tem uma conta?{' '}
            <Link to="/auth/login" className="font-medium text-primary hover:text-primary/80">
              Faça login
            </Link>
          </p>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          <Link to="/auth/register/construtora" className="hover:text-primary">
            ← Sou construtora
          </Link>
        </p>
      </div>
    </div>
  );
}
