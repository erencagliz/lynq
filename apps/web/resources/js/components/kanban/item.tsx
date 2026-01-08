import { cn } from '@/lib/utils'; // Assuming you have a cn utility, otherwise remove
import { ReactNode } from 'react';

interface KanbanItemProps {
    className?: string;
    children: ReactNode;
    onClick?: () => void;
}

export function KanbanItem({ className, children, onClick }: KanbanItemProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                'cursor-grab rounded-md border border-neutral-200 bg-white p-3 shadow-sm transition-all hover:border-blue-200/60 hover:shadow-md active:cursor-grabbing',
                className,
            )}
        >
            {children}
        </div>
    );
}
