import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Produto } from '../models/produto.model';
import { ProdutoDTO } from '../models/produto-dto.model';
import { environment } from '../../../environments/environment';
import { Pontuacao } from '../models/pontuacao.model';
import { PontuacaoDTO } from '../models/pontuacao-dto.model';

@Injectable({
  providedIn: 'root'
})
export class PontuacaoService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getPontuacaoComErro(): Observable<Pontuacao[]> {
    return this.http.get<Pontuacao[]>(`${this.baseUrl}/pontuacao/ponpee`);
  }

  registrarPontuacao(data: PontuacaoDTO): Observable<PontuacaoDTO> {
    return this.http.post<PontuacaoDTO>(`${this.baseUrl}/pontuacao/ponpee`, data);
  }

  atualizarPontuacao(data: PontuacaoDTO): Observable<PontuacaoDTO> {
    return this.http.patch<PontuacaoDTO>(`${this.baseUrl}/pontuacao/ponpee`, data);
  }
}
