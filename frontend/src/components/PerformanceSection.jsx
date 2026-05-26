import React from 'react';

const comparisonRows = [
  'Loads entire file into memory',
  'Browser freezes on large files',
  'Slow filtering and search',
  'Handles 100K+ rows',
];

const PerformanceSection = () => {
  return (
    <section id="performance" className="py-20">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="bg-surface-container-low rounded-[32px] p-8 lg:p-16 flex flex-col lg:flex-row gap-16">

          {/* Left — Copy */}
          <div className="lg:w-1/3 space-y-6 animate-on-scroll">
            <span className="text-primary font-bold text-[14px] uppercase tracking-widest">
              Performance
            </span>
            <h2 className="text-[40px] font-bold leading-tight tracking-[-0.01em]">
              Built for Large Datasets
            </h2>
            <p className="text-[16px] leading-[1.5] text-on-surface-variant">
              DataForge is engineered to handle large CSV files with speed and efficiency. Our
              proprietary streaming engine prevents browser lock-ups and memory overflows.
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all duration-200"
            >
              Learn more{' '}
              <span className="material-symbols-outlined">arrow_forward</span>
            </a>
          </div>

          {/* Right — Comparison Table */}
          <div className="lg:w-2/3 animate-on-scroll">
            <div className="bg-white rounded-2xl overflow-hidden border border-outline-variant shadow-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container-lowest">
                    <th className="p-6" />
                    <th className="p-6 text-on-surface-variant font-bold text-[14px] uppercase text-center tracking-wider">
                      Traditional CSV Apps
                    </th>
                    <th className="p-6 text-primary font-bold text-[14px] uppercase text-center tracking-wider">
                      DataForge
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30 text-[16px]">
                  {comparisonRows.map((row) => (
                    <tr key={row}>
                      <td className="p-6 font-medium">{row}</td>
                      <td className="p-6 text-center">
                        <span className="material-symbols-outlined text-error">close</span>
                      </td>
                      <td className="p-6 text-center">
                        <span className="material-symbols-outlined text-green-500">check</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default PerformanceSection;
