<?php

namespace App\Policies;

use App\Models\User;
use App\Models\WaterReading;

class WaterReadingPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, WaterReading $waterReading): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, WaterReading $waterReading): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, WaterReading $waterReading): bool
    {
        return $user->isAdmin();
    }

    public function restore(User $user, WaterReading $waterReading): bool
    {
        return $user->isAdmin();
    }

    public function forceDelete(User $user, WaterReading $waterReading): bool
    {
        return $user->isAdmin();
    }
}
