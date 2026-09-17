import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, FileText, Bell, Phone, ChevronLeft, ChevronRight, Star, UserCheck, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Responsive style helpers ─────────────────────────────────────────────── */
const css = String.raw;

function GlobalStyles() {
  return (
    <style>{css`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

      .landing-root * { box-sizing: border-box; margin: 0; padding: 0; }
      .landing-root { font-family: 'Inter', -apple-system, sans-serif; }

      /* ── Navbar ── */
      .lp-nav { position:fixed;top:0;left:0;right:0;z-index:100;background:#fff;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;justify-content:space-between;padding:0 1.5rem;height:60px;transition:box-shadow .3s; }
      .lp-nav.scrolled { box-shadow:0 2px 16px rgba(37,99,235,.1); }
      .lp-logo-name { font-size:1.3rem;font-weight:800;color:#1e3a8a;letter-spacing:-.5px; }
      .lp-logo-sub  { font-size:.7rem;font-weight:500;color:#6b7280; }
      .lp-nav-links { display:flex;align-items:center;gap:1.5rem; }
      .lp-nav-links a { color:#374151;font-size:.875rem;font-weight:500;text-decoration:none;transition:color .2s; }
      .lp-nav-links a:hover { color:#2563eb; }
      .lp-btn-primary { background:#2563eb;color:#ffffff !important;padding:.45rem 1.1rem;border-radius:6px;font-weight:600;font-size:.875rem;text-decoration:none;border:none;cursor:pointer;transition:background .2s; }
      .lp-btn-primary:hover { background:#1d4ed8; }
      .lp-hamburger { display:none;background:none;border:none;cursor:pointer;padding:.25rem;color:#374151; }

      /* ── Hero ── */
      .lp-hero { min-height:100vh;background:url('/leaf-bg.jpg') center/cover no-repeat fixed;display:flex;align-items:center;padding-top:60px;position:relative;overflow:hidden; }
      .lp-hero-inner { max-width:1200px;margin:0 auto;padding:3rem 1.5rem;display:flex;align-items:center;gap:2.5rem;width:100%; }
      .lp-hero-left { flex:1;min-width:0; }
      .lp-hero-right { flex:0 0 auto;width:clamp(220px,36vw,450px); }
      .lp-hero-right img { width:100%;height:auto;object-fit:contain;mix-blend-mode:multiply;border-radius:24px; }
      .lp-badge { display:inline-flex;align-items:center;gap:.5rem;background:rgba(219,234,254,.85);border:1px solid #bfdbfe;border-radius:999px;padding:.3rem .9rem;font-size:.8rem;color:#1d4ed8;font-weight:500;margin-bottom:1.25rem; }
      .lp-badge-dot { width:7px;height:7px;border-radius:50%;background:#2563eb;display:inline-block; }
      .lp-hero-h1 { font-size:clamp(1.8rem,4vw,2.8rem);font-weight:800;color:#111827;line-height:1.15;margin-bottom:.9rem; }
      .lp-hero-h1 span { color:#2563eb;border-bottom:3px solid #2563eb;padding-bottom:2px; }
      .lp-hero-p { font-size:1rem;color:#6b7280;line-height:1.7;margin-bottom:1.5rem;max-width:420px; }
      .lp-stats { display:flex;gap:0;margin-bottom:1.75rem;flex-wrap:wrap; }
      .lp-stat { padding:.25rem 0; }
      .lp-stat-val { font-size:1.4rem;font-weight:800;color:#111827; }
      .lp-stat-lbl { font-size:.75rem;color:#6b7280; }
      .lp-stat-divider { width:1px;background:#d1d5db;margin:0 1.25rem; }
      .lp-cta { display:inline-block;background:#2563eb;color:#fff;padding:.8rem 2rem;border-radius:8px;font-weight:700;font-size:1rem;text-decoration:none;box-shadow:0 4px 14px rgba(37,99,235,.3);margin-bottom:1rem;transition:all .2s; }
      .lp-cta:hover { background:#1d4ed8;transform:translateY(-1px); }
      .lp-trust { display:flex;align-items:center;gap:.5rem;margin-top:.25rem;flex-wrap:wrap; }
      .lp-trust-avatars { display:flex; }
      .lp-trust-avatar { width:28px;height:28px;border-radius:50%;background:#93c5fd;border:2px solid #fff;display:flex;align-items:center;justify-content:center; }
      .lp-trust-text { font-size:.8rem;color:#6b7280; }
      .lp-wave { position:absolute;bottom:0;left:0;right:0;line-height:0; }
      .lp-wave svg { width:100%;height:50px; }

      /* ── Quick links ── */
      .lp-quicklinks { background:#f9fafb;padding:.9rem 1.5rem;display:flex;align-items:center;gap:.75rem;border-bottom:1px solid #e5e7eb;overflow-x:auto;flex-wrap:nowrap; }
      .lp-ql-label { font-size:.7rem;font-weight:700;color:#6b7280;letter-spacing:.08em;text-transform:uppercase;white-space:nowrap;flex-shrink:0; }
      .lp-ql-btn { display:inline-flex;align-items:center;gap:.35rem;background:#fff;border:1px solid #e5e7eb;border-radius:999px;padding:.3rem .8rem;font-size:.8rem;color:#374151;cursor:pointer;white-space:nowrap;flex-shrink:0;transition:box-shadow .2s; }
      .lp-ql-btn:hover { box-shadow:0 2px 8px rgba(0,0,0,.08); }

      /* ── Services ── */
      .lp-services { background:#f9fafb;padding:3.5rem 1.5rem; }
      .lp-section-title { font-size:1.75rem;font-weight:800;color:#111827;margin-bottom:.4rem; }
      .lp-section-sub { color:#6b7280;font-size:.9rem;margin-bottom:2rem; }
      .lp-carousel-wrap { display:flex;align-items:center;gap:.75rem; }
      .lp-carousel-arrow { width:34px;height:34px;border-radius:50%;border:1px solid #e5e7eb;background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:box-shadow .2s; }
      .lp-carousel-arrow:hover:not(:disabled) { box-shadow:0 2px 8px rgba(0,0,0,.1); }
      .lp-carousel-arrow:disabled { opacity:.35;cursor:not-allowed; }
      .lp-cards-grid { flex:1;display:grid;grid-template-columns:repeat(4,1fr);gap:1rem; }
      .lp-card { background:#fff;border-radius:14px;padding:1.25rem;border:1px solid #e5e7eb;display:flex;flex-direction:column;gap:.9rem;box-shadow:0 2px 8px rgba(0,0,0,.04);transition:box-shadow .2s,transform .2s; }
      .lp-card:hover { box-shadow:0 8px 24px rgba(37,99,235,.12);transform:translateY(-2px); }
      .lp-card-icon { background:#eff6ff;border-radius:10px;width:100%;aspect-ratio:4/3;display:flex;align-items:center;justify-content:center; }
      .lp-card h3 { font-weight:700;color:#111827;font-size:.95rem; }
      .lp-card p { font-size:.8rem;color:#6b7280;line-height:1.5; }
      .lp-card-btn { display:inline-block;background:#2563eb;color:#fff;padding:.45rem 1.1rem;border-radius:6px;font-weight:600;font-size:.8rem;text-decoration:none;align-self:flex-start;transition:background .2s; }
      .lp-card-btn:hover { background:#1d4ed8; }
      .lp-dots { display:flex;justify-content:center;gap:.35rem;margin-top:1.25rem; }
      .lp-dot { height:8px;border-radius:999px;border:none;cursor:pointer;padding:0;transition:all .3s; }

      /* ── How it works ── */
      .lp-hiw { background:#f9fafb;padding:3.5rem 1.5rem 4.5rem; }
      .lp-hiw-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:1.5rem;margin-top:2.5rem; }
      .lp-step { text-align:center; }
      .lp-step-num { font-size:3.5rem;font-weight:800;color:#d1d5db;line-height:1;margin-bottom:.5rem; }
      .lp-step h3 { font-weight:700;color:#111827;font-size:.95rem;margin-bottom:.35rem; }
      .lp-step p { font-size:.8rem;color:#6b7280;line-height:1.6; }

      /* ── Testimonials ── */
      .lp-testimonials { background:url('/leaf-bg.jpg') center/cover no-repeat fixed;padding:4rem 1.5rem; }
      .lp-test-grid { display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;margin-bottom:2rem; }
      .lp-test-card { background:rgba(255,255,255,.75);border-radius:14px;padding:1.25rem;border:1px solid rgba(255,255,255,.9);backdrop-filter:blur(8px);display:flex;gap:.9rem; }
      .lp-test-avatar { width:44px;height:44px;border-radius:50%;background:#dbeafe;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
      .lp-test-name { font-weight:700;color:#111827;font-size:.9rem; }
      .lp-test-stars { display:flex;gap:2px; }
      .lp-test-text { font-size:.8rem;color:#4b5563;line-height:1.6;margin-top:.3rem; }

      /* ── Footer ── */
      .lp-footer { background:#f9fafb;border-top:1px solid #e5e7eb;padding:2.5rem 1.5rem 1.25rem; }
      .lp-footer-grid { display:grid;grid-template-columns:2fr 1fr 1fr;gap:2.5rem;margin-bottom:2rem; }
      .lp-footer h3 { font-weight:800;color:#111827;margin-bottom:.6rem;font-size:.95rem; }
      .lp-footer p, .lp-footer a { font-size:.825rem;color:#6b7280;text-decoration:none;line-height:1.7; }
      .lp-footer a:hover { color:#2563eb; }
      .lp-footer-links { display:flex;flex-direction:column;gap:.3rem; }
      .lp-footer-copy { border-top:1px solid #e5e7eb;padding-top:1rem;text-align:center;font-size:.75rem;color:#9ca3af; }
      .lp-footer-bar { margin-top:.9rem;background:#2563eb;border-radius:8px;padding:.65rem;display:flex;justify-content:center;gap:2rem; }
      .lp-footer-bar button { background:none;border:none;cursor:pointer;padding:.2rem; }

      /* ── MOBILE BREAKPOINTS ── */
      @media (max-width: 900px) {
        .lp-hero-inner { flex-direction:column;text-align:center;padding:2rem 1.25rem 4rem; }
        .lp-hero-right { width:clamp(200px,70vw,340px);order:-1; }
        .lp-hero-left { display:flex;flex-direction:column;align-items:center; }
        .lp-hero-p { max-width:100%; }
        .lp-stats { justify-content:center; }
        .lp-trust { justify-content:center; }
        .lp-cards-grid { grid-template-columns:repeat(2,1fr); }
        .lp-hiw-grid { grid-template-columns:repeat(2,1fr); }
        .lp-footer-grid { grid-template-columns:1fr; }
        .lp-test-grid { grid-template-columns:1fr; }
        .lp-nav-links { display:none; }
        .lp-hamburger { display:flex;align-items:center;justify-content:center; }
      }

      @media (max-width: 560px) {
        .lp-hero-h1 { font-size:1.65rem; }
        .lp-cards-grid { grid-template-columns:1fr 1fr; }
        .lp-hiw-grid { grid-template-columns:1fr 1fr; }
        .lp-carousel-arrow { display:none; }
        .lp-carousel-wrap { gap:0; }
        .lp-hero-right { width:clamp(200px,75vw,300px); }
        .lp-section-title { font-size:1.5rem; }
      }

      /* Mobile nav drawer */
      .lp-mobile-menu { display:none;position:fixed;top:0;left:0;right:0;bottom:0;z-index:200;background:#fff;flex-direction:column;padding:1.5rem; }
      .lp-mobile-menu.open { display:flex; }
      .lp-mobile-menu-header { display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem; }
      .lp-mobile-menu a { display:block;font-size:1.1rem;font-weight:600;color:#111827;text-decoration:none;padding:.75rem 0;border-bottom:1px solid #f3f4f6; }
      .lp-mobile-menu a:hover { color:#2563eb; }
      .lp-mobile-get-started { display:block;background:#2563eb;color:#fff;text-align:center;padding:.8rem;border-radius:8px;font-weight:700;text-decoration:none;margin-top:1.5rem; }
    `}</style>
  );
}

