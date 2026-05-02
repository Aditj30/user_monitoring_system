import React from "react";
import Image from "next/image";

export function FeatureHighlight() {
  return (
    <section className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-16 items-center">
          <div className="flex-1 relative">
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-2xl">
              <img
                alt="Security Platform"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAxcH1fiClkY0LoibgTffM2Yxw4dcMTtoRftOGYk2qpt6JHxAuVZqQf58OeSRCitwUofWOQ_D7b2Tl0YjhJhs3lC-QMwiplAzXq2y7jHIqtsM4d5Z34IVfv6kdU8GgcQDwyfXvc-XlCz4fl0RIITfhXGAFQyNtyNphPq7sgn0KPfZUBA2uMbgDnFMf98Oehp8k4LnK9z8gpE4u56kM6KN6fqL2rHGfaXe9IIDhR2ox1KXqSxN-vih8XH6XUUvZi4z6GaFNCEBzxYnv8"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </div>
            <div className="absolute -bottom-10 -right-10 bg-surface-container-lowest p-8 rounded-2xl shadow-xl border border-outline-variant/10 hidden lg:block">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    bolt
                  </span>
                </div>
                <div>
                  <p className="font-bold font-headline">Instant Sync</p>
                  <p className="text-xs text-on-surface-variant">Global edge propagation</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 space-y-8">
            <h2 className="text-4xl font-bold font-headline leading-tight">
              Designed for <span className="text-primary italic">Absolute Privacy</span>
            </h2>
            <div className="space-y-6">
              <div className="flex gap-6 group cursor-pointer">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center group-hover:bg-primary transition-colors">
                  <span className="material-symbols-outlined text-primary group-hover:text-white transition-colors">
                    cloud_done
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-bold font-headline mb-2">
                    Immutable Ledger Technology
                  </h4>
                  <p className="text-on-surface-variant text-sm">
                    Every authentication event is cryptographically signed and stored on a
                    private immutable ledger for forensic auditing.
                  </p>
                </div>
              </div>
              <div className="flex gap-6 group cursor-pointer">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center group-hover:bg-primary transition-colors">
                  <span className="material-symbols-outlined text-primary group-hover:text-white transition-colors">
                    hub
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-bold font-headline mb-2">
                    Decentralized Trust Nodes
                  </h4>
                  <p className="text-on-surface-variant text-sm">
                    No single point of failure. Our identification mesh distributes
                    verification across global secure enclaves.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
