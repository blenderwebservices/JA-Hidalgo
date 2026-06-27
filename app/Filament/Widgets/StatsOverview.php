<?php

namespace App\Filament\Widgets;

use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use App\Models\Department;
use App\Models\Transaction;

class StatsOverview extends BaseWidget
{
    protected function getStats(): array
    {
        $totalCargado = Transaction::where('tipo', 'cargo')->sum('monto');
        $totalCobrado = Transaction::where('tipo', 'abono')->sum('monto');
        $deudaPendiente = max(0, $totalCargado - $totalCobrado);
        $porcentajeCobranza = $totalCargado > 0 ? ($totalCobrado / $totalCargado) * 100 : 100;

        $ocupados = Department::where('status', 'normal')->count();
        $totalPropiedades = Department::count();

        return [
            Stat::make('Total Cargado', '$' . number_format($totalCargado, 2))
                ->description('Cargos fijos + excedentes agua')
                ->descriptionIcon('heroicon-m-arrow-trending-up')
                ->color('warning'),
            Stat::make('Total Cobrado / Recaudado', '$' . number_format($totalCobrado, 2))
                ->description(number_format($porcentajeCobranza, 1) . '% de cobranza acumulada')
                ->descriptionIcon('heroicon-m-check-circle')
                ->color('success'),
            Stat::make('Deuda Pendiente', '$' . number_format($deudaPendiente, 2))
                ->description('Saldo neto por cobrar')
                ->descriptionIcon('heroicon-m-exclamation-triangle')
                ->color($deudaPendiente > 0 ? 'danger' : 'success'),
            Stat::make('Ocupación', "{$ocupados} / {$totalPropiedades}")
                ->description('Propiedades en estado normal')
                ->descriptionIcon('heroicon-m-home')
                ->color('info'),
        ];
    }
}
