<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['nombre', 'administracion_actual'])]
class MoneyDestination extends Model
{
    protected $casts = [
        'administracion_actual' => 'boolean',
    ];
}
