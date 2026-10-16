<?php
namespace App\Domain\ModulosComunes\Old\Services;

use App\Domain\ModulosComunes\Old\Models\OldItem;

class OldItemService
{
    public function create(array $data)
    {
        return OldItem::create($data);
    }

    public function update(OldItem $item, array $data)
    {
        $item->fill($data);
        $item->save();

        return $item;
    }

    public function store(array $data)
    {
        return $this->create($data);
    }
}