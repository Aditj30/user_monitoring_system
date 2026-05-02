import React from "react";
import Image from "next/image";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-b from-primary/5 via-surface to-background">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px]"></div>
      
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10 w-full py-12">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold tracking-wide uppercase">
            <span
              className="material-symbols-outlined text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified_user
            </span>
            Enterprise Grade Security
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold font-headline tracking-tight text-on-surface leading-[1.1]">
            Secure User <span className="text-primary">Identification</span> System
          </h1>
          <p className="text-lg text-on-surface-variant leading-relaxed max-w-xl">
            Experience the next generation of digital sovereignty. Our platform delivers
            advanced multi-layered authentication protocols with editorial-grade interface
            design, ensuring your identity remains uncompromised.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <button className="bg-gradient-to-r from-primary to-primary-container text-white px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-all shadow-xl shadow-primary/20">
              Register Now
            </button>
            <Link
              href="/login"
              className="px-8 py-4 rounded-full font-bold text-lg border border-outline/20 text-primary hover:bg-surface-container-low transition-all"
            >
              Login
            </Link>
          </div>
          <div className="flex items-center gap-6 pt-8 border-t border-outline-variant/10">
            <div className="flex -space-x-3">
              <img
                alt="User 1"
                className="w-10 h-10 rounded-full border-2 border-surface-container-lowest object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpLiwSyYz8iQt3aPuQQDY2FJubxk13yr4IgNaGs10VmUeIlvka3nwKZPuis2P76Wlb6yHscxEZClUCUTvXTnpvZEimJ0BWS9ZcCFgCbm6RwYYsO2Rq1nDjyMssh7iTFaVjfqAXzClAkm3gYy8wRO-r6PYJ_bdJeQVuMwF20EV6R_-VXv7zOISyt_Icm9PfnB9mlIYWZZrZ4Pl9cHTEDCAHyeiTd59hZW_BVNSK011s2lLHee_SriIRlLsiKf90PAUZT1gwVuu4xvqy"
              />
              <img
                alt="User 2"
                className="w-10 h-10 rounded-full border-2 border-surface-container-lowest object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2WSeSUKyh4E34kmSKbMFAx6jtqe0KqmsfLc112LZ3Q3Kr-xZ7RqbO87t6RH_7sMduCfaY17UOc9xXRwrAcp09hSwhQ7AR-gVsyxsRDou_h_guuT_Xysw9xlqr34sp8UEqxSu6i3-DGWwL8l0--4p_2lhY42p9QyTJnYlWV195d324b1zju3S-m14H1CwtwWDwi_ICKOStjU1HYSV4Z1X81LbOZnbWezxPzisbZyJxgrVlbxCUN8UkGuuwVrkCYhkvSnQGFNh74Eh_"
              />
              <img
                alt="User 3"
                className="w-10 h-10 rounded-full border-2 border-surface-container-lowest object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcsWk456sQI2UqdAepcOOH_GC1wZeZwm9EcbPLA-ztqxBa7FKUJxFdI7NbFwrD0B6B-r6ng9zQUjlDwOcQ3xQQtYeHZGWV5bY2lYFPsPtiv9TiB1JHHcKOokh1XsuZ84i5cKhXh1iXFPkODElbnB0g7Fj2QapdP8vOiKfeGx5qXGmVZrip8A6SCNVsq4hQwdwoy6dfaN1qwCtGGp2-LD97qcluCzuM5gj4di6Pon6CcnEmMWA_Jz0z34N-Gtbk6Tc8TbF03xybjzI5"
              />
            </div>
            <p className="text-sm text-on-surface-variant font-medium">
              Trusted by <span className="text-on-surface font-bold">2,500+</span> global
              enterprises
            </p>
          </div>
        </div>

        {/* Bento Grid inserted separately or passed as children, but in the original it's grid col-2. */}
        <div className="grid grid-cols-2 gap-4 lg:gap-6">
          <div className="bg-surface-container-lowest/70 backdrop-blur-md p-6 rounded-xl border border-white/40 shadow-sm col-span-2">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-primary/10 rounded-lg">
                <span className="material-symbols-outlined text-primary">shield</span>
              </div>
              <span className="text-xs font-bold text-primary px-2 py-1 bg-primary-container/20 rounded">
                ENCRYPTED
              </span>
            </div>
            <h3 className="text-xl font-bold font-headline mb-2">Biometric Vault</h3>
            <p className="text-sm text-on-surface-variant">
              Military-grade hashing for your most sensitive identification vectors.
            </p>
          </div>
          <div className="bg-surface-container-lowest/70 backdrop-blur-md p-6 rounded-xl border border-white/40 shadow-sm">
            <div className="p-3 bg-secondary/10 rounded-lg w-fit mb-4">
              <span className="material-symbols-outlined text-secondary">
                fingerprint
              </span>
            </div>
            <h3 className="text-lg font-bold font-headline mb-1">Zero-Trust</h3>
            <p className="text-xs text-on-surface-variant">
              Continuous verification architecture.
            </p>
          </div>
          <div className="bg-surface-container-lowest/70 backdrop-blur-md p-6 rounded-xl border border-white/40 shadow-sm">
            <div className="p-3 bg-tertiary/10 rounded-lg w-fit mb-4">
              <span className="material-symbols-outlined text-tertiary">lock</span>
            </div>
            <h3 className="text-lg font-bold font-headline mb-1">Passkeys</h3>
            <p className="text-xs text-on-surface-variant">
              Modern passwordless authentication flow.
            </p>
          </div>
          <div className="bg-gradient-to-br from-primary to-primary-dim p-8 rounded-xl shadow-xl shadow-primary/30 col-span-2 flex items-center justify-between overflow-hidden relative">
            <div className="relative z-10">
              <p className="text-white/80 text-sm font-medium mb-1">Security Score</p>
              <h4 className="text-white text-4xl font-black tracking-tighter leading-none">
                99.9%
              </h4>
              <p className="text-white/60 text-[10px] mt-2 uppercase tracking-widest font-bold">
                Verified Accuracy
              </p>
            </div>
            <div className="relative z-10 h-16 w-32 bg-white/10 backdrop-blur rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-3xl">
                query_stats
              </span>
            </div>
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
