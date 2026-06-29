<?php

namespace App\Filament\Resources;

use App\Filament\Resources\TransactionResource\Pages;
use App\Models\Transaction;
use App\Models\Department;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class TransactionResource extends Resource
{
    protected static ?string $model = Transaction::class;

    protected static ?string $navigationIcon = 'heroicon-o-credit-card';

    protected static ?string $navigationLabel = 'Transacciones';

    protected static ?string $pluralLabel = 'Transacciones';

    protected static ?string $modelLabel = 'Transacción';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('id')
                    ->label('ID Transacción')
                    ->required()
                    ->default(fn () => 'TX-' . strtoupper(uniqid())),
                
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
                
                Forms\Components\DatePicker::make('fecha')
                    ->label('Fecha')
                    ->default(now())
                    ->required(),
                
                Forms\Components\Select::make('tipo')
                    ->label('Tipo')
                    ->options([
                        'cargo' => 'Cargo',
                        'abono' => 'Abono',
                    ])
                    ->required(),
                
                Forms\Components\TextInput::make('concepto')
                    ->label('Concepto')
                    ->placeholder('ej. Cuota Mantenimiento, Excedente Agua Q2 2025, etc.')
                    ->required(),
                
                Forms\Components\TextInput::make('mes_correspondiente')
                    ->label('Mes Correspondiente')
                    ->placeholder('YYYY-MM')
                    ->required(),
                
                Forms\Components\Select::make('destino_abono')
                    ->label('Destino del Dinero (Solo Abonos)')
                    ->options(fn () => \App\Models\MoneyDestination::pluck('nombre', 'nombre')->toArray())
                    ->nullable(),
                
                Forms\Components\TextInput::make('monto')
                    ->label('Monto ($)')
                    ->required()
                    ->numeric()
                    ->prefix('$'),
            ]);
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
                Tables\Columns\TextColumn::make('fecha')
                    ->label('Fecha')
                    ->date()
                    ->sortable(),
                Tables\Columns\TextColumn::make('tipo')
                    ->label('Tipo')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'cargo' => 'danger',
                        'abono' => 'success',
                        default => 'gray',
                    })
                    ->sortable(),
                Tables\Columns\TextColumn::make('concepto')
                    ->label('Concepto')
                    ->searchable(),
                Tables\Columns\TextColumn::make('mes_correspondiente')
                    ->label('Periodo')
                    ->sortable(),
                Tables\Columns\TextColumn::make('destino_abono')
                    ->label('Destino')
                    ->placeholder('-'),
                Tables\Columns\TextColumn::make('monto')
                    ->label('Monto')
                    ->money('MXN')
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('tipo')
                    ->options([
                        'cargo' => 'Cargo',
                        'abono' => 'Abono',
                    ]),
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
            'index' => Pages\ListTransactions::route('/'),
            'create' => Pages\CreateTransaction::route('/create'),
            'edit' => Pages\EditTransaction::route('/{record}/edit'),
        ];
    }
}
