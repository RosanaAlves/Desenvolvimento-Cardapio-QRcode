<?php

namespace App\Http\Controllers\Api\Garcom;

use App\Http\Controllers\Controller;
use App\Models\Produto;
use App\Models\Categoria;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class ProdutoController extends Controller
{
    // ✅ PRODUTOS PÚBLICOS (DISPONÍVEIS) - CORRIGIDO
    public function index()
    {
        try {
            $query = Produto::with(['categoria' => function($query) {
                $query->where('disponivel', true);
            }])
            ->where('disponivel', true);
            
            $produtos = $query->get()->map(function($produto) {
                return [
                    'id' => $produto->id,
                    'nome' => $produto->nome,
                    'descricao' => $produto->descricao,
                    'preco' => (float) $produto->preco,
                    'preco_formatado' => 'R$ ' . number_format($produto->preco, 2, ',', '.'),
                    'categoria_id' => $produto->categoria_id,
                    'categoria_nome' => $produto->categoria->nome ?? 'Sem categoria',
                    'categoria_disponivel' => $produto->categoria->disponivel ?? true,
                    'disponivel' => (bool) $produto->disponivel,
                    'imagem' => $produto->imagem,
                    'imagem_url' => $this->getImagemUrl($produto->imagem),
                    'status' => 'disponivel'
                ];
            });

            // ✅ Agrupar por categoria
            $produtosPorCategoria = $produtos->groupBy('categoria_nome')->map(function($produtosCategoria, $nomeCategoria) {
                return [
                    'categoria' => $nomeCategoria,
                    'produtos' => $produtosCategoria->values()
                ];
            })->values();

            return response()->json([
                'success' => true,
                'data' => $produtosPorCategoria,
                'meta' => [
                    'total_produtos' => $produtos->count(),
                    'total_categorias' => $produtosPorCategoria->count()
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erro em Garcom ProdutoController::index: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao carregar produtos',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    // ✅ PRODUTOS POR CATEGORIA - NOVO MÉTODO
    public function porCategoria($categoriaId)
    {
        try {
            $query = Produto::with('categoria')
                ->where('disponivel', true)
                ->where('categoria_id', $categoriaId);
            
            $produtos = $query->get()->map(function($produto) {
                return $this->formatarProduto($produto);
            });

            return response()->json([
                'success' => true,
                'data' => $produtos,
                'meta' => [
                    'total' => $produtos->count(),
                    'categoria' => $produtos->first()['categoria_nome'] ?? 'Categoria'
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erro em Garcom ProdutoController::porCategoria: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao carregar produtos da categoria'
            ], 500);
        }
    }

    // ✅ PRODUTOS MAIS VENDIDOS - NOVO MÉTODO
    public function maisVendidos()
    {
        try {
            $produtos = Produto::with('categoria')
                ->where('disponivel', true)
                ->withCount(['pedidoItens as total_vendido' => function($query) {
                    $query->select(DB::raw('COALESCE(SUM(quantidade), 0)'));
                }])
                ->orderBy('total_vendido', 'desc')
                ->limit(10)
                ->get()
                ->map(function($produto) {
                    return $this->formatarProduto($produto, true);
                });

            return response()->json([
                'success' => true,
                'data' => $produtos,
                'meta' => [
                    'total' => $produtos->count(),
                    'titulo' => 'Mais Vendidos'
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erro em Garcom ProdutoController::maisVendidos: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao carregar produtos mais vendidos'
            ], 500);
        }
    }

    // ✅ BUSCAR PRODUTOS - NOVO MÉTODO
    public function buscar($termo)
    {
        try {
            $query = Produto::with('categoria')
                ->where('disponivel', true)
                ->where(function($q) use ($termo) {
                    $q->where('nome', 'LIKE', "%{$termo}%")
                      ->orWhere('descricao', 'LIKE', "%{$termo}%");
                });
            
            $produtos = $query->get()->map(function($produto) {
                return $this->formatarProduto($produto);
            });

            return response()->json([
                'success' => true,
                'data' => $produtos,
                'meta' => [
                    'total' => $produtos->count(),
                    'termo_busca' => $termo
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erro em Garcom ProdutoController::buscar: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao buscar produtos'
            ], 500);
        }
    }

    // ✅ PRODUTO ESPECÍFICO - CORRIGIDO
    public function show($id)
    {
        try {
            $produto = Produto::with('categoria')->find($id);
            
            if (!$produto) {
                return response()->json([
                    'success' => false,
                    'message' => 'Produto não encontrado'
                ], 404);
            }

            // ✅ Verificar se o produto está disponível
            if (!$produto->disponivel) {
                return response()->json([
                    'success' => false,
                    'message' => 'Produto indisponível'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $this->formatarProduto($produto, true)
            ]);

        } catch (\Exception $e) {
            Log::error('Erro em Garcom ProdutoController::show: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao carregar produto'
            ], 500);
        }
    }

    // ✅ CATEGORIAS DISPONÍVEIS - NOVO MÉTODO
    public function categorias()
    {
        try {
            $categorias = Categoria::where('disponivel', true)
                ->withCount(['produtos as total_produtos' => function($query) {
                    $query->where('disponivel', true);
                }])
                ->having('total_produtos', '>', 0)
                ->get()
                ->map(function($categoria) {
                    return [
                        'id' => $categoria->id,
                        'nome' => $categoria->nome,
                        'descricao' => $categoria->descricao,
                        'total_produtos' => $categoria->total_produtos,
                        'disponivel' => (bool) $categoria->disponivel
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $categorias,
                'meta' => [
                    'total' => $categorias->count()
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erro em Garcom ProdutoController::categorias: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao carregar categorias'
            ], 500);
        }
    }

    // ✅ ESTATÍSTICAS DOS PRODUTOS - NOVO MÉTODO
    public function estatisticas()
    {
        try {
            $totalProdutos = Produto::where('disponivel', true)->count();
            $totalCategorias = Categoria::where('disponivel', true)
                ->has('produtos', '>', 0)
                ->count();
            
            $produtoMaisCaro = Produto::where('disponivel', true)
                ->orderBy('preco', 'desc')
                ->first();
            
            $produtoMaisBarato = Produto::where('disponivel', true)
                ->orderBy('preco', 'asc')
                ->first();

            return response()->json([
                'success' => true,
                'data' => [
                    'total_produtos' => $totalProdutos,
                    'total_categorias' => $totalCategorias,
                    'produto_mais_caro' => $produtoMaisCaro ? $this->formatarProduto($produtoMaisCaro) : null,
                    'produto_mais_barato' => $produtoMaisBarato ? $this->formatarProduto($produtoMaisBarato) : null,
                    'faixa_preco' => [
                        'minimo' => $produtoMaisBarato ? (float) $produtoMaisBarato->preco : 0,
                        'maximo' => $produtoMaisCaro ? (float) $produtoMaisCaro->preco : 0
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erro em Garcom ProdutoController::estatisticas: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao carregar estatísticas'
            ], 500);
        }
    }

    // ✅ MÉTODO PRIVADO: FORMATAR PRODUTO
    private function formatarProduto(Produto $produto, bool $detalhado = false)
    {
        $dadosBase = [
            'id' => $produto->id,
            'nome' => $produto->nome,
            'descricao' => $produto->descricao,
            'preco' => (float) $produto->preco,
            'preco_formatado' => 'R$ ' . number_format($produto->preco, 2, ',', '.'),
            'categoria_id' => $produto->categoria_id,
            'categoria_nome' => $produto->categoria->nome ?? 'Sem categoria',
            'disponivel' => (bool) $produto->disponivel,
            'imagem' => $produto->imagem,
            'imagem_url' => $this->getImagemUrl($produto->imagem),
            'status' => 'disponivel'
        ];

        if ($detalhado) {
            $dadosBase = array_merge($dadosBase, [
                'categoria_completa' => $produto->categoria ? [
                    'id' => $produto->categoria->id,
                    'nome' => $produto->categoria->nome,
                    'descricao' => $produto->categoria->descricao,
                    'disponivel' => (bool) $produto->categoria->disponivel
                ] : null,
                'created_at' => $produto->created_at?->toISOString(),
                'updated_at' => $produto->updated_at?->toISOString()
            ]);
        }

        return $dadosBase;
    }

    // ✅ MÉTODO PRIVADO: OBTER URL DA IMAGEM
    private function getImagemUrl(?string $imagem): ?string
    {
        if (!$imagem) {
            return null;
        }

        // Se for URL completa, retorna diretamente
        if (filter_var($imagem, FILTER_VALIDATE_URL)) {
            return $imagem;
        }

        // Se for caminho relativo, adiciona URL base
        return asset('storage/' . ltrim($imagem, '/'));
    }

    // ✅ MÉTODO PRIVADO: SUCCESS (para compatibilidade)
    private function success($data, $message = null)
    {
        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => $message
        ]);
    }

    // ✅ MÉTODO PRIVADO: ERROR (para compatibilidade)
    private function error($message, $status = 400)
    {
        return response()->json([
            'success' => false,
            'message' => $message
        ], $status);
    }
}