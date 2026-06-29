<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Department;
use App\Models\Transaction;
use App\Models\WaterReading;
use App\Models\AuditLog;
use Illuminate\Support\Facades\DB;

class ApiController extends Controller
{
    public function getDbState()
    {
        // 1. Fetch departments and map to CamelCase for JS
        $departments = Department::all()->map(function ($d) {
            return [
                'id' => $d->id,
                'torre' => $d->torre,
                'tipo' => $d->tipo,
                'numero' => $d->numero,
                'contactoNombre' => $d->contacto_nombre,
                'contactoRol' => $d->contacto_rol,
                'contactoEmail' => $d->contacto_email,
                'contactoCelular' => $d->contacto_celular,
                'notas' => $d->notas,
                'status' => $d->status,
                'conConvenio' => (bool)$d->con_convenio,
            ];
        });

        // 2. Fetch transactions and map to JS format
        $transactions = Transaction::all()->map(function ($t) {
            return [
                'id' => $t->id,
                'deptoId' => $t->department_id,
                'fecha' => $t->fecha,
                'tipo' => $t->tipo,
                'concepto' => $t->concepto,
                'mesCorrespondiente' => $t->mes_correspondiente,
                'destinoAbono' => $t->destino_abono,
                'monto' => floatval($t->monto),
            ];
        });

        // 3. Fetch water readings and map to JS format
        $waterReadings = WaterReading::all()->map(function ($w) {
            return [
                'id' => $w->id,
                'deptoId' => $w->department_id,
                'periodo' => $w->periodo,
                'lecturaInicial' => floatval($w->lectura_inicial),
                'lecturaFinal' => floatval($w->lectura_final),
                'excedente' => floatval($w->excedente),
                'precioPorM3' => floatval($w->precio_por_m3),
                'montoCobrado' => floatval($w->monto_cobrado),
            ];
        });

        // 4. Fetch audit logs and map to JS format
        $auditLogs = AuditLog::orderBy('timestamp', 'desc')->get()->map(function ($a) {
            return [
                'timestamp' => $a->timestamp,
                'action' => $a->action,
                'entityType' => $a->entity_type,
                'entityId' => $a->entity_id,
                'detail' => $a->detail,
            ];
        });

        // 5. Fetch money destinations
        $moneyDestinations = \App\Models\MoneyDestination::all()->map(function ($md) {
            return [
                'id' => $md->id,
                'nombre' => $md->nombre,
                'administracionActual' => (bool)$md->administracion_actual,
            ];
        });

        // 6. Fetch expense groups
        $expenseGroups = \App\Models\ExpenseGroup::all()->map(function ($eg) {
            return [
                'id' => $eg->id,
                'nombre' => $eg->nombre,
            ];
        });

        // 7. Fetch expense subgroups
        $expenseSubgroups = \App\Models\ExpenseSubgroup::all()->map(function ($esg) {
            return [
                'id' => $esg->id,
                'groupId' => $esg->expense_group_id,
                'nombre' => $esg->nombre,
            ];
        });

        // 8. Fetch payment methods
        $paymentMethods = \App\Models\PaymentMethod::all()->map(function ($pm) {
            return [
                'id' => $pm->id,
                'nombre' => $pm->nombre,
            ];
        });

        // 9. Fetch expenses
        $expenses = \App\Models\Expense::all()->map(function ($e) {
            return [
                'id' => $e->id,
                'fecha' => $e->fecha,
                'monto' => floatval($e->monto),
                'concepto' => $e->concepto,
                'groupId' => $e->expense_group_id,
                'subgroupId' => $e->expense_subgroup_id,
                'proveedor' => $e->proveedor,
                'paymentMethodId' => $e->payment_method_id,
                'documento' => $e->documento ? asset('storage/' . $e->documento) : null,
            ];
        });

        // 10. Fetch notices
        $notices = \App\Models\Notice::all()->map(function ($n) {
            return [
                'id' => $n->id,
                'titulo' => $n->titulo,
                'contenido' => $n->contenido,
                'fechaPublicacion' => $n->fecha_publicacion ? \Carbon\Carbon::parse($n->fecha_publicacion)->format('Y-m-d') : null,
                'fechaVigencia' => $n->fecha_vigencia ? \Carbon\Carbon::parse($n->fecha_vigencia)->format('Y-m-d') : null,
                'activo' => (bool)$n->activo,
            ];
        });

        return response()->json([
            'ja_departments' => $departments,
            'ja_transactions' => $transactions,
            'ja_water_readings' => $waterReadings,
            'ja_audit_log' => $auditLogs,
            'ja_money_destinations' => $moneyDestinations,
            'ja_expense_groups' => $expenseGroups,
            'ja_expense_subgroups' => $expenseSubgroups,
            'ja_payment_methods' => $paymentMethods,
            'ja_expenses' => $expenses,
            'ja_notices' => $notices,
        ]);
    }

    public function syncDepartments(Request $request)
    {
        $data = $request->input('data', []);

        DB::transaction(function () use ($data) {
            foreach ($data as $d) {
                Department::where('id', $d['id'])->update([
                    'contacto_nombre' => $d['contactoNombre'] ?? null,
                    'contacto_rol' => $d['contactoRol'] ?? 'propietario',
                    'contacto_email' => $d['contactoEmail'] ?? null,
                    'contacto_celular' => $d['contactoCelular'] ?? null,
                    'notas' => $d['notas'] ?? null,
                    'status' => $d['status'] ?? 'normal',
                    'con_convenio' => $d['conConvenio'] ?? false,
                ]);
            }
        });

        return response()->json(['status' => 'success']);
    }

