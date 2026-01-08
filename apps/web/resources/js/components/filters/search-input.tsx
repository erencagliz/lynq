import { Input } from '@/components/ui/input';
import { router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useDebounce } from 'use-debounce';

interface Props {
    placeholder?: string;
    defaultValue?: string;
}

export default function SearchInput({
    placeholder = 'Search...',
    defaultValue = '',
}: Props) {
    const [value, setValue] = useState(defaultValue);
    const [debouncedValue] = useDebounce(value, 300);
    const firstRender = useRef(true);

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }

        router.get(
            window.location.pathname,
            { search: debouncedValue },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    }, [debouncedValue]);

    return (
        <div className="relative w-full max-w-sm">
            <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-neutral-500" />
            <Input
                type="search"
                placeholder={placeholder}
                className="pl-9"
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
        </div>
    );
}
