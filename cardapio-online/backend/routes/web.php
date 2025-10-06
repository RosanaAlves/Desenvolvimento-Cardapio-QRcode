<?php

use Illuminate\Support\Facades\Route;

// Rotas Web (para futura dashboard administrativa)
Route::get('/', function () {
    return view('welcome');
});

Route::get('/admin', function () {
    return 'Dashboard Administrativo - Em desenvolvimento';
});