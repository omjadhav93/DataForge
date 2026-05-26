const steps = [
  {
    icon: 'upload_file',
    title: 'Upload CSV',
    description: 'Upload your CSV file in seconds.',
    showConnector: true,
  },
  {
    icon: 'code_blocks',
    title: 'Process & Create',
    description: 'We parse and create optimized tables.',
    showConnector: true,
  },
  {
    icon: 'database',
    title: 'Store Securely',
    description: 'Data is stored securely for fast querying.',
    showConnector: true,
  },
  {
    icon: 'pageview',
    title: 'Explore & Query',
    description: 'Search, filter, sort and paginate instantly.',
    showConnector: false,
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20 bg-surface">
      {/* Heading */}
      <div className="max-w-[1200px] mx-auto px-6 text-center mb-20 animate-on-scroll">
        <h2 className="text-[40px] font-bold leading-tight tracking-[-0.01em]">How It Works</h2>
      </div>

      {/* Steps */}
      <div className="max-w-[1200px] mx-auto px-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((step) => (
          <div
            key={step.title}
            className="relative flex flex-col items-center text-center group animate-on-scroll"
          >
            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-primary-fixed flex items-center justify-center text-primary mb-6 shadow-md group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-3xl">{step.icon}</span>
            </div>

            {/* Connector line (desktop only, not on last step) */}
            {step.showConnector && (
              <div className="hidden lg:block absolute top-8 left-[calc(50%+40px)] w-[calc(100%-80px)] border-t-2 border-dashed border-outline-variant" />
            )}

            <h4 className="font-bold text-[24px] leading-tight mb-2">{step.title}</h4>
            <p className="text-[14px] font-semibold text-on-surface-variant px-4">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorksSection;
