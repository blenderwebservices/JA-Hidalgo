<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['expense_group_id', 'nombre'])]
class ExpenseSubgroup extends Model
{
    public function group()
    {
        return $this->belongsTo(ExpenseGroup::class, 'expense_group_id');
    }
}
