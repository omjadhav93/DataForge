const Navbar = ({ setShowModal }) => {
  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30">
      <div className="max-w-[1200px] mx-auto px-6 h-20 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined text-primary text-3xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            database
          </span>
          <span className="text-[24px] font-bold leading-tight text-on-surface">DataForge</span>
        </div>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-on-surface-variant text-[16px] hover:text-primary transition-colors"
          >
            Features
          </a>
          <a
            href="#performance"
            className="text-on-surface-variant text-[16px] hover:text-primary transition-colors"
          >
            Performance
          </a>
          <a
            href="#how-it-works"
            className="text-on-surface-variant text-[16px] hover:text-primary transition-colors"
          >
            How It Works
          </a>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <a
            href="#"
            onClick={() => window.open('https://github.com/omjadhav93/DataForge', '_blank')}
            className="hidden sm:flex items-center gap-2 text-on-surface-variant text-[14px] font-semibold hover:text-primary transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">code</span>
            View on GitHub
          </a>
          <button
            id="nav-upload-btn"
            onClick={() => setShowModal(true)}
            className="bg-primary text-on-primary px-6 py-2.5 rounded-lg text-[14px] font-semibold hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20"
          >
            Upload CSV
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
