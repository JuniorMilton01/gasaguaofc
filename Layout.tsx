import { useState } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  DollarSign, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  Flame,
  Droplets,
  User,
  TrendingDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Usuario } from '@/types';

type Tela = 'dashboard' | 'vendas' | 'estoque' | 'clientes' | 'caixa' | 'despesas' | 'relatorios' | 'configuracoes';

interface LayoutProps {
  usuario: Usuario;
  onLogout: () => void;
  children: React.ReactNode;
  telaAtual: Tela;
  onTelaChange: (tela: Tela) => void;
}

const menuItems = [
  { id: 'dashboard' as Tela, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'vendas' as Tela, label: 'Vendas (PDV)', icon: ShoppingCart },
  { id: 'estoque' as Tela, label: 'Estoque', icon: Package },
  { id: 'clientes' as Tela, label: 'Clientes', icon: Users },
  { id: 'caixa' as Tela, label: 'Caixa', icon: DollarSign },
  { id: 'despesas' as Tela, label: 'Despesas', icon: TrendingDown },
  { id: 'relatorios' as Tela, label: 'Relatórios', icon: FileText },
  { id: 'configuracoes' as Tela, label: 'Configurações', icon: Settings },
];

export function Layout({ usuario, onLogout, children, telaAtual, onTelaChange }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const MenuContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-4 border-b">
        <div className="flex gap-2">
          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <Droplets className="w-5 h-5 text-white" />
          </div>
        </div>
        <span className="text-xl font-bold">GasAgua Pro</span>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                onTelaChange(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                telaAtual === item.id
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t space-y-4">
        <div className="flex items-center gap-3 px-4">
          <Avatar>
            <AvatarFallback className="bg-blue-100 text-blue-700">
              <User className="w-5 h-5" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{usuario.nome}</p>
            <p className="text-sm text-gray-500 capitalize">{usuario.perfil}</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="w-full flex items-center gap-2"
          onClick={onLogout}
        >
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-64 bg-white border-r flex-col fixed h-full">
        <MenuContent />
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b z-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <Flame className="w-4 h-4 text-white" />
            </div>
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Droplets className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold">GasAgua Pro</span>
          </div>
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <MenuContent />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
