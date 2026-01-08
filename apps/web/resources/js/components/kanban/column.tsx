import { Draggable } from '@hello-pangea/dnd';
import { ReactNode } from 'react';

interface KanbanColumnProps {
    id: string;
    index: number;
    children: ReactNode;
}

export function KanbanColumn({ id, index, children }: KanbanColumnProps) {
    return (
        <Draggable draggableId={id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`transform transition-transform ${
                        snapshot.isDragging ? 'z-50 rotate-2 shadow-xl' : ''
                    }`}
                    style={provided.draggableProps.style}
                >
                    {children}
                </div>
            )}
        </Draggable>
    );
}
