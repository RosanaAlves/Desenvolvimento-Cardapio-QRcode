<?php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'tipo',
        'ativo'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'ativo' => 'boolean'
    ];

    // 🔥 MÉTODOS DE TIPO
    public function isAdmin()
    {
        return $this->tipo === 'admin';
    }

    public function isCaixa()
    {
        return $this->tipo === 'caixa';
    }

    public function isGarcom()
    {
        return $this->tipo === 'garcom';
    }
}