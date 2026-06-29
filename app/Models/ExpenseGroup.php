<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['nombre'])]
class ExpenseGroup extends Model
{
    public function subgroups()
    {
        return $this->hasMany(ExpenseSubgroup::class);
    }
}
