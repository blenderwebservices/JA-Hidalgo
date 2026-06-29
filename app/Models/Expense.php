<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable([
    'id',
    'fecha',
    'monto',
    'concepto',
    'expense_group_id',
    'expense_subgroup_id',
    'proveedor',
    'payment_method_id',
    'documento'
])]
class Expense extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    public function group()
    {
        return $this->belongsTo(ExpenseGroup::class, 'expense_group_id');
    }

    public function subgroup()
    {
        return $this->belongsTo(ExpenseSubgroup::class, 'expense_subgroup_id');
    }

    public function paymentMethod()
    {
        return $this->belongsTo(PaymentMethod::class, 'payment_method_id');
    }
}
