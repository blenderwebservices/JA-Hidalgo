<?php

namespace App\Filament\Resources;

use App\Filament\Resources\WaterReadingResource\Pages;
use App\Models\WaterReading;
use App\Models\Department;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class WaterReadingResource extends Resource
{
    protected static ?string $model = WaterReading::class;

    protected static ?string $navigationIcon = 'heroicon-o-beaker';

    protected static ?string $navigationLabel = 'Lecturas de Agua';

    protected static ?string $pluralLabel = 'Lecturas de Agua';

    protected static ?string $modelLabel = 'Lectura de Agua';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('id')
                    ->label('ID Lectura')
                    ->placeholder('ej. T1-01-2025-Q2')
                    ->required()
                    ->disabled(fn (string $context): bool => $context === 'edit'),

                Forms\Components\Select::make('department_id')
                    ->label('Propiedad')
                    ->options(
                        Department::query()
                            ->orderBy('torre')
                            ->orderBy('numero')
                            ->get()
                            ->mapWithKeys(fn ($d) => [$d->id => "{$d->torre} - {$d->numero} ({$d->id})"])
                    )
                    ->searchable()
                    ->required(),
                
                Forms\Components\Select::make('periodo')
                    ->label('Periodo')
                    ->options([
                        '2025-Q2' => 'Q2 2025 (Abr - Jun)',
                        '2025-Q3' => 'Q3 2025 (Jul - Sep)',
                        '2025-Q4' => 'Q4 2025 (Oct - Dic)',
                        '2026-Q1' => 'Q1 2026 (Ene - Mar)',
                        '2026-Q2' => 'Q2 2026 (Abr - Jun)',
                        '2026-Q3' => 'Q3 2026 (Jul - Sep)',
                        '2026-Q4' => 'Q4 2026 (Oct - Dic)',
                    ])
                    ->required(),
                
                Forms\Components\TextInput::make('lectura_inicial')
                    ->label('Lectura Inicial (m³)')
                    ->required()
                    ->numeric()
                    ->live()
                    ->afterStateUpdated(fn (Forms\Set $set, $state, Forms\Get $get) => self::calculateMonto($set, $state, $get)),
                
                Forms\Components\TextInput::make('lectura_final')
                    ->label('Lectura Final (m³)')
                    ->required()
                    ->numeric()
                    ->live()
                    ->afterStateUpdated(fn (Forms\Set $set, $state, Forms\Get $get) => self::calculateMonto($set, $state, $get)),
                
                Forms\Components\TextInput::make('excedente')
                    ->label('Excedente (m³)')
                    ->required()
                    ->numeric()
                    ->readOnly(),
                
                Forms\Components\TextInput::make('precio_por_m3')
                    ->label('Precio por m³ Excedente')
                    ->required()
                    ->numeric()
                    ->prefix('$')
                    ->live()
                    ->afterStateUpdated(fn (Forms\Set $set, $state, Forms\Get $get) => self::calculateMonto($set, $state, $get)),
                
                Forms\Components\TextInput::make('monto_cobrado')
                    ->label('Monto Cobrado ($)')
                    ->required()
                    ->numeric()
                    ->prefix('$')
                    ->readOnly(),
            ]);
    }

    protected static function calculateMonto(Forms\Set $set, $state, Forms\Get $get)
    {
        $inicial = floatval($get('lectura_inicial') ?: 0);
        $final = floatval($get('lectura_final') ?: 0);
        $precio = floatval($get('precio_por_m3') ?: 0);

        $excedente = max(0, $final - $inicial);
        $monto = $excedente * $precio;

        $set('excedente', $excedente);
        $set('monto_cobrado', $monto);
        
        // Also auto-generate ID if empty or creating
        $dept = $get('department_id');
        $period = $get('periodo');
        if ($dept && $period) {
            $set('id', "{$dept}-{$period}");
        }
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->label('ID')
                    ->searchable(),
                Tables\Columns\TextColumn::make('department_id')
                    ->label('Propiedad')
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('periodo')
                    ->label('Periodo')
                    ->sortable(),
                Tables\Columns\TextColumn::make('lectura_inicial')
                    ->label('Lectura Inicial')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('lectura_final')
                    ->label('Lectura Final')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('excedente')
                    ->label('Excedente')
                    ->numeric()
                    ->suffix(' m³')
                    ->sortable(),
                Tables\Columns\TextColumn::make('precio_por_m3')
                    ->label('Precio m³')
                    ->money('MXN'),
                Tables\Columns\TextColumn::make('monto_cobrado')
                    ->label('Monto Excedente')
                    ->money('MXN')
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('periodo'),
                Tables\Filters\SelectFilter::make('department_id')
                    ->label('Propiedad')
                    ->options(
                        Department::query()
                            ->orderBy('torre')
                            ->orderBy('numero')
                            ->get()
                            ->mapWithKeys(fn ($d) => [$d->id => "{$d->torre} - {$d->numero}"])
                    )->searchable(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListWaterReadings::route('/'),
            'create' => Pages\CreateWaterReading::route('/create'),
            'edit' => Pages\EditWaterReading::route('/{record}/edit'),
        ];
    }
}
