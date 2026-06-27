<?php

namespace App\Filament\Resources;

use App\Filament\Resources\DepartmentResource\Pages;
use App\Models\Department;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class DepartmentResource extends Resource
{
    protected static ?string $model = Department::class;

    protected static ?string $navigationIcon = 'heroicon-o-building-office-2';

    protected static ?string $navigationLabel = 'Propiedades';

    protected static ?string $pluralLabel = 'Propiedades';

    protected static ?string $modelLabel = 'Propiedad';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('id')
                    ->label('ID de Propiedad (ej. T1-01)')
                    ->required()
                    ->disabled(fn (string $context): bool => $context === 'edit')
                    ->unique(ignoreRecord: true),
                
                Forms\Components\Select::make('torre')
                    ->label('Torre')
                    ->options([
                        'Torre 1' => 'Torre 1',
                        'Torre 2' => 'Torre 2',
                        'Torre 3' => 'Torre 3',
                    ])
                    ->required(),
                
                Forms\Components\Select::make('tipo')
                    ->label('Tipo')
                    ->options([
                        'departamento' => 'Departamento',
                        'local' => 'Local comercial',
                    ])
                    ->default('departamento')
                    ->required(),
                
                Forms\Components\TextInput::make('numero')
                    ->label('Número')
                    ->required(),
                
                Forms\Components\TextInput::make('contacto_nombre')
                    ->label('Contacto (Nombre)'),
                
                Forms\Components\Select::make('contacto_rol')
                    ->label('Contacto (Rol)')
                    ->options([
                        'propietario' => 'Propietario',
                        'administrador' => 'Administrador',
                    ])
                    ->default('propietario')
                    ->required(),
                
                Forms\Components\TextInput::make('contacto_email')
                    ->label('Contacto (Email)')
                    ->email(),
                
                Forms\Components\TextInput::make('contacto_celular')
                    ->label('Contacto (Celular)'),
                
                Forms\Components\Select::make('status')
                    ->label('Estado')
                    ->options([
                        'normal' => 'Ocupado / Normal',
                        'desocupado' => 'Desocupado',
                        'en_venta' => 'En Venta',
                    ])
                    ->default('normal')
                    ->required(),

                Forms\Components\Textarea::make('notas')
                    ->label('Notas Adicionales')
                    ->columnSpanFull(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->label('ID')
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('torre')
                    ->label('Torre')
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('tipo')
                    ->label('Tipo')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'departamento' => 'info',
                        'local' => 'success',
                        default => 'gray',
                    })
                    ->sortable(),
                Tables\Columns\TextColumn::make('numero')
                    ->label('Número')
                    ->sortable(),
                Tables\Columns\TextColumn::make('contacto_nombre')
                    ->label('Contacto')
                    ->searchable()
                    ->placeholder('Sin registrar'),
                Tables\Columns\TextColumn::make('contacto_rol')
                    ->label('Rol Contacto')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'administrador' => 'success',
                        'propietario' => 'gray',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('status')
                    ->label('Estado')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'normal' => 'success',
                        'desocupado' => 'danger',
                        'en_venta' => 'warning',
                        default => 'gray',
                    }),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('torre')
                    ->label('Torre')
                    ->options([
                        'Torre 1' => 'Torre 1',
                        'Torre 2' => 'Torre 2',
                        'Torre 3' => 'Torre 3',
                    ]),
                Tables\Filters\SelectFilter::make('status')
                    ->label('Estado')
                    ->options([
                        'normal' => 'Ocupado / Normal',
                        'desocupado' => 'Desocupado',
                        'en_venta' => 'En Venta',
                    ]),
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
            'index' => Pages\ListDepartments::route('/'),
            'create' => Pages\CreateDepartment::route('/create'),
            'edit' => Pages\EditDepartment::route('/{record}/edit'),
        ];
    }
}