/* ─── Mobile Menu ───────────────────────────────────────────────────────────── */
function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <div className={`lp-mobile-menu ${open ? "open" : ""}`}>
      <div className="lp-mobile-menu-header">
        <div>
          <div className="lp-logo-name">MargSarthi</div>
          <div className="lp-logo-sub">Your Academic Guide</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: ".25rem" }}>
          <X size={24} color="#374151" />
        </button>
      </div>
      {["Login", "Register", "Contact", "Updates", "Quick Call"].map(label => (
        <Link key={label} to={label === "Login" ? "/login" : label === "Register" ? "/register" : "#"} onClick={onClose}>{label}</Link>
      ))}
      <Link to="/register" className="lp-mobile-get-started" onClick={onClose}>Get Started</Link>
    </div>
  );
}

/* ─── Navbar ────────────────────────────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <nav className={`lp-nav ${scrolled ? "scrolled" : ""}`}>
        <div>
          <div className="lp-logo-name">MargSarthi</div>
          <div className="lp-logo-sub">Your Academic Guide</div>
        </div>
        <div className="lp-nav-links">
          {["Login", "Register", "Contact", "Updates", "Quick Call"].map(label => (
            <Link key={label} to={label === "Login" ? "/login" : label === "Register" ? "/register" : "#"}>{label}</Link>
          ))}
          <Link to="/register" className="lp-btn-primary">Get Started</Link>
        </div>
        <button className="lp-hamburger" onClick={() => setMenuOpen(true)} aria-label="Open menu">
          <Menu size={24} />
        </button>
      </nav>
    </>
  );
}

/* ─── Services data ─────────────────────────────────────────────────────────── */
const SERVICES = [
  { title: "Scholarship Info", desc: "Discover and apply for scholarships to ease your educational expense." },
  { title: "Internship Opportunities", desc: "Find internship opportunities and kickstart your career with top companies." },
  { title: "Document Help", desc: "College document sorting guidance, ranking assistance, or help making the right choice." },
  { title: "Career Counseling", desc: "Get expert career counseling to discover and pursue the right path for your future." },
  { title: "Ticket Resolution", desc: "Raise requests for ID cards, migration certificates, or fee issues." },
  { title: "Quick Calls", desc: "Book 10-15 minute slots with counselors or admins for urgent queries." },
  { title: "Secure Profile", desc: "Upload and manage your educational documents securely." },
  { title: "Admissions Guide", desc: "Step-by-step guidance for college admissions across top institutions in India." },
];

