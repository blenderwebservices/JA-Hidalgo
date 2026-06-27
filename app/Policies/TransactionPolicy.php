<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Transaction;

class TransactionPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Transaction $transaction): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, Transaction $transaction): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, Transaction $transaction): bool
    {
        return $user->isAdmin();
    }

    public function restore(User $user, Transaction $transaction): bool
    {
        return $user->isAdmin();
    }

    public function forceDelete(User $user, Transaction $transaction): bool
    {
        return $user->isAdmin();
    }
}
