<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable([
    'titulo',
    'contenido',
    'fecha_publicacion',
    'fecha_vigencia',
    'activo'
])]
class Notice extends Model
{
    protected $casts = [
        'activo' => 'boolean',
        'fecha_publicacion' => 'date',
        'fecha_vigencia' => 'date'
    ];
}
