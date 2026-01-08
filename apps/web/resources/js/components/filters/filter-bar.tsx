import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { router } from '@inertiajs/react';
import { Filter, X } from 'lucide-react';
import { useState } from 'react';

interface FilterOption {
    label: string;
    value: string;
    type?: 'text' | 'number' | 'select';
    options?: { label: string; value: string }[];
}

interface Props {
    columns: FilterOption[];
    filters: any;
}

export default function FilterBar({ columns, filters }: Props) {
    const [open, setOpen] = useState(false);
    const [column, setColumn] = useState(filters.filter_column || '');
    const [operator, setOperator] = useState(
        filters.filter_operator || 'contains',
    );
    const [value, setValue] = useState(filters.filter_value || '');

    const applyFilter = () => {
        router.get(
            window.location.pathname,
            {
                ...filters,
                filter_column: column,
                filter_operator: operator,
                filter_value: value,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
        setOpen(false);
    };

    const clearFilter = () => {
        const { filter_column, filter_operator, filter_value, ...rest } =
            filters;
        router.get(window.location.pathname, rest, { preserveState: true });
        setColumn('');
        setValue('');
    };

    const hasActiveFilter = !!filters.filter_column;

    return (
        <div className="flex items-center gap-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant={hasActiveFilter ? 'default' : 'outline'}
                        size="sm"
                        className="h-9"
                    >
                        <Filter className="mr-2 h-4 w-4" />
                        Filters
                        {hasActiveFilter && (
                            <span className="ml-2 rounded-full bg-primary-foreground/20 px-1.5 py-0.5 text-xs">
                                1
                            </span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="start">
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <h4 className="leading-none font-medium">
                                Filter Records
                            </h4>
                            <p className="text-sm text-neutral-500">
                                Apply conditions to narrow down results.
                            </p>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="column">Column</Label>
                            <Select value={column} onValueChange={setColumn}>
                                <SelectTrigger id="column">
                                    <SelectValue placeholder="Select column" />
                                </SelectTrigger>
                                <SelectContent>
                                    {columns.map((col) => (
                                        <SelectItem
                                            key={col.value}
                                            value={col.value}
                                        >
                                            {col.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {column && (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="operator">Operator</Label>
                                    <Select
                                        value={operator}
                                        onValueChange={setOperator}
                                    >
                                        <SelectTrigger id="operator">
                                            <SelectValue placeholder="Select operator" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="contains">
                                                Contains
                                            </SelectItem>
                                            <SelectItem value="startsWith">
                                                Starts with
                                            </SelectItem>
                                            <SelectItem value="endsWith">
                                                Ends with
                                            </SelectItem>
                                            <SelectItem value="=">
                                                Equals
                                            </SelectItem>
                                            <SelectItem value="!=">
                                                Not equals
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="value">Value</Label>
                                    <Input
                                        id="value"
                                        value={value}
                                        onChange={(e) =>
                                            setValue(e.target.value)
                                        }
                                        placeholder="Enter value..."
                                    />
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    {hasActiveFilter && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                clearFilter();
                                                setOpen(false);
                                            }}
                                        >
                                            Clear
                                        </Button>
                                    )}
                                    <Button size="sm" onClick={applyFilter}>
                                        Apply Filter
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </PopoverContent>
            </Popover>

            {hasActiveFilter && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilter}
                    className="h-9 w-9 p-0"
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Clear filters</span>
                </Button>
            )}
        </div>
    );
}
