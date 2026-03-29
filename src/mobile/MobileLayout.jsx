import MobileHeader from './MobileHeader';
import MobileBottomNav from './MobileBottomNav';

export default function MobileLayout({ children, headerTitle, rootPath = '/' }) {
  return (
    <div className="h-screen flex flex-col bg-[#080c18]">
      {/* Header */}
      <MobileHeader title={headerTitle} rootPath={rootPath} />

      {/* Content */}
      <main
        className="flex-1 overflow-y-auto overscroll-none"
        style={{
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
        }}
      >
        {children}
      </main>

      {/* Bottom Nav */}
      <MobileBottomNav />
    </div>
  );
}