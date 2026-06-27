<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable([
    'id',
    'torre',
    'tipo',
    'numero',
    'contacto_nombre',
    'contacto_rol',
    'contacto_email',
    'contacto_celular',
    'notas',
    'status'
])]
class Department extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function waterReadings()
    {
        return $this->hasMany(WaterReading::class);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }
}
