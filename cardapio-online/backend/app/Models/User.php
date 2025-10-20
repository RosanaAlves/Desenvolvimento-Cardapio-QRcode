<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // ✅ ESSENCIAL PARA TOKENS

class User extends Authenticatable
{
    // ... (restante do seu código)

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'ativo' => 'boolean',
        'password' => 'hashed',
    ];
    
    // ✅ CORREÇÃO/ADICIONAL: Métodos de verificação de Regras de Negócio
    
    /**
     * Verifica se o usuário tem o papel (tipo) fornecido.
     * @param string $role
     * @return bool
     */
    public function hasRole(string $role): bool
    {
        // O Middleware CheckRole.php vai usar isso
        return $this->tipo === $role;
    }

    /**
     * Verifica se o usuário está ativo.
     * @return bool
     */
    public function isAtivo(): bool
    {
        // Garante que apenas usuários ativos podem prosseguir
        return (bool) $this->ativo;
    }
}