    public function syncTransactions(Request $request)
    {
        $data = $request->input('data', []);

        DB::transaction(function () use ($data) {
            // Delete all and bulk insert is the cleanest sync for this scenario
            Transaction::truncate();

            $insertData = [];
            foreach ($data as $t) {
                $insertData[] = [
                    'id' => $t['id'],
                    'department_id' => $t['deptoId'],
                    'fecha' => $t['fecha'],
                    'tipo' => $t['tipo'],
                    'concepto' => $t['concepto'],
                    'mes_correspondiente' => $t['mesCorrespondiente'],
                    'destino_abono' => $t['destinoAbono'] ?? null,
                    'monto' => floatval($t['monto']),
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            $chunks = array_chunk($insertData, 500);
            foreach ($chunks as $chunk) {
                Transaction::insert($chunk);
            }
        });

        return response()->json(['status' => 'success']);
    }

    public function syncWaterReadings(Request $request)
    {
        $data = $request->input('data', []);

        DB::transaction(function () use ($data) {
            WaterReading::truncate();

            $insertData = [];
            foreach ($data as $w) {
                $insertData[] = [
                    'id' => $w['id'],
                    'department_id' => $w['deptoId'],
                    'periodo' => $w['periodo'],
                    'lectura_inicial' => floatval($w['lecturaInicial']),
                    'lectura_final' => floatval($w['lecturaFinal']),
                    'excedente' => floatval($w['excedente']),
                    'precio_por_m3' => floatval($w['precioPorM3']),
                    'monto_cobrado' => floatval($w['montoCobrado']),
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            $chunks = array_chunk($insertData, 500);
            foreach ($chunks as $chunk) {
                WaterReading::insert($chunk);
            }
        });

        return response()->json(['status' => 'success']);
    }

    public function syncAuditLogs(Request $request)
    {
        $data = $request->input('data', []);

        DB::transaction(function () use ($data) {
            AuditLog::truncate();

            $insertData = [];
            foreach ($data as $a) {
                $insertData[] = [
                    'timestamp' => $a['timestamp'],
                    'action' => $a['action'],
                    'entity_type' => $a['entityType'],
                    'entity_id' => $a['entityId'],
                    'detail' => $a['detail'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            $chunks = array_chunk($insertData, 500);
            foreach ($chunks as $chunk) {
                AuditLog::insert($chunk);
            }
        });

        return response()->json(['status' => 'success']);
    }

    public function syncExpenses(Request $request)
    {
        $data = $request->input('data', []);
        DB::transaction(function () use ($data) {
            \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
            \App\Models\Expense::truncate();
            $insertData = [];
            foreach ($data as $e) {
                $insertData[] = [
                    'id' => $e['id'],
                    'fecha' => $e['fecha'],
                    'monto' => floatval($e['monto']),
                    'concepto' => $e['concepto'],
                    'expense_group_id' => $e['groupId'] ?? null,
                    'expense_subgroup_id' => $e['subgroupId'] ?? null,
                    'proveedor' => $e['proveedor'],
                    'payment_method_id' => $e['paymentMethodId'] ?? null,
                    'documento' => $e['documento'] ?? null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            $chunks = array_chunk($insertData, 500);
            foreach ($chunks as $chunk) {
                \App\Models\Expense::insert($chunk);
            }
            \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();
        });
        return response()->json(['status' => 'success']);
    }

    public function syncExpenseGroups(Request $request)
    {
        $data = $request->input('data', []);
        DB::transaction(function () use ($data) {
            \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
            \App\Models\ExpenseGroup::truncate();
            foreach ($data as $g) {
                \App\Models\ExpenseGroup::create([
                    'id' => $g['id'],
                    'nombre' => $g['nombre'],
                ]);
            }
            \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();
        });
        return response()->json(['status' => 'success']);
    }

    public function syncExpenseSubgroups(Request $request)
    {
        $data = $request->input('data', []);
        DB::transaction(function () use ($data) {
            \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
            \App\Models\ExpenseSubgroup::truncate();
            foreach ($data as $s) {
                \App\Models\ExpenseSubgroup::create([
                    'id' => $s['id'],
                    'expense_group_id' => $s['groupId'],
                    'nombre' => $s['nombre'],
                ]);
            }
            \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();
        });
        return response()->json(['status' => 'success']);
    }

    public function syncPaymentMethods(Request $request)
    {
        $data = $request->input('data', []);
        DB::transaction(function () use ($data) {
            \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
            \App\Models\PaymentMethod::truncate();
            foreach ($data as $pm) {
                \App\Models\PaymentMethod::create([
                    'id' => $pm['id'],
                    'nombre' => $pm['nombre'],
                ]);
            }
            \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();
        });
        return response()->json(['status' => 'success']);
    }

    public function syncNotices(Request $request)
    {
        $data = $request->input('data', []);
        DB::transaction(function () use ($data) {
            \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
            \App\Models\Notice::truncate();
            foreach ($data as $n) {
                \App\Models\Notice::create([
                    'id' => $n['id'],
                    'titulo' => $n['titulo'],
                    'contenido' => $n['contenido'],
                    'fecha_publicacion' => $n['fechaPublicacion'],
                    'fecha_vigencia' => $n['fechaVigencia'] ?? null,
                    'activo' => (bool)($n['activo'] ?? true),
                ]);
            }
            \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();
        });
        return response()->json(['status' => 'success']);
    }
}
