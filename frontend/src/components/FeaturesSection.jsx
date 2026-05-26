import React from 'react';

const features = [
  {
    icon: 'table_view',
    title: 'Dynamic Tables',
    description: 'Automatically creates PostgreSQL tables based on your CSV structure.',
  },
  {
    icon: 'cloud_upload',
    title: 'Streaming Ingestion',
    description: 'Stream and batch insert data for high performance and low memory usage.',
  },
  {
    icon: 'manage_search',
    title: 'Powerful Search',
    description: 'Search across columns with filters, sorting and advanced queries.',
  },
  {
    icon: 'layers',
    title: 'Server-side Pagination',
    description: 'Efficient pagination to handle massive datasets without slowdown.',
  },
  {
    icon: 'verified_user',
    title: 'Secure & Safe',
    description: 'SQL sanitization and validation to protect against injection attacks.',
  },
  {
    icon: 'speed',
    title: 'High Performance',
    description: 'Built with optimized queries and batch processing for speed at scale.',
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 bg-surface-container-low">
      {/* Heading */}
      <div className="max-w-[1200px] mx-auto px-6 text-center mb-16 animate-on-scroll">
        <h2 className="text-[40px] font-bold leading-tight tracking-[-0.01em] mb-4">Features</h2>
        <p className="text-[18px] leading-[1.6] text-on-surface-variant">
          Everything you need to work with large datasets efficiently.
        </p>
      </div>

      {/* Feature Cards Grid */}
      <div className="max-w-[1200px] mx-auto px-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="glass-card p-8 rounded-2xl group hover:-translate-y-2 transition-all duration-300 animate-on-scroll"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl">{feature.icon}</span>
            </div>
            <h3 className="text-[24px] font-semibold leading-tight mb-3">{feature.title}</h3>
            <p className="text-[16px] leading-[1.5] text-on-surface-variant">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
