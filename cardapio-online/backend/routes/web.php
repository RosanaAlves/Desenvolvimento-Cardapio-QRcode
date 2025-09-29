# Visualize o conteúdo problemático
tail -10 routes/web.php

# Corrija o arquivo removendo as linhas problemáticas
head -n -5 routes/web.php > routes/web_temp.php
mv routes/web_temp.php routes/web.php

# Ou simplesmente recrie o arquivo web.php
cat > routes/web.php << 'EOF'
<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Rotas da API via web.php (solução temporária)
Route::prefix('api')->group(function () {
    Route::get('/test', function() {
        return response()->json(['message' => 'API funcionando via web!']);
    });
    
    Route::get('/categorias', function() {
        return response()->json(['message' => 'Categorias endpoint!']);
    });
    
    Route::get('/produtos', function() {
        return response()->json(['message' => 'Produtos endpoint!']);
    });
});
EOF