<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Department;
use App\Models\Transaction;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Departments
        $depts = [];

        // Torre 1: 20 departments (T1-01 to T1-20)
        for ($i = 1; $i <= 20; $i++) {
            $numStr = str_pad($i, 2, '0', STR_PAD_LEFT);
            $depts[] = [
                'id' => "T1-{$numStr}",
                'torre' => 'Torre 1',
                'tipo' => 'departamento',
                'numero' => (string) $i,
                'contacto_nombre' => null,
                'contacto_rol' => 'propietario',
                'contacto_email' => null,
                'contacto_celular' => null,
                'notas' => null,
                'status' => 'normal',
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        // Torre 2: 18 departments (T2-01 to T2-18) + 2 locales (T2-L1, T2-L2)
        for ($i = 1; $i <= 18; $i++) {
            $numStr = str_pad($i, 2, '0', STR_PAD_LEFT);
            $depts[] = [
                'id' => "T2-{$numStr}",
                'torre' => 'Torre 2',
                'tipo' => 'departamento',
                'numero' => (string) $i,
                'contacto_nombre' => null,
                'contacto_rol' => 'propietario',
                'contacto_email' => null,
                'contacto_celular' => null,
                'notas' => null,
                'status' => 'normal',
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        $depts[] = [
            'id' => 'T2-L1',
            'torre' => 'Torre 2',
            'tipo' => 'local',
            'numero' => 'Local 1',
            'contacto_nombre' => null,
            'contacto_rol' => 'propietario',
            'contacto_email' => null,
            'contacto_celular' => null,
            'notas' => null,
            'status' => 'normal',
            'created_at' => now(),
            'updated_at' => now(),
        ];

        $depts[] = [
            'id' => 'T2-L2',
            'torre' => 'Torre 2',
            'tipo' => 'local',
            'numero' => 'Local 2',
            'contacto_nombre' => null,
            'contacto_rol' => 'propietario',
            'contacto_email' => null,
            'contacto_celular' => null,
            'notas' => null,
            'status' => 'normal',
            'created_at' => now(),
            'updated_at' => now(),
        ];

        // Torre 3: 20 departments (T3-01 to T3-20)
        for ($i = 1; $i <= 20; $i++) {
            $numStr = str_pad($i, 2, '0', STR_PAD_LEFT);
            $depts[] = [
                'id' => "T3-{$numStr}",
                'torre' => 'Torre 3',
                'tipo' => 'departamento',
                'numero' => (string) $i,
                'contacto_nombre' => null,
                'contacto_rol' => 'propietario',
                'contacto_email' => null,
                'contacto_celular' => null,
                'notas' => null,
                'status' => 'normal',
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        Department::insert($depts);

        // 2. Create Users
        User::create([
            'name' => 'Administrador',
            'email' => 'admin@jardineshidalgo.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        User::create([
            'name' => 'Condómino de Prueba',
            'email' => 'condomino@jardineshidalgo.com',
            'password' => Hash::make('password'),
            'role' => 'condomino',
            'department_id' => 'T1-01',
        ]);

        // 3. Generate Initial & Recurring Transactions
        $transactions = [];
        $startDate = Carbon::parse('2025-04-01');
        $endDate = Carbon::now();

        // We fetch the departments we just inserted
        $departments = Department::all();

        foreach ($departments as $dept) {
            // 1. Initial debt
            $transactions[] = [
                'id' => "AC-INIT-DEUDA-{$dept->id}",
                'department_id' => $dept->id,
                'fecha' => '2025-04-01',
                'tipo' => 'cargo',
                'concepto' => 'Adeudo Administración Morada',
                'mes_correspondiente' => '2025-04',
                'destino_abono' => null,
                'monto' => 1.00,
                'created_at' => now(),
                'updated_at' => now(),
            ];

            // 2. Extraordinaria
            $transactions[] = [
                'id' => "AC-INIT-EXTRA-{$dept->id}",
                'department_id' => $dept->id,
                'fecha' => '2025-04-01',
                'tipo' => 'cargo',
                'concepto' => 'Cuota extraordinaria 2025',
                'mes_correspondiente' => '2025-04',
                'destino_abono' => null,
                'monto' => 2500.00,
                'created_at' => now(),
                'updated_at' => now(),
            ];

            // Loop monthly from April 2025 to current date
            $currentLoopDate = $startDate->copy();
            while ($currentLoopDate->lessThanOrEqualTo($endDate)) {
                $monthStr = $currentLoopDate->format('Y-m');
                $chargeDate = "{$monthStr}-01";

                // maintenance
                $transactions[] = [
                    'id' => "AC-M-{$dept->id}-{$monthStr}",
                    'department_id' => $dept->id,
                    'fecha' => $chargeDate,
                    'tipo' => 'cargo',
                    'concepto' => 'Cuota Mantenimiento',
                    'mes_correspondiente' => $monthStr,
                    'destino_abono' => null,
                    'monto' => 840.00,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];

                // water fijo
                $transactions[] = [
                    'id' => "AC-WF-{$dept->id}-{$monthStr}",
                    'department_id' => $dept->id,
                    'fecha' => $chargeDate,
                    'tipo' => 'cargo',
                    'concepto' => 'Agua Fijo',
                    'mes_correspondiente' => $monthStr,
                    'destino_abono' => null,
                    'monto' => 82.00,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];

                $currentLoopDate->addMonth();
            }
        }

        // Chunk insert to avoid database limits on large inserts (60 * ~30 * 2 transactions = ~3600 rows)
        $chunks = array_chunk($transactions, 500);
        foreach ($chunks as $chunk) {
            Transaction::insert($chunk);
        }
    }
}
