<?php

namespace App\Filament\Resources\MoneyDestinationResource\Pages;

use App\Filament\Resources\MoneyDestinationResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditMoneyDestination extends EditRecord
{
    protected static string $resource = MoneyDestinationResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
