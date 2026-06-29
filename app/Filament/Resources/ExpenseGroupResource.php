<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ExpenseGroupResource\Pages;
use App\Filament\Resources\ExpenseGroupResource\RelationManagers;
use App\Models\ExpenseGroup;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class ExpenseGroupResource extends Resource
{
    protected static ?string $model = ExpenseGroup::class;

    protected static ?string $navigationIcon = 'heroicon-o-folder';

    protected static ?string $navigationLabel = 'Grupos de Gastos';

    protected static ?string $pluralLabel = 'Grupos de Gastos';

    protected static ?string $modelLabel = 'Grupo de Gasto';

    protected static ?string $navigationGroup = 'Configuración de Gastos';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('nombre')
                    ->label('Nombre del Grupo')
                    ->required()
                    ->unique(ignoreRecord: true),
                
                Forms\Components\Repeater::make('subgroups')
                    ->relationship('subgroups')
                    ->schema([
                        Forms\Components\TextInput::make('nombre')
                            ->label('Nombre del Subgrupo')
                            ->required(),
                    ])
                    ->label('Subgrupos de Gasto')
                    ->columnSpanFull()
                    ->grid(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('nombre')
                    ->label('Grupo de Gasto')
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('subgroups.nombre')
                    ->label('Subgrupos')
                    ->badge()
                    ->color('gray')
                    ->separator(', '),
            ])
            ->filters([
                //
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
            'index' => Pages\ListExpenseGroups::route('/'),
            'create' => Pages\CreateExpenseGroup::route('/create'),
            'edit' => Pages\EditExpenseGroup::route('/{record}/edit'),
        ];
    }
}