const STEPS = [
  { n: "01", title: "Create Account", desc: "Sign up or continue with login." },
  { n: "02", title: "Raise Ticket", desc: "Select admission or other services and set priority level." },
  { n: "03", title: "Preview Details & Pay", desc: "Provide details and pay upto Rs.50." },
  { n: "04", title: "Get Guidance", desc: "Connect with your counselor." },
];

/* ─── Main Landing ──────────────────────────────────────────────────────────── */
export default function Landing() {
  const [page, setPage] = useState(0);
  // Detect mobile to adjust perPage
  const [cols, setCols] = useState(4);
  useEffect(() => {
    const update = () => setCols(window.innerWidth < 560 ? 2 : window.innerWidth < 900 ? 2 : 4);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const totalPages = Math.ceil(SERVICES.length / cols);
  // clamp page
  const safePage = Math.min(page, totalPages - 1);
  const visible = SERVICES.slice(safePage * cols, safePage * cols + cols);

  return (
    <div className="landing-root">
      <GlobalStyles />
      <Navbar />

      {/* ── HERO ── */}
      <section className="lp-hero">
        <div className="lp-hero-inner">
          <motion.div className="lp-hero-left" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="lp-badge">
              <span className="lp-badge-dot" />
              Admissions Open 2026-27
            </div>
            <h1 className="lp-hero-h1">
              Gateway to{" "}<span>Education</span>
              <br />{"& Opportunities"}
            </h1>
            <p className="lp-hero-p">
              Start your journey with us for admissions, scholarships, internships, and more - all in one place.
            </p>
            <div className="lp-stats">
              {[{ v: "50K+", l: "Students Guided" }, { v: "200+", l: "Colleges" }, { v: "95%", l: "Success Rate" }].map((s, i) => (
                <React.Fragment key={s.l}>
                  <div className="lp-stat">
                    <div className="lp-stat-val">{s.v}</div>
                    <div className="lp-stat-lbl">{s.l}</div>
                  </div>
                  {i < 2 && <div className="lp-stat-divider" />}
                </React.Fragment>
              ))}
            </div>
            <Link to="/register" className="lp-cta">Get Guidance</Link>
            <div className="lp-trust">
              <div className="lp-trust-avatars">
                {[1, 2, 3].map(i => (
                  <div key={i} className="lp-trust-avatar" style={{ marginLeft: i > 1 ? -8 : 0 }}>
                    <UserCheck size={13} color="#fff" />
                  </div>
                ))}
              </div>
              <span className="lp-trust-text">Trusted by 50,000+ students across India</span>
            </div>
          </motion.div>
          <motion.div className="lp-hero-right" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
            <img src="/hero-students.jpg" alt="Students" />
          </motion.div>
        </div>
        <div className="lp-wave">
          <svg viewBox="0 0 1440 50" preserveAspectRatio="none">
            <path d="M0,25 C360,50 1080,0 1440,25 L1440,50 L0,50 Z" fill="#f9fafb" />
          </svg>
        </div>
      </section>

      {/* ── QUICK LINKS ── */}
      <div className="lp-quicklinks">
        <span className="lp-ql-label">Quick Links:</span>
        {[{ emoji: "📄", label: "Terms & Conditions" }, { emoji: "🔔", label: "Latest Updates" }, { emoji: "📞", label: "Support Call" }].map(l => (
          <button key={l.label} className="lp-ql-btn">{l.emoji} {l.label}</button>
        ))}
      </div>

      {/* ── SERVICES ── */}
      <section className="lp-services">
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center" }}>
            <h2 className="lp-section-title">Student Services</h2>
            <p className="lp-section-sub">Your all-in-one platform for student guidance and support.</p>
          </div>
          <div className="lp-carousel-wrap">
            <button className="lp-carousel-arrow" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={safePage === 0} aria-label="Previous">
              <ChevronLeft size={18} />
            </button>
            <div className="lp-cards-grid">
              <AnimatePresence mode="wait">
                {visible.map((s, i) => (
                  <motion.div key={s.title} className="lp-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25, delay: i * 0.04 }}>
                    <div className="lp-card-icon"><GraduationCap size={32} color="#2563eb" /></div>
                    <div>
                      <h3>{s.title}</h3>
                      <p>{s.desc}</p>
                    </div>
                    <Link to="/register" className="lp-card-btn">Get Help</Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <button className="lp-carousel-arrow" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={safePage === totalPages - 1} aria-label="Next">
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="lp-dots">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} className="lp-dot" onClick={() => setPage(i)} style={{ width: i === safePage ? 22 : 8, background: i === safePage ? "#2563eb" : "#d1d5db" }} aria-label={`Page ${i + 1}`} />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="lp-hiw">
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2 className="lp-section-title" style={{ textAlign: "center" }}>
            How <span style={{ color: "#2563eb" }}>Marg</span>Sarthi Works
          </h2>
          <div className="lp-hiw-grid">
            {STEPS.map((s, i) => (
              <motion.div key={s.n} className="lp-step" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.45 }}>
                <div className="lp-step-num">{s.n}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="lp-testimonials">
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h2 className="lp-section-title" style={{ textAlign: "center", marginBottom: "2rem" }}>Student Success Stories</h2>
          <div className="lp-test-grid">
            {[
              { name: "Aditi Sharma", text: "MargSarthi made the admissions process easy, and I got into the college of my choice." },
              { name: "Rahul Verma", text: "Thanks to MargSarthi, I found a perfect internship. The platform is a lifesaver for students." },
            ].map(r => (
              <motion.div key={r.name} className="lp-test-card" initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
                <div className="lp-test-avatar"><UserCheck size={20} color="#2563eb" /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="lp-test-name">{r.name}</span>
                    <div className="lp-test-stars">{[1,2,3,4,5].map(i => <Star key={i} size={13} fill="#2563eb" color="#2563eb" />)}</div>
                  </div>
                  <p className="lp-test-text">{r.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div style={{ textAlign: "center" }}>
            <Link to="/register" className="lp-cta">Get Started</Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="lp-footer-grid">
            <div>
              <h3>About MargSarthi</h3>
              <p>MargSarthi is your gateway to education and career opportunities. Get guidance for admissions, scholarships, internships and more.</p>
            </div>
            <div>
              <h3>Quick Links</h3>
              <div className="lp-footer-links">
                <a href="#">Contact</a>
                <a href="#">Terms & Conditions</a>
              </div>
            </div>
            <div>
              <h3>Contact Us</h3>
              <p>support@margsarthi.com</p>
              <p>+91 70500 08828</p>
            </div>
          </div>
          <div className="lp-footer-copy">© 2026 MargSarthi. All rights reserved.</div>
          <div className="lp-footer-bar">
            {[FileText, Bell, GraduationCap, Phone].map((Icon, i) => (
              <button key={i} aria-label="footer icon"><Icon size={18} color="#fff" /></button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
