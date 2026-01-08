import { DragDropContext, DropResult, Droppable } from '@hello-pangea/dnd';
import { ReactNode } from 'react';
import { KanbanColumn } from './column';

export interface KanbanColumnData {
    id: string;
    title: string;
    count?: number;
}

interface KanbanBoardProps<T> {
    columns: KanbanColumnData[];
    items: T[];
    groupBy: (item: T) => string;
    renderItem: (item: T) => ReactNode;
    onDragEnd: (result: DropResult) => void;
    isLoading?: boolean;
}

export function KanbanBoard<T extends { id: number | string }>({
    columns,
    items,
    groupBy,
    renderItem,
    onDragEnd,
}: KanbanBoardProps<T>) {
    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex h-full gap-4 overflow-x-auto pb-4">
                {columns.map((column) => {
                    const columnItems = items.filter(
                        (item) => groupBy(item) === column.id,
                    );
                    return (
                        <div
                            key={column.id}
                            className="w-72 min-w-[280px] flex-shrink-0"
                        >
                            <div className="flex h-full flex-col rounded-lg border border-neutral-200 bg-neutral-100/50">
                                <div className="flex items-center justify-between rounded-t-lg border-b border-neutral-200 bg-neutral-50/50 p-3 text-sm font-medium">
                                    <span className="text-neutral-700">
                                        {column.title}
                                    </span>
                                    <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-xs text-neutral-600">
                                        {columnItems.length}
                                    </span>
                                </div>

                                <Droppable droppableId={column.id}>
                                    {(provided, snapshot) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className={`min-h-[150px] flex-1 space-y-2 overflow-y-auto p-2 transition-colors ${
                                                snapshot.isDraggingOver
                                                    ? 'bg-neutral-100'
                                                    : ''
                                            }`}
                                        >
                                            {columnItems.map((item, index) => (
                                                <KanbanColumn
                                                    key={item.id}
                                                    id={item.id.toString()}
                                                    index={index}
                                                >
                                                    {renderItem(item)}
                                                </KanbanColumn>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        </div>
                    );
                })}
            </div>
        </DragDropContext>
    );
}
