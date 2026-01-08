<?php

namespace App\Models\Traits;

use Illuminate\Database\Eloquent\Builder;

trait Filterable
{
    public function scopeFilter(Builder $query, array $filters)
    {
        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $fields = property_exists($this, 'searchableFields') ? $this->searchableFields : [];
                foreach ($fields as $index => $field) {
                    if ($index === 0) {
                        $q->where($field, 'like', '%' . $search . '%');
                    } else {
                        $q->orWhere($field, 'like', '%' . $search . '%');
                    }
                }
            });
        });

        $query->when($filters['trashed'] ?? null, function ($query, $trashed) {
            if ($trashed === 'with') {
                $query->withTrashed();
            } elseif ($trashed === 'only') {
                $query->onlyTrashed();
            }
        });

        if (isset($filters['filter_column'], $filters['filter_operator'], $filters['filter_value'])) {
            $column = $filters['filter_column'];
            $operator = $filters['filter_operator'];
            $value = $filters['filter_value'];

            switch ($operator) {
                case 'contains':
                    $query->where($column, 'like', "%{$value}%");
                    break;
                case 'startsWith':
                    $query->where($column, 'like', "{$value}%");
                    break;
                case 'endsWith':
                    $query->where($column, 'like', "%{$value}");
                    break;
                case '=':
                case '!=':
                case '>':
                case '<':
                case '>=':
                case '<=':
                    $query->where($column, $operator, $value);
                    break;
            }
        }
    }
}
