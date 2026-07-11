<?php

namespace Tests\Unit;

use App\Models\User;
use PHPUnit\Framework\TestCase;

class UserModelTest extends TestCase
{
    public function test_user_is_admin(): void
    {
        $admin = new User(['role' => 'admin']);
        $this->assertTrue($admin->isAdmin());
        $this->assertFalse($admin->isAdminReadOnly());

        $condomino = new User(['role' => 'condomino']);
        $this->assertFalse($condomino->isAdmin());
    }

    public function test_user_is_admin_read_only(): void
    {
        $adminLectura = new User(['role' => 'admin_lectura']);
        $this->assertTrue($adminLectura->isAdminReadOnly());
        $this->assertFalse($adminLectura->isAdmin());

        $condomino = new User(['role' => 'condomino']);
        $this->assertFalse($condomino->isAdminReadOnly());
    }
}
