import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pedido } from '../models/pedido.model';
import { PedidoDTO } from '../models/pedido-dto.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getPendentes(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.baseUrl}/pendentes`);
  }

  registrarPedido(data: PedidoDTO): Observable<Pedido> {
    return this.http.post<Pedido>(`${this.baseUrl}/pendentes`, data);
  }

  atualizarPedido(data: PedidoDTO): Observable<Pedido> {
    return this.http.patch<Pedido>(`${this.baseUrl}/pendentes`, data);
  }
}