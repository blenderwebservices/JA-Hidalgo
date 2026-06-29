<?php

namespace App\Filament\Resources\ExpenseGroupResource\Pages;

use App\Filament\Resources\ExpenseGroupResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditExpenseGroup extends EditRecord
{
    protected static string $resource = ExpenseGroupResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
