<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Department;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_api_get_db_state_requires_authentication(): void
    {
        $response = $this->getJson('/api/db-state');
        $response->assertStatus(401);
    }

    public function test_api_get_db_state_returns_valid_structure(): void
    {
        // Authenticate as a user
        $user = User::factory()->create(['role' => 'condomino']);
        $this->actingAs($user);

        // Create some sample data
        Department::create([
            'id' => 'T1-101',
            'torre' => 'Torre 1',
            'tipo' => 'Departamento',
            'numero' => '101'
        ]);

        $response = $this->getJson('/api/db-state');

        $response->assertStatus(200);
        
        $response->assertJsonStructure([
            'ja_departments',
            'ja_transactions',
            'ja_water_readings',
            'ja_audit_log',
            'ja_money_destinations',
            'ja_expense_groups',
            'ja_expense_subgroups',
            'ja_payment_methods',
            'ja_expenses',
            'ja_notices'
        ]);

        $this->assertCount(1, $response->json('ja_departments'));
        $this->assertEquals('T1-101', $response->json('ja_departments.0.id'));
    }

    public function test_api_sync_departments_updates_database(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $this->actingAs($user);

        // Pre-create department
        Department::create([
            'id' => 'T1-102',
            'torre' => 'Torre 1',
            'tipo' => 'Departamento',
            'numero' => '102',
            'contacto_nombre' => 'Old Name'
        ]);

        $payload = [
            'data' => [
                [
                    'id' => 'T1-102',
                    'contactoNombre' => 'New Awesome Name',
                    'contactoRol' => 'inquilino',
                    'contactoEmail' => 'new@test.com',
                    'contactoCelular' => '1234567890',
                    'notas' => 'Testing sync',
                    'status' => 'al_corriente',
                    'conConvenio' => true
                ]
            ]
        ];

        $response = $this->postJson('/api/sync-departments', $payload);

        $response->assertStatus(200);
        $response->assertJson(['status' => 'success']);

        $this->assertDatabaseHas('departments', [
            'id' => 'T1-102',
            'contacto_nombre' => 'New Awesome Name',
            'contacto_rol' => 'inquilino',
            'contacto_email' => 'new@test.com',
            'contacto_celular' => '1234567890',
            'notas' => 'Testing sync',
            'status' => 'al_corriente',
            'con_convenio' => 1
        ]);
    }
}
