import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Produto } from '../models/produto.model';
import { ProdutoDTO } from '../models/produto-dto.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProdutoService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProdutosComErro(): Observable<Produto[]> {
    return this.http.get<Produto[]>(`${this.baseUrl}/produtos`);
  }

  registrarProduto(data: ProdutoDTO): Observable<ProdutoDTO> {
    return this.http.post<ProdutoDTO>(`${this.baseUrl}/produtos`, data);
  }

  atualizarProduto(data: ProdutoDTO): Observable<Produto> {
    return this.http.patch<Produto>(`${this.baseUrl}/produtos`, data);
  }
}
