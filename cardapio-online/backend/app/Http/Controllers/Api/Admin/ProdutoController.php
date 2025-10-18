<?php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Produto;
use App\Models\Categoria;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class ProdutoController extends Controller
{
    // ✅ LISTAR PRODUTOS - CORRIGIDO
    public function index(Request $request)
    {
        try {
            $query = Produto::with('categoria');

            // ✅ FILTROS
            if ($request->has('disponivel') && $request->disponivel !== 'todos') {
                $query->where('disponivel', $request->boolean('disponivel'));
            }

            if ($request->has('categoria_id') && $request->categoria_id) {
                $query->where('categoria_id', $request->categoria_id);
            }

            if ($request->has('busca') && $request->busca) {
                $query->where('nome', 'LIKE', "%{$request->busca}%")
                      ->orWhere('descricao', 'LIKE', "%{$request->busca}%");
            }

            // ✅ ORDENAÇÃO
            $ordenacao = $request->get('ordenar_por', 'nome');
            $direcao = $request->get('direcao', 'asc');

            $query->orderBy($ordenacao, $direcao);

            $produtos = $query->get();

            return response()->json([
                'success' => true,
                'data' => $produtos->map(function ($produto) {
                    return $produto->toArrayCompleto();
                }),
                'meta' => [
                    'total' => $produtos->count(),
                    'disponiveis' => $produtos->where('disponivel', true)->count(),
                    'indisponiveis' => $produtos->where('disponivel', false)->count()
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erro em Admin ProdutoController::index: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao carregar produtos'
            ], 500);
        }
    }

    // ✅ DETALHES DO PRODUTO - NOVO MÉTODO
    public function show($id)
    {
        try {
            $produto = Produto::with('categoria', 'pedidoItens.pedido')->find($id);
            
            if (!$produto) {
                return response()->json([
                    'success' => false,
                    'message' => 'Produto não encontrado'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $produto->toArrayCompleto()
            ]);

        } catch (\Exception $e) {
            Log::error('Erro em Admin ProdutoController::show: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao carregar produto'
            ], 500);
        }
    }

    // ✅ CRIAR PRODUTO - CORRIGIDO
    public function store(Request $request)
    {
        DB::beginTransaction();
        try {
            $validated = $request->validate([
                'nome' => 'required|string|max:255|unique:produtos,nome',
                'descricao' => 'nullable|string|max:500',
                'preco' => 'required|numeric|min:0.01|max:9999.99',
                'categoria_id' => 'required|exists:categorias,id',
                'disponivel' => 'boolean',
                'imagem' => 'nullable|url|max:500'
            ]);

            $produto = Produto::create($validated);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $produto->toArrayCompleto(),
                'message' => 'Produto criado com sucesso!'
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erro em Admin ProdutoController::store: ' . $e->getMessage());
            
            $mensagem = 'Erro ao criar produto';
            if ($e instanceof \Illuminate\Validation\ValidationException) {
                $mensagem = 'Dados de entrada inválidos';
            }

            return response()->json([
                'success' => false,
                'message' => $mensagem,
                'errors' => $e->getMessage()
            ], 500);
        }
    }

    // ✅ ATUALIZAR PRODUTO - CORRIGIDO
    public function update(Request $request, $id)
    {
        DB::beginTransaction();
        try {
            $produto = Produto::find($id);
            
            if (!$produto) {
                return response()->json([
                    'success' => false,
                    'message' => 'Produto não encontrado'
                ], 404);
            }

            $validated = $request->validate([
                'nome' => [
                    'sometimes',
                    'required',
                    'string',
                    'max:255',
                    Rule::unique('produtos')->ignore($produto->id)
                ],
                'descricao' => 'nullable|string|max:500',
                'preco' => 'sometimes|required|numeric|min:0.01|max:9999.99',
                'categoria_id' => 'sometimes|required|exists:categorias,id',
                'disponivel' => 'boolean',
                'imagem' => 'nullable|url|max:500'
            ]);

            $produto->update($validated);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $produto->toArrayCompleto(),
                'message' => 'Produto atualizado com sucesso!'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erro em Admin ProdutoController::update: ' . $e->getMessage());
            
            $mensagem = 'Erro ao atualizar produto';
            if ($e instanceof \Illuminate\Validation\ValidationException) {
                $mensagem = 'Dados de entrada inválidos';
            }

            return response()->json([
                'success' => false,
                'message' => $mensagem,
                'errors' => $e->getMessage()
            ], 500);
        }
    }

    // ✅ EXCLUIR PRODUTO - CORRIGIDO
    public function destroy($id)
    {
        DB::beginTransaction();
        try {
            $produto = Produto::with('pedidoItens')->find($id);
            
            if (!$produto) {
                return response()->json([
                    'success' => false,
                    'message' => 'Produto não encontrado'
                ], 404);
            }

            // ✅ VERIFICAR SE PODE SER EXCLUÍDO
            if (!$produto->podeSerExcluido()) {
                return response()->json([
                    'success' => false,
                    'message' => $produto->getMensagemImpedimentoExclusao()
                ], 422);
            }

            $produto->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Produto excluído com sucesso!'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erro em Admin ProdutoController::destroy: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao excluir produto'
            ], 500);
        }
    }

    // ✅ ALTERAR DISPONIBILIDADE - NOVO MÉTODO
    public function toggleDisponibilidade($id)
    {
        DB::beginTransaction();
        try {
            $produto = Produto::find($id);
            
            if (!$produto) {
                return response()->json([
                    'success' => false,
                    'message' => 'Produto não encontrado'
                ], 404);
            }

            $novoStatus = !$produto->disponivel;
            $produto->update(['disponivel' => $novoStatus]);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $produto->toArrayCompleto(),
                'message' => $novoStatus ? 
                    'Produto marcado como disponível!' : 
                    'Produto marcado como indisponível!'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erro em Admin ProdutoController::toggleDisponibilidade: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao alterar disponibilidade do produto'
            ], 500);
        }
    }

    // ✅ ESTATÍSTICAS DOS PRODUTOS - NOVO MÉTODO
    public function estatisticas()
    {
        try {
            $totalProdutos = Produto::count();
            $produtosDisponiveis = Produto::where('disponivel', true)->count();
            $produtosIndisponiveis = Produto::where('disponivel', false)->count();
            
            $produtoMaisCaro = Produto::orderBy('preco', 'desc')->first();
            $produtoMaisBarato = Produto::orderBy('preco', 'asc')->first();

            $categoriasComProdutos = Categoria::withCount('produtos')->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'total_produtos' => $totalProdutos,
                    'produtos_disponiveis' => $produtosDisponiveis,
                    'produtos_indisponiveis' => $produtosIndisponiveis,
                    'taxa_disponibilidade' => $totalProdutos > 0 ? 
                        round(($produtosDisponiveis / $totalProdutos) * 100, 2) : 0,
                    'produto_mais_caro' => $produtoMaisCaro?->toArrayResumido(),
                    'produto_mais_barato' => $produtoMaisBarato?->toArrayResumido(),
                    'categorias' => $categoriasComProdutos->map(function ($categoria) {
                        return [
                            'id' => $categoria->id,
                            'nome' => $categoria->nome,
                            'quantidade_produtos' => $categoria->produtos_count
                        ];
                    })
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erro em Admin ProdutoController::estatisticas: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao carregar estatísticas'
            ], 500);
        }
    }
}