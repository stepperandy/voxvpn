// Performance optimization utilities

export function enableCaching() {
  // Cache API responses for 5 minutes
  if ('caches' in window) {
    navigator.serviceWorker?.register('/service-worker.js');
  }
}

export function optimizeImages() {
  // Lazy load images
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          observer.unobserve(img);
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      observer.observe(img);
    });
  }
}

export function prefetchResources() {
  // Prefetch critical resources
  const links = [
    { rel: 'dns-prefetch', href: 'https://api.voxvpn.com' },
    { rel: 'preconnect', href: 'https://cdn.voxvpn.com' },
  ];

  links.forEach(({ rel, href }) => {
    const link = document.createElement('link');
    link.rel = rel;
    link.href = href;
    document.head.appendChild(link);
  });
}

export function measurePerformance() {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        console.log(`${entry.name}: ${entry.duration.toFixed(2)}ms`);
      });
    });

    observer.observe({ entryTypes: ['navigation', 'resource', 'paint'] });
  }
}

export function enableCompressionHints() {
  // Tell browser to enable compression for API calls
  const headers = {
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'public, max-age=300',
  };
  return headers;
}