export interface Pedido {
    codigoPedido: string;
    cliente: string;
    erro?: string | "Erro desconhecido";
    plataforma?: string | "Plataforma desconhecida";
    status: number; 
}