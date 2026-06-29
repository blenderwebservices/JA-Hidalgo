<?php

namespace App\Filament\Resources;

use App\Filament\Resources\MoneyDestinationResource\Pages;
use App\Filament\Resources\MoneyDestinationResource\RelationManagers;
use App\Models\MoneyDestination;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class MoneyDestinationResource extends Resource
{
    protected static ?string $model = MoneyDestination::class;

    protected static ?string $navigationIcon = 'heroicon-o-wallet';

    protected static ?string $navigationLabel = 'Destinos de Dinero';

    protected static ?string $pluralLabel = 'Destinos de Dinero';

    protected static ?string $modelLabel = 'Destino de Dinero';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('nombre')
                    ->label('Nombre de la Cuenta / Destino')
                    ->required()
                    ->unique(ignoreRecord: true),
                Forms\Components\Toggle::make('administracion_actual')
                    ->label('Administración Actual')
                    ->default(true)
                    ->required(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('nombre')
                    ->label('Nombre')
                    ->sortable()
                    ->searchable(),
                Tables\Columns\IconColumn::make('administracion_actual')
                    ->label('Administración Actual')
                    ->boolean()
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('administracion_actual')
                    ->label('Administración Actual'),
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
            'index' => Pages\ListMoneyDestinations::route('/'),
            'create' => Pages\CreateMoneyDestination::route('/create'),
            'edit' => Pages\EditMoneyDestination::route('/{record}/edit'),
        ];
    }
}
