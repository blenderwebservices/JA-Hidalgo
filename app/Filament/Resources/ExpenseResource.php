<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ExpenseResource\Pages;
use App\Filament\Resources\ExpenseResource\RelationManagers;
use App\Models\Expense;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class ExpenseResource extends Resource
{
    protected static ?string $model = Expense::class;

    protected static ?string $navigationIcon = 'heroicon-o-banknotes';

    protected static ?string $navigationLabel = 'Gastos (Egresos)';

    protected static ?string $pluralLabel = 'Gastos (Egresos)';

    protected static ?string $modelLabel = 'Gasto';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('id')
                    ->label('ID Gasto')
                    ->required()
                    ->default(fn () => 'EXP-' . strtoupper(uniqid()))
                    ->disabled(fn (string $context): bool => $context === 'edit')
                    ->unique(ignoreRecord: true),
                
                Forms\Components\DatePicker::make('fecha')
                    ->label('Fecha')
                    ->default(now())
                    ->required(),
                
                Forms\Components\TextInput::make('monto')
                    ->label('Monto ($)')
                    ->required()
                    ->numeric()
                    ->prefix('$'),
                
                Forms\Components\TextInput::make('concepto')
                    ->label('Concepto')
                    ->required(),
                
                Forms\Components\Select::make('expense_group_id')
                    ->label('Grupo de Gasto')
                    ->relationship('group', 'nombre')
                    ->live()
                    ->required(),
                
                Forms\Components\Select::make('expense_subgroup_id')
                    ->label('Subgrupo de Gasto')
                    ->options(fn (Forms\Get $get) => \App\Models\ExpenseSubgroup::where('expense_group_id', $get('expense_group_id'))->pluck('nombre', 'id'))
                    ->required(),
                
                Forms\Components\TextInput::make('proveedor')
                    ->label('Proveedor')
                    ->required(),
                
                Forms\Components\Select::make('payment_method_id')
                    ->label('Forma de Pago')
                    ->relationship('paymentMethod', 'nombre')
                    ->required(),
                
                Forms\Components\Toggle::make('soporte')
                    ->label('¿Tiene Soporte?')
                    ->inline(false)
                    ->default(false),
                
                Forms\Components\FileUpload::make('documento')
                    ->label('Documento (Factura / Recibo)')
                    ->directory('expenses-docs')
                    ->disk('public')
                    ->visibility('public')
                    ->downloadable()
                    ->openable()
                    ->columnSpanFull(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->label('ID')
                    ->searchable(),
                Tables\Columns\TextColumn::make('fecha')
                    ->label('Fecha')
                    ->date()
                    ->sortable(),
                Tables\Columns\TextColumn::make('concepto')
                    ->label('Concepto')
                    ->searchable(),
                Tables\Columns\TextColumn::make('monto')
                    ->label('Monto')
                    ->money('MXN')
                    ->sortable(),
                Tables\Columns\TextColumn::make('group.nombre')
                    ->label('Grupo')
                    ->sortable(),
                Tables\Columns\TextColumn::make('subgroup.nombre')
                    ->label('Subgrupo')
                    ->sortable(),
                Tables\Columns\TextColumn::make('proveedor')
                    ->label('Proveedor')
                    ->searchable(),
                Tables\Columns\TextColumn::make('paymentMethod.nombre')
                    ->label('Forma de Pago')
                    ->sortable(),
                Tables\Columns\IconColumn::make('soporte')
                    ->label('Soporte')
                    ->boolean(),
                Tables\Columns\TextColumn::make('documento')
                    ->label('Documento')
                    ->formatStateUsing(fn ($state) => $state ? 'Ver Doc' : '-')
                    ->url(fn ($record) => $record->documento ? \Illuminate\Support\Facades\Storage::disk('public')->url($record->documento) : null)
                    ->openUrlInNewTab()
                    ->color(fn ($state) => $state ? 'primary' : 'gray'),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('expense_group_id')
                    ->label('Grupo de Gasto')
                    ->relationship('group', 'nombre'),
                Tables\Filters\SelectFilter::make('payment_method_id')
                    ->label('Forma de Pago')
                    ->relationship('paymentMethod', 'nombre'),
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
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListExpenses::route('/'),
            'create' => Pages\CreateExpense::route('/create'),
            'edit' => Pages\EditExpense::route('/{record}/edit'),
        ];
    }
}
