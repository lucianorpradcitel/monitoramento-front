import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidoService } from '../../core/services/pedido.service';
import { ProdutoService } from '../../core/services/produto.service';
import { Pedido } from '../../core/models/pedido.model';
import { Produto } from '../../core/models/produto.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  activeTab = signal<string>('pedidos');
  loading = signal<boolean>(true);
  
  pedidosErroCount = signal<number>(0);
  produtosErroCount = signal<number>(0);
  
  pedidosComErro = signal<Pedido[]>([]);
  produtosComErro = signal<Produto[]>([]);

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

  carregarDados() {
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

  setActiveTab(tab: string) {
    this.activeTab.set(tab);
  }

  refresh() {
    console.log('[DASHBOARD] Atualização manual');
    this.carregarDados();
  }
}