<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable([
    'timestamp',
    'action',
    'entity_type',
    'entity_id',
    'detail'
])]
class AuditLog extends Model
{
    //
}
