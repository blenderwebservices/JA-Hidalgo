<?php

namespace App\Filament\Resources\MoneyDestinationResource\Pages;

use App\Filament\Resources\MoneyDestinationResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListMoneyDestinations extends ListRecords
{
    protected static string $resource = MoneyDestinationResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
