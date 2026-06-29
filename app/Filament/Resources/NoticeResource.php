<?php

namespace App\Filament\Resources;

use App\Filament\Resources\NoticeResource\Pages;
use App\Filament\Resources\NoticeResource\RelationManagers;
use App\Models\Notice;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class NoticeResource extends Resource
{
    protected static ?string $model = Notice::class;

    protected static ?string $navigationIcon = 'heroicon-o-megaphone';

    protected static ?string $navigationLabel = 'Pizarra de Avisos';

    protected static ?string $pluralLabel = 'Pizarra de Avisos';

    protected static ?string $modelLabel = 'Aviso';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('titulo')
                    ->label('Título del Aviso')
                    ->required()
                    ->columnSpanFull(),
                
                Forms\Components\Textarea::make('contenido')
                    ->label('Contenido del Aviso')
                    ->required()
                    ->rows(5)
                    ->columnSpanFull(),
                
                Forms\Components\DatePicker::make('fecha_publicacion')
                    ->label('Fecha de Publicación')
                    ->default(now())
                    ->required(),
                
                Forms\Components\DatePicker::make('fecha_vigencia')
                    ->label('Vigente hasta (Opcional)'),
                
                Forms\Components\Toggle::make('activo')
                    ->label('Activo')
                    ->default(true)
                    ->required(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('titulo')
                    ->label('Título')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('fecha_publicacion')
                    ->label('Publicado')
                    ->date()
                    ->sortable(),
                Tables\Columns\TextColumn::make('fecha_vigencia')
                    ->label('Vigente hasta')
                    ->date()
                    ->sortable(),
                Tables\Columns\IconColumn::make('activo')
                    ->label('Activo')
                    ->boolean()
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('activo')
                    ->label('Solo activos'),
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
            'index' => Pages\ListNotices::route('/'),
            'create' => Pages\CreateNotice::route('/create'),
            'edit' => Pages\EditNotice::route('/{record}/edit'),
        ];
    }
}
