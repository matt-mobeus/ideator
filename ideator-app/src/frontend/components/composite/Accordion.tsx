import { useState, type ReactNode } from 'react';

interface AccordionSection {
  id: string;
  title: ReactNode;
  content: ReactNode;
  badge?: ReactNode;
}

interface AccordionProps {
  sections: AccordionSection[];
  defaultOpen?: string[];
  allowMultiple?: boolean;
}

export function Accordion({ sections, defaultOpen = [], allowMultiple = true }: AccordionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set(defaultOpen));

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(allowMultiple ? prev : []);
      if (prev.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-1">
      {sections.map((section) => {
        const isOpen = openIds.has(section.id);
        return (
          <div key={section.id} className="border border-[var(--bg-tertiary)] rounded-[var(--radius-md)] overflow-hidden">
            <button
              onClick={() => toggle(section.id)}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[var(--bg-tertiary)]/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className={`text-xs transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}>▸</span>
                <span className="text-sm font-medium">{section.title}</span>
                {section.badge}
              </div>
            </button>
            {isOpen && (
              <div className="px-4 pb-4 pt-1">{section.content}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
