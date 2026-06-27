<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable([
    'id',
    'department_id',
    'fecha',
    'tipo',
    'concepto',
    'mes_correspondiente',
    'destino_abono',
    'monto'
])]
class Transaction extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    public function department()
    {
        return $this->belongsTo(Department::class);
    }
}
