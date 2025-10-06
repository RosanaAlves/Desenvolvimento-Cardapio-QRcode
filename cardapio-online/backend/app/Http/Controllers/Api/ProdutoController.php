<?php
// backend/app/Http/Controllers/Api/ProductController.php
public function index()
{
    $products = Product::with('categoria')
        ->where('disponivel', true)
        ->get();
    
    return ProductResource::collection($products);
}

public function byCategory($categoryId)
{
    $products = Product::with('categoria')
        ->where('categoria_id', $categoryId)
        ->where('disponivel', true)
        ->get();
    
    return ProductResource::collection($products);
}