<?php

namespace App\Filament\Resources;

use App\Filament\Resources\FacilityResource\Pages;
use App\Models\Facility;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class FacilityResource extends Resource
{
    protected static ?string $model = Facility::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                // Section for Basic Details
                Forms\Components\Section::make('Basic Details')
                    ->schema([
                        Forms\Components\TextInput::make('name')->required(),
                        Forms\Components\Textarea::make('description'),
                        Forms\Components\FileUpload::make('image_path')->image()->directory('facilities'),
                        Forms\Components\TextInput::make('price_member')->required(),
                        Forms\Components\TextInput::make('price_non_member')->required(),
                    ]),

                // Divider Section for Detailed Fields
                Forms\Components\Section::make('Detailed Information')
                    ->schema([
                        Forms\Components\Repeater::make('detailed_description')
                            ->label('Detailed Description')
                            ->schema([
                                Forms\Components\TextInput::make('label')->label('Label')->required(),
                                Forms\Components\Textarea::make('content')->label('Content')->required(),
                            ])
                            ->createItemButtonLabel('Add New Detail')
                            ->collapsible(),

                        Forms\Components\FileUpload::make('detailed_image_path')
                            ->label('Detailed Image')
                            ->image()
                            ->directory('facilities/details'),

                        Forms\Components\Repeater::make('rules_and_regulations')
                            ->label('Rules and Regulations')
                            ->schema([
                                Forms\Components\TextInput::make('rule')->label('Rule')->required(),
                            ])
                            ->createItemButtonLabel('Add New Rule')
                            ->collapsible(),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name'),
                Tables\Columns\TextColumn::make('description'),
                Tables\Columns\ImageColumn::make('image_path'),
                Tables\Columns\TextColumn::make('action_url'),
                Tables\Columns\TextColumn::make('price_member'),
                Tables\Columns\TextColumn::make('price_non_member'),
            ])
            ->filters([])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\DeleteBulkAction::make(),
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
            'index' => Pages\ListFacilities::route('/'),
            'create' => Pages\CreateFacility::route('/create'),
            'edit' => Pages\EditFacility::route('/{record}/edit'),
        ];
    }
}
