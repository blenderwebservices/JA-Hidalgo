<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Department;
use App\Models\Transaction;
use App\Models\MoneyDestination;
use App\Models\ExpenseGroup;
use App\Models\ExpenseSubgroup;
use App\Models\PaymentMethod;
use App\Models\Expense;
use App\Models\Notice;
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
        // 1. Create Money Destinations
        MoneyDestination::insert([
            ['id' => 1, 'nombre' => 'Banorte Miguel', 'administracion_actual' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'nombre' => 'NU Miguel', 'administracion_actual' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'nombre' => 'Cuenta Carlos', 'administracion_actual' => false, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 4, 'nombre' => 'Carlos no Reportado', 'administracion_actual' => false, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 5, 'nombre' => 'Ajuste por Acuerdo', 'administracion_actual' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 6, 'nombre' => 'Efectivo', 'administracion_actual' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 7, 'nombre' => 'Otro', 'administracion_actual' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // 2. Create Expense Groups
        ExpenseGroup::insert([
            ['id' => 1, 'nombre' => 'Mantenimiento General', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'nombre' => 'Servicios Públicos', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'nombre' => 'Administración y Operación', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 4, 'nombre' => 'Seguridad y Vigilancia', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // 3. Create Expense Subgroups
        ExpenseSubgroup::insert([
            ['id' => 1, 'expense_group_id' => 1, 'nombre' => 'Pintura y Reparaciones', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'expense_group_id' => 1, 'nombre' => 'Jardinería y Limpieza', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'expense_group_id' => 2, 'nombre' => 'Luz de Áreas Comunes', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 4, 'expense_group_id' => 2, 'nombre' => 'Agua Caseta y Riego', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 5, 'expense_group_id' => 3, 'nombre' => 'Honorarios de Administración', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 6, 'expense_group_id' => 3, 'nombre' => 'Papelería e Impresiones', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 7, 'expense_group_id' => 4, 'nombre' => 'Guardias de Caseta', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 8, 'expense_group_id' => 4, 'nombre' => 'Reparación de Portón Eléctrico', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // 4. Create Payment Methods
        PaymentMethod::insert([
            ['id' => 1, 'nombre' => 'Transferencia Bancaria', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'nombre' => 'Efectivo', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'nombre' => 'Cheque', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 4, 'nombre' => 'Tarjeta de Crédito / Débito', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // 5. Create Sample Expenses
        Expense::insert([
            [
                'id' => 'EXP-001',
                'fecha' => '2026-06-01',
                'monto' => 12500.00,
                'concepto' => 'Pago Guardias de Caseta - Quincena 1 Junio',
                'expense_group_id' => 4,
                'expense_subgroup_id' => 7,
                'proveedor' => 'Seguridad Privada Allende',
                'payment_method_id' => 1,
                'documento' => null,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 'EXP-002',
                'fecha' => '2026-06-05',
                'monto' => 3450.00,
                'concepto' => 'Reparación bomba de agua del jardín principal',
                'expense_group_id' => 1,
                'expense_subgroup_id' => 1,
                'proveedor' => 'Servicios de Plomería del Norte',
                'payment_method_id' => 2,
                'documento' => null,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 'EXP-003',
                'fecha' => '2026-06-10',
                'monto' => 8400.00,
                'concepto' => 'Honorarios de Administración del mes de Mayo',
                'expense_group_id' => 3,
                'expense_subgroup_id' => 5,
                'proveedor' => 'Administraciones Allende SC',
                'payment_method_id' => 1,
                'documento' => null,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);

        // 6. Create Notices
        Notice::insert([
            [
                'titulo' => '¡Bienvenidos al Nuevo Sistema de Control Financiero!',
                'contenido' => 'Estimados condóminos, les damos la bienvenida al portal digital de Jardines de Allende Hidalgo. A partir de hoy podrán consultar estados de cuenta resumidos, consumos de agua e informes de gastos directamente desde aquí de forma transparente.',
                'fecha_publicacion' => '2026-06-28',
                'fecha_vigencia' => null,
                'activo' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'titulo' => 'Mantenimiento preventivo de portón de acceso',
                'contenido' => 'Se informa que el próximo miércoles 1 de julio se realizarán trabajos de mantenimiento en el portón eléctrico principal de las 9:00 AM a las 2:00 PM. Favor de tomar sus previsiones.',
                'fecha_publicacion' => '2026-06-29',
                'fecha_vigencia' => '2026-07-02',
                'activo' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);

        // 7. Create Departments
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

        // 8. Create Users
        User::create([
            'name' => 'Administrador',
            'email' => 'admin@jardineshidalgo.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        User::create([
            'name' => 'Admin Lectura',
            'email' => 'lectura@jardineshidalgo.com',
            'password' => Hash::make('password'),
            'role' => 'admin-readonly',
        ]);

        User::create([
            'name' => 'Condómino de Prueba',
            'email' => 'condomino@jardineshidalgo.com',
            'password' => Hash::make('password'),
            'role' => 'condomino',
            'department_id' => 'T1-01',
        ]);

        // 9. Generate Initial & Recurring Transactions
        $transactions = [];
        $startDate = Carbon::parse('2025-04-01');
        $endDate = Carbon::now();

        $departments = Department::all();

        foreach ($departments as $dept) {
            // Initial debt
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

            // Extraordinaria
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

            // Seed mock abonos (payments) for a few departments to make dashboard visual
            if ($dept->id === 'T1-01' || $dept->id === 'T1-02' || $dept->id === 'T2-01') {
                $transactions[] = [
                    'id' => "AB-M-{$dept->id}-2026-06",
                    'department_id' => $dept->id,
                    'fecha' => '2026-06-10',
                    'tipo' => 'abono',
                    'concepto' => 'Abono Cuota Mantenimiento Junio',
                    'mes_correspondiente' => '2026-06',
                    'destino_abono' => 'Banorte Miguel',
                    'monto' => 840.00,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
                $transactions[] = [
                    'id' => "AB-WF-{$dept->id}-2026-06",
                    'department_id' => $dept->id,
                    'fecha' => '2026-06-10',
                    'tipo' => 'abono',
                    'concepto' => 'Abono Agua Fijo Junio',
                    'mes_correspondiente' => '2026-06',
                    'destino_abono' => 'NU Miguel',
                    'monto' => 82.00,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        // Chunk insert
        $chunks = array_chunk($transactions, 500);
        foreach ($chunks as $chunk) {
            Transaction::insert($chunk);
        }
    }
}
