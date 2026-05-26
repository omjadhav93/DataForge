const stats = [
  { icon: 'database', value: '100K+', label: 'Rows Supported' },
  { icon: 'bolt', value: '10x Faster', label: 'Batch Processing' },
  { icon: 'search', value: 'Real-time', label: 'Search & Filters' },
  { icon: 'bar_chart', value: 'Scalable', label: 'Built for Performance' },
];

const HeroSection = ({ setShowModal }) => {
  return (
    <>
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="max-w-[1200px] mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — Copy */}
          <div className="space-y-8">
            <h1 className="text-[56px] font-bold leading-[1.1] tracking-[-0.02em]">
              Upload. Process. <br />
              Explore <span className="hero-gradient-text">Your Data.</span>
            </h1>

            <p className="text-[18px] leading-[1.6] text-on-surface-variant max-w-xl">
              DataForge lets you upload large CSV files, automatically creates optimized tables, and
              helps you explore your data with blazing fast search, filters and pagination.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <button
                id="hero-upload-btn"
                onClick={() => setShowModal(true)}
                className="bg-primary text-on-primary px-8 py-4 rounded-xl text-[14px] font-semibold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-primary/25"
              >
                <span className="material-symbols-outlined">upload</span>
                Upload CSV
              </button>
              <button
                id="hero-github-btn"
                onClick={() => window.open('https://github.com/omjadhav93/DataForge', '_blank')}
                className="bg-surface-container-lowest border border-outline-variant px-8 py-4 rounded-xl text-[14px] font-semibold flex items-center gap-2 hover:bg-surface-container transition-all"
              >
                <span className="material-symbols-outlined">terminal</span>
                View on GitHub
              </button>
            </div>


        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 grid-rows-2 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="space-y-1">
              <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center text-primary mb-3">
                <span className="material-symbols-outlined text-xl">{stat.icon}</span>
              </div>
              <div className="font-bold text-[24px] leading-tight">{stat.value}</div>
              <div className="text-[14px] font-semibold text-on-surface-variant">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
      </section>
    </>
  );
};

export default HeroSection;
