import { Component, OnInit, OnDestroy, signal, computed, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidoService } from '../../core/services/pedido.service';
import { ProdutoService } from '../../core/services/produto.service';
import { Pedido } from '../../core/models/pedido.model';
import { Produto } from '../../core/models/produto.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Estado das abas
  activeTab = signal<string>('pedidos');
  loading = signal<boolean>(true);
  
  // Contadores
  pedidosErroCount = signal<number>(0);
  produtosErroCount = signal<number>(0);
  
  // Dados
  pedidosComErro = signal<Pedido[]>([]);
  produtosComErro = signal<Produto[]>([]);

  // Filtros
  filtroCodigo = signal<string>('');
  filtroCliente = signal<string>('');
  filtroPlataforma = signal<string>('');
  filtroErro = signal<string>('');

  // Lista de clientes únicos para o dropdown (baseado na aba ativa)
  clientesUnicos = computed(() => {
    const dados = this.activeTab() === 'pedidos' 
      ? this.pedidosComErro() 
      : this.produtosComErro();
    
    const clientes = new Set(dados.map(item => item.cliente));
    return Array.from(clientes).sort();
  });

  // Lista de plataformas únicas para o dropdown (baseado na aba ativa)
  plataformasUnicas = computed(() => {
    const dados = this.activeTab() === 'pedidos' 
      ? this.pedidosComErro() 
      : this.produtosComErro();
    
    const plataformas = new Set(
      dados
        .map(item => item.plataforma)
        .filter((p): p is string => p !== undefined && p !== null)
    );
    return Array.from(plataformas).sort();
  });

  // Pedidos filtrados
  pedidosFiltrados = computed(() => {
    let resultado = this.pedidosComErro();
    
    const codigo = this.normalizeText(this.filtroCodigo());
    const cliente = this.filtroCliente();
    const plataforma = this.filtroPlataforma();
    const erro = this.normalizeText(this.filtroErro());
    
    if (codigo) {
      resultado = resultado.filter(p => 
        this.normalizeText(p.codigoPedido).includes(codigo)
      );
    }
    
    if (cliente) {
      resultado = resultado.filter(p => p.cliente === cliente);
    }
    
    if (plataforma) {
      resultado = resultado.filter(p => p.plataforma === plataforma);
    }
    
    if (erro) {
      resultado = resultado.filter(p => 
        this.normalizeText(p.erro || '').includes(erro)
      );
    }
    
    return resultado;
  });

  // Produtos filtrados
  produtosFiltrados = computed(() => {
    let resultado = this.produtosComErro();
    
    const codigo = this.normalizeText(this.filtroCodigo());
    const cliente = this.filtroCliente();
    const plataforma = this.filtroPlataforma();
    const erro = this.normalizeText(this.filtroErro());
    
    if (codigo) {
      resultado = resultado.filter(p => 
        this.normalizeText(p.codigoProduto).includes(codigo)
      );
    }
    
    if (cliente) {
      resultado = resultado.filter(p => p.cliente === cliente);
    }
    
    if (plataforma) {
      resultado = resultado.filter(p => p.plataforma === plataforma);
    }
    
    if (erro) {
      resultado = resultado.filter(p => 
        this.normalizeText(p.erro || '').includes(erro)
      );
    }
    
    return resultado;
  });

  // Contadores de itens visíveis
  pedidosVisiveis = computed(() => this.pedidosFiltrados().length);
  produtosVisiveis = computed(() => this.produtosFiltrados().length);

  private intervalId: any;

  constructor(
    private pedidoService: PedidoService,
    private produtoService: ProdutoService
  ) {}

  ngOnInit(): void {
    console.log('[DASHBOARD] Inicializando');
    this.carregarDados();
    
    // Atualiza a cada 10 segundos
    
    this.intervalId = setInterval(() => {
      console.log('[DASHBOARD] Atualizando dados automaticamente...');
      this.carregarDados();
    }, 10000);
    
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  carregarDados(): void {
    this.loading.set(true);
    
    this.pedidoService.getPendentes().subscribe({
      next: (pedidos: Pedido[]) => {
        console.log('[DASHBOARD] Pedidos carregados:', pedidos);
        this.pedidosComErro.set(pedidos);
        this.pedidosErroCount.set(pedidos.length);
      },
      error: err => {
        console.error('[DASHBOARD] Erro ao carregar pedidos', err);
        this.pedidosComErro.set([]);
        this.pedidosErroCount.set(0);
      }
    });

    this.produtoService.getProdutosComErro().subscribe({
      next: (produtos: Produto[]) => {
        console.log('[DASHBOARD] Produtos carregados:', produtos);
        this.produtosComErro.set(produtos);
        this.produtosErroCount.set(produtos.length);
      },
      error: err => {
        console.error('[DASHBOARD] Erro ao carregar produtos', err);
        this.produtosComErro.set([]);
        this.produtosErroCount.set(0);
      },
      complete: () => this.loading.set(false)
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab.set(tab);
    this.limparFiltros();
  }

  limparFiltros(): void {
    this.filtroCodigo.set('');
    this.filtroCliente.set('');
    this.filtroPlataforma.set('');
    this.filtroErro.set('');
  }

  // Função para normalizar texto (remove acentos e converte para minúsculo)
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  // Métodos para atualizar filtros (usados com ngModel)
  onFiltroCodigoChange(value: string): void {
    this.filtroCodigo.set(value);
  }

  onFiltroClienteChange(value: string): void {
    this.filtroCliente.set(value);
  }

  onFiltroPlataformaChange(value: string): void {
    this.filtroPlataforma.set(value);
  }

  onFiltroErroChange(value: string): void {
    this.filtroErro.set(value);
  }
}
