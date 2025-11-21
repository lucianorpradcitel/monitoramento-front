export interface PedidoDTO {
    codigoPedido: string;
    cliente: string;
    erro?: string ;
    plataforma?: string;
    status: number; 
}