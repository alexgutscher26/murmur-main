import { notFound } from "next/navigation";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO_PAGES, SeoPageData } from "@/data/seoPages";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return Object.keys(SEO_PAGES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = SEO_PAGES[slug];
  if (!page) return {};

  return {
    title: `${page.metaTitle} · Murmur`,
    description: page.metaDescription,
    alternates: {
      canonical: `https://murmur.app/${slug}`,
    },
    openGraph: {
      title: page.metaTitle,
      description: page.metaDescription,
      url: `https://murmur.app/${slug}`,
      siteName: "Murmur",
      type: "website",
    },
  };
}

export default async function HighIntentSeoPage({ params }: Props) {
  const { slug } = await params;
  const page: SeoPageData | undefined = SEO_PAGES[slug];

  if (!page) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Murmur",
    applicationCategory: "ProductivityApplication",
    operatingSystem: "macOS, Windows",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description: page.metaDescription,
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  return (
    <main className="min-h-screen bg-[#000000] text-white selection:bg-white/20 selection:text-white">
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <Navbar />

      <section className="pt-36 pb-20 md:pt-44 md:pb-28 max-w-4xl mx-auto px-4">
        {/* Header Badge */}
        <div className="text-center max-w-[720px] mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181818] border border-[#313131] mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-white/90">{page.badge}</span>
            <span className="text-xs font-mono text-white/50 pl-1 border-l border-[#313131]">
              Auditable Architecture
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white mb-6">
            {page.h1}
            <span className="block text-gradient-hero mt-1">{page.h1Highlight}</span>
          </h1>

          <p className="text-base sm:text-lg text-white/70 leading-relaxed font-normal mb-8">
            {page.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/#download"
              className="text-sm font-semibold text-black bg-white hover:bg-white/90 px-6 py-3 rounded-full transition-all shadow-[0_4px_20px_rgba(255,255,255,0.15)]"
            >
              Download Murmur Free
            </Link>
            <Link
              href="/privacy"
              className="text-sm font-semibold text-white/80 hover:text-white bg-[#181818] hover:bg-[#222222] border border-[#313131] px-5 py-3 rounded-full transition-all"
            >
              View Privacy Architecture
            </Link>
          </div>
        </div>

        {/* Regulatory & Compliance Disclaimer (when specified) */}
        {page.disclaimer && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200/90 text-xs leading-relaxed mb-12 shadow-[0_0_24px_rgba(245,158,11,0.06)]">
            <div className="flex items-center gap-2 font-semibold text-amber-400 mb-2 uppercase text-[11px] tracking-wider font-mono">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Compliance & Regulatory Notice</span>
            </div>
            <p className="font-sans text-amber-100/80">{page.disclaimer}</p>
          </div>
        )}

        {/* Key Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-14">
          {page.keyStats.map((stat, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-[#141414] border border-[#272727] text-left">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 block mb-1">
                {stat.label}
              </span>
              <span className="text-xl sm:text-2xl font-bold text-white font-mono block mb-1">
                {stat.value}
              </span>
              <span className="text-[11px] text-white/50 block leading-tight">{stat.detail}</span>
            </div>
          ))}
        </div>

        {/* The Core Contrast / Architecture Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-14">
          <div className="p-6 rounded-2xl bg-[#141414] border border-[#2a2a2a] flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono text-amber-400 uppercase tracking-wider font-semibold block mb-2">
                The Cloud Compromise
              </span>
              <h3 className="text-base font-bold text-white mb-2">The Problem with Cloud Dictation</h3>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-sans">
                {page.coreProblem}
              </p>
            </div>
            <div className="mt-4 p-3 rounded-lg bg-[#1a1a1a] border border-[#2d2d2d] text-[11px] font-mono text-white/50">
              Target Profile: {page.targetAudience}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#141414] border border-emerald-500/40 flex flex-col justify-between shadow-[0_0_24px_rgba(16,185,129,0.05)]">
            <div>
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-semibold block mb-2">
                The Local-First Solution
              </span>
              <h3 className="text-base font-bold text-white mb-2">Physical Hardware Sovereignty</h3>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-sans">
                {page.architecturalSolution}
              </p>
            </div>
            <div className="mt-4 p-3 rounded-lg bg-[#0e0e0e] border border-emerald-500/30 text-[11px] font-mono text-emerald-300">
              ✓ 0 bytes outbound · GPU accelerated
            </div>
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#181818] border border-[#313131] mb-14">
          <div className="mb-6">
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold block mb-1">
              Substantiated Architectural Comparison
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Local Architecture vs. Cloud SaaS
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[560px]">
              <thead>
                <tr className="border-b border-[#313131] text-white/80 font-mono bg-[#1f1f1f]">
                  <th className="p-3.5 pr-4 w-1/4">Buyer Concern</th>
                  <th className="p-3.5 px-4 w-2/5 bg-[#222222] text-white font-bold border-x border-[#313131]">
                    Murmur (Local-First)
                  </th>
                  <th className="p-3.5 px-4 w-1/3 text-white/60">
                    Cloud Alternatives (e.g. Wispr)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#272727] text-white/70 font-mono">
                {page.comparisonTable.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#202020] transition-colors">
                    <td className="p-3.5 pr-4 font-bold text-white">
                      <div>{row.feature}</div>
                      <div className="text-[10px] text-white/40 font-normal font-sans mt-0.5">
                        {row.whyItMatters}
                      </div>
                    </td>
                    <td className="p-3.5 px-4 bg-[#181818] border-x border-[#313131] text-emerald-300 font-semibold">
                      {row.murmur}
                    </td>
                    <td className="p-3.5 px-4 text-white/60">{row.cloudComp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pricing Narrative Callout */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#141414] border border-[#2b2b2b] mb-14">
          <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold block mb-1">
            Pricing Narrative
          </span>
          <h2 className="text-xl font-bold text-white mb-2">{page.pricingNarrative.headline}</h2>
          <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-sans">
            {page.pricingNarrative.detail}
          </p>
        </div>

        {/* Social Clip & Real Outcome Demonstration */}
        <div className="p-6 rounded-2xl bg-[#171717] border border-[#313131] mb-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block mb-1">
              Real Workflow Outcome ({page.socialProofClip.platform})
            </span>
            <p className="text-sm font-semibold text-white italic">
              {page.socialProofClip.quote}
            </p>
          </div>
          <span className="text-[11px] font-mono px-3 py-1.5 rounded-lg bg-[#242424] text-white/70 border border-[#383838] shrink-0">
            {page.socialProofClip.context}
          </span>
        </div>

        {/* Reproducible Audit Recipe */}
        <div className="p-6 rounded-2xl bg-[#121212] border border-[#292929] mb-14">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <h3 className="text-sm font-bold text-white">How to Verify This Claim Yourself</h3>
          </div>
          <p className="text-xs text-white/70 font-mono leading-relaxed">
            {page.reproducibleAuditStep}
          </p>
        </div>

        {/* FAQ Section */}
        <div className="mb-14">
          <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {page.faqs.map((faq, idx) => (
              <div key={idx} className="p-5 rounded-xl bg-[#181818] border border-[#313131]">
                <h3 className="text-sm font-bold text-white mb-2">{faq.q}</h3>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center p-8 sm:p-10 rounded-2xl bg-[#181818] border border-[#313131]">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Ready to dictate without cloud exposure?
          </h2>
          <p className="text-sm text-white/70 max-w-md mx-auto mb-6">
            Download Murmur for macOS and Windows. Free, open source, and 100% on-device.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              href="/#download"
              className="text-sm font-semibold text-black bg-white hover:bg-white/90 px-6 py-2.5 rounded-full transition-colors"
            >
              Download Murmur
            </Link>
            <Link
              href="/"
              className="text-sm font-semibold text-white/80 hover:text-white bg-[#222222] border border-[#313131] px-5 py-2.5 rounded-full transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
