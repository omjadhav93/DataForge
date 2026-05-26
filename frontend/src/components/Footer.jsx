const Footer = () => {
  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant/30">
      {/* Main Footer Row */}
      <div className="max-w-[1200px] mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined text-primary text-2xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            database
          </span>
          <span className="text-[24px] font-bold leading-tight text-primary">DataForge</span>
        </div>

        {/* Copyright */}
        <p className="text-[14px] font-semibold text-on-surface-variant text-center md:text-left">
          &copy; 2024 DataForge. Precision data tools for modern developers.
        </p>

        {/* Social Icons */}
        <div className="flex items-center gap-6">
          <a
            href="#"
            aria-label="GitHub"
            className="text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">code</span>
          </a>
          <a
            href="#"
            aria-label="Community"
            className="text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">group</span>
          </a>
          <a
            href="#"
            aria-label="Email"
            className="text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">mail</span>
          </a>
        </div>
      </div>

      {/* Secondary Footer Row */}
      <div className="max-w-[1200px] mx-auto px-6 pb-8 flex justify-center gap-8 border-t border-outline-variant/10 pt-8">
        {['Privacy Policy', 'Terms of Service', 'Changelog', 'Status'].map((link) => (
          <a
            key={link}
            href="#"
            className="text-[14px] font-semibold text-on-surface-variant hover:text-primary transition-colors"
          >
            {link}
          </a>
        ))}
      </div>
    </footer>
  );
};

export default Footer;
