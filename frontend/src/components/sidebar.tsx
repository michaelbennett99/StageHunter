import { cn } from '@/lib/utils';

type Props = {
  active?: boolean;
  children: React.ReactNode;
}

export default function Sidebar({ active, children }: Props): JSX.Element {
  return (
    <div
      className={cn(
        'absolute top-0 right-0 h-full md:hidden flex flex-col bg-background z-40 overflow-y-auto border-l px-2',
        active ? 'block' : 'hidden'
      )}
    >
      {children}
    </div>
  );
}
