<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pedido;
use App\Models\Configuracao;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ImpressaoController extends Controller
{
    /**
     * ✅ IMPRIMIR PEDIDO - FORMATO TERMICA (58mm)
     */
    public function imprimirPedidoTermica($id)
    {
        try {
            $pedido = Pedido::with(['itens.produto', 'mesa'])->find($id);
            
            if (!$pedido) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pedido não encontrado'
                ], 404);
            }

            $config = Configuracao::getConfig();
            
            $conteudo = $this->gerarConteudoTermica58mm($pedido, $config);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'pedido' => $pedido,
                    'conteudo_impressao' => $conteudo,
                    'config' => $config
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erro em ImpressaoController::imprimirPedidoTermica: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao gerar impressão'
            ], 500);
        }
    }

    /**
     * ✅ IMPRIMIR PEDIDO - FORMATO COMPACTO (80mm)
     */
    public function imprimirPedidoCompacto($id)
    {
        try {
            $pedido = Pedido::with(['itens.produto', 'mesa'])->find($id);
            
            if (!$pedido) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pedido não encontrado'
                ], 404);
            }

            $config = Configuracao::getConfig();
            
            $conteudo = $this->gerarConteudoCompacto80mm($pedido, $config);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'pedido' => $pedido,
                    'conteudo_impressao' => $conteudo,
                    'config' => $config
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erro em ImpressaoController::imprimirPedidoCompacto: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao gerar impressão'
            ], 500);
        }
    }

    /**
     * ✅ IMPRIMIR RELATÓRIO - FORMATO A4
     */
    public function imprimirRelatorio(Request $request)
    {
        // Para relatórios diários, etc.
    }

    /**
     * 🖨️ GERAR CONTEÚDO PARA IMPRESSORA TÉRMICA 58mm
     */
    private function gerarConteudoTermica58mm($pedido, $config)
    {
        $empresa = $config->nome_estabelecimento ?: "JETRO'S LANCHES";
        $telefone = $config->telefone ?: "";
        
        $conteudo = "
<style>
body { font-family: 'Courier New', monospace; margin: 0; padding: 2mm; font-size: 9px; line-height: 1.2; width: 58mm; }
.header { text-align: center; margin-bottom: 3mm; border-bottom: 1px dashed #000; padding-bottom: 2mm; }
.empresa { font-weight: bold; font-size: 11px; margin-bottom: 1mm; }
.titulo { font-size: 10px; margin: 2mm 0; }
.info { margin-bottom: 3mm; font-size: 8px; }
.info-line { display: flex; justify-content: space-between; margin: 1mm 0; }
.itens { width: 100%; border-collapse: collapse; margin: 2mm 0; font-size: 8px; }
.itens th, .itens td { padding: 1mm; text-align: left; border-bottom: 1px dashed #ddd; }
.itens th { border-bottom: 1px solid #000; }
.item-nome { width: 60%; }
.item-qtd { width: 15%; text-align: center; }
.item-preco { width: 25%; text-align: right; }
.observacoes { font-style: italic; font-size: 7px; color: #666; margin-top: 0.5mm; }
.total { font-weight: bold; font-size: 10px; margin-top: 3mm; border-top: 2px solid #000; padding-top: 2mm; text-align: center; }
.footer { text-align: center; margin-top: 4mm; font-size: 7px; color: #666; border-top: 1px dashed #000; padding-top: 2mm; }
.linha-divisoria { border-top: 1px dashed #000; margin: 2mm 0; }
@media print { body { margin: 0; padding: 2mm; } .no-print { display: none; } }
</style>

<div class='header'>
    <div class='empresa'>{$empresa}</div>
    <div class='titulo'>PEDIDO #{$pedido->id}</div>
</div>

<div class='info'>
    <div class='info-line'>
        <span><strong>Mesa:</strong> " . ($pedido->mesa->numero ?? $pedido->mesa_id) . "</span>
        <span><strong>Data:</strong> " . $pedido->created_at->format('d/m/Y') . "</span>
    </div>
    <div class='info-line'>
        <span><strong>Garçom:</strong> " . ($pedido->garcom_nome ?: 'SISTEMA') . "</span>
        <span><strong>Hora:</strong> " . $pedido->created_at->format('H:i') . "</span>
    </div>
    <div class='info-line'>
        <span><strong>Status:</strong> " . strtoupper($pedido->status) . "</span>
    </div>
</div>

<div class='linha-divisoria'></div>

<table class='itens'>
    <thead>
        <tr>
            <th class='item-nome'>ITEM</th>
            <th class='item-qtd'>QTD</th>
            <th class='item-preco'>VALOR</th>
        </tr>
    </thead>
    <tbody>";

        // Itens do pedido
        foreach ($pedido->itens as $item) {
            $observacoes = $item->observacoes ? "<div class='observacoes'>{$item->observacoes}</div>" : "";
            $conteudo .= "
        <tr>
            <td class='item-nome'>
                " . ($item->produto->nome ?? 'PRODUTO') . "
                {$observacoes}
            </td>
            <td class='item-qtd'>{$item->quantidade}</td>
            <td class='item-preco'>R$ " . number_format($item->preco_unitario, 2, ',', '.') . "</td>
        </tr>";
        }

        $conteudo .= "
    </tbody>
</table>

<div class='linha-divisoria'></div>

<div class='total'>
    TOTAL: R$ " . number_format($pedido->total, 2, ',', '.') . "
</div>

<div class='footer'>
    " . ($telefone ? "Tel: {$telefone} • " : "") . "
    " . now()->format('d/m/Y H:i') . "<br>
    Obrigado pela preferência!
</div>";

        return $conteudo;
    }

    /**
     * 🖨️ GERAR CONTEÚDO PARA IMPRESSORA TÉRMICA 80mm (COMPACTO)
     */
    private function gerarConteudoCompacto80mm($pedido, $config)
    {
        $empresa = $config->nome_estabelecimento ?: "LANCHES";
        
        $conteudo = "
<style>
body { font-family: monospace; font-size: 10px; margin: 0; padding: 2mm; width: 80mm; line-height: 1.1; }
.center { text-align: center; }
.bold { font-weight: bold; }
.divider { border-top: 1px dashed #000; margin: 1mm 0; }
.table { width: 100%; border-collapse: collapse; }
.table td { padding: 0.5mm; vertical-align: top; }
.right { text-align: right; }
.obs { font-size: 8px; color: #666; font-style: italic; }
</style>

<div class='center bold'>{$empresa}</div>
<div class='center'>PEDIDO #{$pedido->id}</div>
<div class='divider'></div>
<div><strong>Mesa:</strong> " . ($pedido->mesa->numero ?? $pedido->mesa_id) . " | <strong>Data:</strong> " . $pedido->created_at->format('d/m H:i') . "</div>
<div><strong>Garçom:</strong> " . ($pedido->garcom_nome ?: 'SISTEMA') . " | <strong>Status:</strong> " . strtoupper($pedido->status) . "</div>
<div class='divider'></div>
<table class='table'>";

        // Itens do pedido
        foreach ($pedido->itens as $item) {
            $subtotal = $item->quantidade * $item->preco_unitario;
            $observacoes = $item->observacoes ? "<div class='obs'>Obs: {$item->observacoes}</div>" : "";
            
            $conteudo .= "
    <tr>
        <td>{$item->quantidade}x</td>
        <td>" . ($item->produto->nome ?? 'Item') . "{$observacoes}</td>
        <td class='right'>R$ " . number_format($subtotal, 2, ',', '.') . "</td>
    </tr>";
        }

        $conteudo .= "
</table>
<div class='divider'></div>
<div class='center bold'>TOTAL: R$ " . number_format($pedido->total, 2, ',', '.') . "</div>
<div class='center' style='margin-top: 2mm; font-size: 8px;'>
    " . now()->format('d/m/Y H:i:s') . "
</div>";

        return $conteudo;
    }
}