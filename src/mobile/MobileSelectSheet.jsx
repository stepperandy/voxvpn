import { Drawer } from 'vaul';
import { X, Check } from 'lucide-react';

export default function MobileSelectSheet({
  open,
  onOpenChange,
  options,
  value,
  onSelect,
  label,
}) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Drawer.Content
          className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-[#0d1120] border-t border-white/5"
          style={{
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          <div className="mx-auto w-12 h-1 bg-white/20 rounded-full my-3" />
          
          <div className="px-4 pb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-lg">{label}</h2>
              <button
                onClick={() => onOpenChange(false)}
                className="p-2 -mr-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto overscroll-none">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onSelect(option.value);
                    onOpenChange(false);
                  }}
                  className="w-full px-4 py-4 text-left rounded-lg bg-[#0b1627] hover:bg-[#0d1e38] border border-[#223654] flex items-center justify-between transition-colors min-h-[44px]"
                >
                  <span className="text-white font-medium">{option.label}</span>
                  {value === option.value && (
                    <Check size={20} className="text-cyan-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}