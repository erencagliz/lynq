'use client';

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
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    Filter,
    Search,
    Settings2,
    Trash2,
} from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import { useDebounce } from '@/hooks/use-debounce';
import { router } from '@inertiajs/react';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    placeholder?: string;
    onDelete?: (selectedRows: TData[]) => void;
    meta?: {
        current_page: number;
        last_page: number;
        total: number;
        path: string;
        per_page: number;
    };
    filters?: {
        search?: string;
        filter_column?: string;
        filter_operator?: string;
        filter_value?: string;
    };
    hideToolbar?: boolean;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    placeholder = 'Search...',
    onDelete,
    meta,
    filters,
    hideToolbar = false,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = React.useState<string>(
        filters?.search || '',
    );
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>(
            filters?.filter_column
                ? [
                      {
                          id: filters.filter_column,
                          value: {
                              operator: filters.filter_operator,
                              value: filters.filter_value,
                          },
                      },
                  ]
                : [],
        );

    // Advanced Filter State
    const [filterColumn, setFilterColumn] = React.useState<string>(
        filters?.filter_column || '',
    );
    const [filterOperator, setFilterOperator] = React.useState<string>(
        filters?.filter_operator || 'contains',
    );
    const [filterValue, setFilterValue] = React.useState<string>(
        filters?.filter_value || '',
    );

    // Define custom filter function
    const advancedFilterFn = (row: any, columnId: string, filterValue: any) => {
        const { operator, value } = filterValue;
        if (!value && operator !== 'isEmpty' && operator !== 'isNotEmpty')
            return true;

        let rowValue = row.getValue(columnId);
        if (rowValue === undefined || rowValue === null) return false;

        // Handle object values (e.g. Owner object, Account object)
        if (typeof rowValue === 'object') {
            rowValue =
                rowValue.name ||
                rowValue.full_name ||
                rowValue.label ||
                JSON.stringify(rowValue);
        }

        const sRowValue = String(rowValue).toLowerCase();
        const sFilterValue = String(value).toLowerCase();
        const nRowValue = parseFloat(rowValue);
        const nFilterValue = parseFloat(value);

        switch (operator) {
            case '=':
                return sRowValue === sFilterValue;
            case '!=':
                return sRowValue !== sFilterValue;
            case '>':
                return nRowValue > nFilterValue;
            case '<':
                return nRowValue < nFilterValue;
            case '>=':
                return nRowValue >= nFilterValue;
            case '<=':
                return nRowValue <= nFilterValue;
            case 'contains':
                return sRowValue.includes(sFilterValue);
            case 'startsWith':
                return sRowValue.startsWith(sFilterValue);
            case 'endsWith':
                return sRowValue.endsWith(sFilterValue);
            default:
                return true;
        }
    };

    // Debounced Search
    const debouncedSearch = useDebounce(globalFilter, 500);

    React.useEffect(() => {
        if (meta && debouncedSearch !== (filters?.search || '')) {
            updateParams({ search: debouncedSearch, page: 1 });
        }
    }, [debouncedSearch]);

    const updateParams = (newParams: Record<string, any>) => {
        const params = {
            search: globalFilter,
            filter_column: filterColumn,
            filter_operator: filterOperator,
            filter_value: filterValue,
            ...newParams,
        };

        router.get(window.location.pathname, params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const table = useReactTable({
        data,
        columns: meta
            ? columns
            : (columns.map((col) => ({
                  ...col,
                  filterFn: 'advanced',
              })) as unknown as ColumnDef<TData, any>[]),
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: meta ? undefined : getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: meta ? undefined : getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onColumnFiltersChange: setColumnFilters,
        manualPagination: !!meta,
        manualFiltering: !!meta,
        filterFns: {
            advanced: advancedFilterFn,
        },
        state: {
            sorting,
            globalFilter,
            columnVisibility,
            rowSelection,
            columnFilters,
        },
    });

    const applyFilter = () => {
        if (!filterColumn) return;
        updateParams({
            filter_column: filterColumn,
            filter_operator: filterOperator,
            filter_value: filterValue,
            page: 1,
        });
    };

    const clearFilters = () => {
        setFilterColumn('');
        setFilterOperator('contains');
        setFilterValue('');
        updateParams({
            filter_column: '',
            filter_operator: '',
            filter_value: '',
            page: 1,
        });
    };

    const selectedRows = table.getFilteredSelectedRowModel().rows;

    return (
        <div className="flex flex-col gap-4">
            {!hideToolbar && (
                <div className="flex items-center justify-between gap-4">
                    <div className="relative max-w-sm flex-1">
                        <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-neutral-500" />
                        <Input
                            placeholder={placeholder}
                            value={globalFilter ?? ''}
                            onChange={(event) =>
                                setGlobalFilter(event.target.value)
                            }
                            className="bg-white pl-9"
                        />
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        {onDelete && selectedRows.length > 0 && (
                            <Button
                                variant="destructive"
                                size="sm"
                                className="flex gap-2"
                                onClick={() => {
                                    onDelete(
                                        selectedRows.map((row) => row.original),
                                    );
                                    setRowSelection({}); // Clear selection after delete
                                }}
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete ({selectedRows.length})
                            </Button>
                        )}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={`flex gap-2 ${columnFilters.length > 0 ? 'border-blue-500 bg-blue-50 text-blue-600' : ''}`}
                                >
                                    <Filter className="h-4 w-4" />
                                    Filter{' '}
                                    {columnFilters.length > 0 &&
                                        `(${columnFilters.length})`}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-4" align="end">
                                <div className="space-y-4">
                                    <h4 className="leading-none font-medium">
                                        Advanced Filter
                                    </h4>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-neutral-500">
                                            Column
                                        </label>
                                        <Select
                                            value={filterColumn}
                                            onValueChange={setFilterColumn}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select column" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {table
                                                    .getAllColumns()
                                                    .filter(
                                                        (col) =>
                                                            col.getCanFilter() &&
                                                            col.id !==
                                                                'select' &&
                                                            col.id !==
                                                                'actions',
                                                    )
                                                    .map((col) => (
                                                        <SelectItem
                                                            key={col.id}
                                                            value={col.id}
                                                        >
                                                            {col.id
                                                                .replace(
                                                                    /_/g,
                                                                    ' ',
                                                                )
                                                                .replace(
                                                                    /\./g,
                                                                    ' ',
                                                                )
                                                                .toUpperCase()}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-neutral-500">
                                                Operator
                                            </label>
                                            <Select
                                                value={filterOperator}
                                                onValueChange={
                                                    setFilterOperator
                                                }
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="=">
                                                        =
                                                    </SelectItem>
                                                    <SelectItem value="!=">
                                                        !=
                                                    </SelectItem>
                                                    <SelectItem value=">">
                                                        &gt;
                                                    </SelectItem>
                                                    <SelectItem value="<">
                                                        &lt;
                                                    </SelectItem>
                                                    <SelectItem value=">=">
                                                        &gt;=
                                                    </SelectItem>
                                                    <SelectItem value="<=">
                                                        &lt;=
                                                    </SelectItem>
                                                    <SelectItem value="contains">
                                                        Contains
                                                    </SelectItem>
                                                    <SelectItem value="startsWith">
                                                        Starts With
                                                    </SelectItem>
                                                    <SelectItem value="endsWith">
                                                        Ends With
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-neutral-500">
                                                Value
                                            </label>
                                            <Input
                                                placeholder="Value..."
                                                value={filterValue}
                                                onChange={(e) =>
                                                    setFilterValue(
                                                        e.target.value,
                                                    )
                                                }
                                                onKeyDown={(e) =>
                                                    e.key === 'Enter' &&
                                                    applyFilter()
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={clearFilters}
                                        >
                                            Reset
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="flex-1"
                                            onClick={applyFilter}
                                        >
                                            Apply Filter
                                        </Button>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="flex gap-2"
                                >
                                    <Settings2 className="h-4 w-4" />
                                    View
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="w-[150px]"
                            >
                                <DropdownMenuLabel>
                                    Toggle columns
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {table
                                    .getAllColumns()
                                    .filter((column) => column.getCanHide())
                                    .map((column) => {
                                        return (
                                            <DropdownMenuCheckboxItem
                                                key={column.id}
                                                className="capitalize"
                                                checked={column.getIsVisible()}
                                                onCheckedChange={(value) =>
                                                    column.toggleVisibility(
                                                        !!value,
                                                    )
                                                }
                                            >
                                                {column.id.replace(/_/g, ' ')}
                                            </DropdownMenuCheckboxItem>
                                        );
                                    })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            )}
            <div className="overflow-hidden rounded-md border bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead
                                            key={header.id}
                                            className={
                                                header.column.getCanSort()
                                                    ? 'cursor-pointer select-none hover:bg-neutral-50'
                                                    : ''
                                            }
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            <div
                                                className={`flex items-center gap-2 ${header.id === 'actions' ? 'justify-end' : ''}`}
                                            >
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                          header.column
                                                              .columnDef.header,
                                                          header.getContext(),
                                                      )}
                                                {header.column.getCanSort() && (
                                                    <div className="w-4">
                                                        {{
                                                            asc: (
                                                                <ArrowUp className="h-4 w-4" />
                                                            ),
                                                            desc: (
                                                                <ArrowDown className="h-4 w-4" />
                                                            ),
                                                        }[
                                                            header.column.getIsSorted() as string
                                                        ] ?? (
                                                            <ArrowUpDown className="h-3 w-3 text-neutral-300" />
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={
                                        row.getIsSelected() && 'selected'
                                    }
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className={
                                                cell.column.id === 'actions'
                                                    ? 'text-right'
                                                    : ''
                                            }
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center text-neutral-500"
                                >
                                    No results found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between px-2">
                <div className="text-sm font-medium text-neutral-500">
                    Showing{' '}
                    {meta
                        ? `${(meta.current_page - 1) * meta.per_page + 1} to ${Math.min(meta.current_page * meta.per_page, meta.total)} of ${meta.total}`
                        : `${data.length} results`}
                </div>
                <div className="flex items-center gap-2">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() =>
                                        meta
                                            ? updateParams({
                                                  page: meta.current_page - 1,
                                              })
                                            : table.previousPage()
                                    }
                                    disabled={
                                        meta
                                            ? meta.current_page <= 1
                                            : !table.getCanPreviousPage()
                                    }
                                    className={
                                        (
                                            meta
                                                ? meta.current_page <= 1
                                                : !table.getCanPreviousPage()
                                        )
                                            ? 'pointer-events-none opacity-50'
                                            : 'cursor-pointer'
                                    }
                                />
                            </PaginationItem>

                            <PaginationItem>
                                <div className="px-4 text-sm font-medium">
                                    Page{' '}
                                    {meta
                                        ? meta.current_page
                                        : table.getState().pagination
                                              .pageIndex + 1}{' '}
                                    of{' '}
                                    {meta
                                        ? meta.last_page
                                        : table.getPageCount()}
                                </div>
                            </PaginationItem>

                            <PaginationItem>
                                <PaginationNext
                                    onClick={() =>
                                        meta
                                            ? updateParams({
                                                  page: meta.current_page + 1,
                                              })
                                            : table.nextPage()
                                    }
                                    disabled={
                                        meta
                                            ? meta.current_page >=
                                              meta.last_page
                                            : !table.getCanNextPage()
                                    }
                                    className={
                                        (
                                            meta
                                                ? meta.current_page >=
                                                  meta.last_page
                                                : !table.getCanNextPage()
                                        )
                                            ? 'pointer-events-none opacity-50'
                                            : 'cursor-pointer'
                                    }
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </div>
        </div>
    );
}
