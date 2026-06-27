<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable([
    'id',
    'department_id',
    'periodo',
    'lectura_inicial',
    'lectura_final',
    'excedente',
    'precio_por_m3',
    'monto_cobrado'
])]
class WaterReading extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    public function department()
    {
        return $this->belongsTo(Department::class);
    }
}
