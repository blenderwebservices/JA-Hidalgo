<?php

namespace App\Filament\Pages\Auth;

use Filament\Pages\Auth\Register as BaseRegister;
use Filament\Forms\Components\Select;
use App\Models\Department;
use Illuminate\Database\Eloquent\Model;

class CustomRegister extends BaseRegister
{
    protected function getFormSchema(): array
    {
        return [
            $this->getNameFormComponent(),
            $this->getEmailFormComponent(),
            $this->getPasswordFormComponent(),
            $this->getPasswordConfirmationFormComponent(),
            Select::make('department_id')
                ->label('Departamento / Propiedad')
                ->options(
                    Department::query()
                        ->orderBy('torre')
                        ->orderBy('numero')
                        ->get()
                        ->mapWithKeys(fn ($d) => [$d->id => "{$d->torre} - {$d->numero} ({$d->id})"])
                )
                ->searchable()
                ->placeholder('Selecciona tu propiedad')
                ->required(),
        ];
    }

    protected function handleRegistration(array $data): Model
    {
        return $this->getUserModel()::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => bcrypt($data['password']),
            'role' => 'condomino', // Default role upon self-registration
            'department_id' => $data['department_id'],
        ]);
    }
}
