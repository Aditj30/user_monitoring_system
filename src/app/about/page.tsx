import { TopNavBar } from "@/components/TopNavBar";
import { Footer } from "@/components/Footer";

export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-background text-on-surface flex flex-col">
      <TopNavBar />
      
      <main className="flex-grow py-24 px-6 relative overflow-hidden">
        {/* Decorative Element */}
        <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 w-[800px] h-[800px] bg-tertiary/5 rounded-full blur-[150px] -z-10"></div>
        
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4 mb-16">
            <h1 className="text-5xl lg:text-7xl font-extrabold font-headline tracking-tight text-on-surface">
              About <span className="text-primary italic">IdentityPro</span>
            </h1>
            <p className="text-xl text-on-surface-variant leading-relaxed max-w-2xl">
              We are building the future of digital sovereignty, allowing enterprises to securely handle global identification without compromises.
            </p>
          </div>

          <div className="space-y-8 bg-surface-container-lowest p-10 rounded-3xl shadow-sm border border-outline-variant/10 relative z-10">
            <h2 className="text-3xl font-bold font-headline mb-4">Our Mission</h2>
            <p className="text-lg text-on-surface-variant leading-relaxed">
              At IdentityPro, we believe that identity is not just a clinical process—it is a secure, personal, and high-end experience. The digital landscape requires robust solutions to prevent fraud while respecting individual privacy. 
            </p>
            <p className="text-lg text-on-surface-variant leading-relaxed">
              Our Zero-Trust architecture ensures that verification happens seamlessly through global secure enclaves, removing single points of failure across any network.
            </p>

            <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-outline-variant/20">
              <div>
                <h3 className="text-xl font-bold font-headline mb-3 text-primary">Global Presence</h3>
                <p className="text-on-surface-variant">Trusted by over 2,500 enterprises spanning 40+ countries. Our edge nodes propagate data instantaneously, securely.</p>
              </div>
              <div>
                <h3 className="text-xl font-bold font-headline mb-3 text-secondary">Absolute Privacy</h3>
                <p className="text-on-surface-variant">Every verification and authentication event uses military-grade hashing to protect biometric and sensitive information.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
