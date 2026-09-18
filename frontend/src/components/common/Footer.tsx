import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-plum text-ivory">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div className="grid gap-12 md:grid-cols-[1.2fr_1fr_1fr_1fr_1fr]">
          <div>
            <p className="leading-none">
              <span className="font-display text-3xl font-semibold tracking-tight">Sundara</span>
              <span className="ml-2 font-devanagari text-lg text-ivory/60">सुन्दरा</span>
            </p>
            <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-ivory/65">
              A contemporary salon in Patia, Bhubaneswar. Book in minutes, come
              back when you're ready.
            </p>
          </div>
          <nav aria-label="Services">
            <p className="font-accent text-xs font-bold uppercase tracking-[0.16em] text-ivory/45">Services</p>
            <ul className="mt-4 space-y-2.5 text-[15px]">
              <li><Link to="/services" className="text-ivory/75 hover:text-ivory">Hair</Link></li>
              <li><Link to="/services" className="text-ivory/75 hover:text-ivory">Skin</Link></li>
              <li><Link to="/services" className="text-ivory/75 hover:text-ivory">Nails</Link></li>
              <li><Link to="/book" className="text-ivory/75 hover:text-ivory">Book now</Link></li>
            </ul>
          </nav>
          <nav aria-label="Account">
            <p className="font-accent text-xs font-bold uppercase tracking-[0.16em] text-ivory/45">Account</p>
            <ul className="mt-4 space-y-2.5 text-[15px]">
              <li><Link to="/dashboard" className="text-ivory/75 hover:text-ivory">My visits</Link></li>
              <li><Link to="/loyalty" className="text-ivory/75 hover:text-ivory">Glow Points</Link></li>
              <li><Link to="/rewards" className="text-ivory/75 hover:text-ivory">Rewards</Link></li>
              <li><Link to="/login" className="text-ivory/75 hover:text-ivory">Log in</Link></li>
            </ul>
          </nav>
          <div>
            <p className="font-accent text-xs font-bold uppercase tracking-[0.16em] text-ivory/45">Visit</p>
            <address className="mt-4 text-[15px] not-italic leading-relaxed text-ivory/75">
              Plot 12, Patia<br />
              Bhubaneswar<br />
              Mon–Sat · 9 AM – 7 PM<br />
              +91 674 000 0000
            </address>
          </div>
          <nav aria-label="For business">
            <p className="font-accent text-xs font-bold uppercase tracking-[0.16em] text-ivory/45">For business</p>
            <ul className="mt-4 space-y-2.5 text-[15px]">
              <li><Link to="/staff/login" className="text-ivory/75 hover:text-ivory">Staff Portal →</Link></li>
            </ul>
          </nav>
        </div>
        <div className="mt-14 flex flex-col gap-3 border-t border-ivory/15 pt-6 font-accent text-[13px] text-ivory/50 md:flex-row md:items-center md:justify-between">
          <p>Sundara · Your beauty, your time · Crafted in Bhubaneswar</p>
        </div>
      </div>
    </footer>
  );
}
