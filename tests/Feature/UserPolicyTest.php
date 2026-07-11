<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserPolicyTest extends TestCase
{
    use RefreshDatabase;

    public function test_condomino_cannot_view_other_users(): void
    {
        $condomino = User::factory()->create(['role' => 'condomino']);
        $otherUser = User::factory()->create(['role' => 'condomino']);

        // Can view themselves
        $this->assertTrue($condomino->can('view', $condomino));

        // Cannot view others
        $this->assertFalse($condomino->can('view', $otherUser));
    }

    public function test_admin_and_admin_lectura_can_view_any_user(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $adminLectura = User::factory()->create(['role' => 'admin_lectura']);
        $otherUser = User::factory()->create(['role' => 'condomino']);

        $this->assertTrue($admin->can('view', $otherUser));
        $this->assertTrue($adminLectura->can('view', $otherUser));
    }

    public function test_admin_lectura_cannot_create_or_update_or_delete(): void
    {
        $adminLectura = User::factory()->create(['role' => 'admin_lectura']);
        $otherUser = User::factory()->create(['role' => 'condomino']);

        $this->assertFalse($adminLectura->can('create', User::class));
        $this->assertFalse($adminLectura->can('update', $otherUser));
        $this->assertFalse($adminLectura->can('delete', $otherUser));
    }
    
    public function test_admin_can_create_update_and_delete(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $otherUser = User::factory()->create(['role' => 'condomino']);

        $this->assertTrue($admin->can('create', User::class));
        $this->assertTrue($admin->can('update', $otherUser));
        $this->assertTrue($admin->can('delete', $otherUser));
    }
}
