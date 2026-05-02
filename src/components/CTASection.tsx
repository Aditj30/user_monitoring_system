import React from "react";

export function CTASection() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto rounded-3xl bg-inverse-surface p-12 text-center relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px]"></div>
        <div className="relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold font-headline text-white mb-6">
            Ready to secure your digital identity?
          </h2>
          <p className="text-inverse-on-surface text-lg mb-10 max-w-2xl mx-auto">
            Join thousands of companies protecting their users with the world's most
            advanced identification system.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-primary text-white px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform shadow-lg shadow-primary/20">
              Get Started Today
            </button>
            <button className="bg-white/10 text-white border border-white/20 backdrop-blur px-8 py-4 rounded-full font-bold hover:bg-white/20 transition-all">
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
