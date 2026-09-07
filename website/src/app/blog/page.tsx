/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BLOG_POSTS, BlogPost } from "@/data/blogPosts";

export default function BlogIndexPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = ["All", "Comparisons", "Privacy & Security", "Guides", "Engineering"];

  const filteredPosts = BLOG_POSTS.filter((post) => {
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-white text-neutral-900 selection:bg-neutral-900 selection:text-white relative overflow-hidden">
      {/* Background glow & subtle texture */}
      <div className="absolute inset-0 pointer-events-none -z-10 flex items-center justify-center overflow-hidden">
        <div className="absolute -top-32 w-[700px] h-[600px] bg-gradient-to-b from-neutral-100/90 to-transparent rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50" />
      </div>

      <Navbar />

      <section className="pt-36 pb-20 md:pt-44 md:pb-28 max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-[680px] mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-neutral-200/90 mb-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-neutral-800">
              Voice Dictation & Privacy Engineering
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-neutral-950 mb-6">
            Articles & Comparison Guides.
          </h1>

          <p className="text-base sm:text-lg text-neutral-600 leading-relaxed font-normal">
            Technical breakdowns, fair comparison benchmarks, and workflows for air-gapped,
            on-device voice dictation.
          </p>
        </div>

        {/* Short-Form Content Hooks & Key Angles Callout */}
        <div className="p-6 sm:p-7 rounded-3xl bg-neutral-50/80 border border-neutral-200/90 mb-12 shadow-xs">
          <div className="flex items-center justify-between gap-4 mb-3">
            <span className="text-xs font-mono text-emerald-700 uppercase tracking-wider font-semibold">
              Content Strategy & High-Impact Hooks
            </span>
            <span className="text-[11px] font-mono text-neutral-400">Battle-tested angles</span>
          </div>
          <h2 className="text-base font-bold text-neutral-950 mb-3">Core Short-Form Narrative Hooks</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono text-neutral-800">
            <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs">
              <span className="text-emerald-700 block font-semibold mb-1">
                1. The Privacy Contrast
              </span>
              &quot;Your voice dictation app may be uploading every spoken word. Mine does
              not.&quot;
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs">
              <span className="text-emerald-700 block font-semibold mb-1">
                2. The High-Trust Persona
              </span>
              &quot;I built voice typing for people who cannot send client conversations to the
              cloud.&quot;
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs">
              <span className="text-emerald-700 block font-semibold mb-1">
                3. The Architecture Angle
              </span>
              &quot;Cloud transcription is convenient. Local transcription is a completely different
              privacy model.&quot;
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs">
              <span className="text-emerald-700 block font-semibold mb-1">
                4. The Offline Proof
              </span>
              &quot;A demo of voice dictation with Wi-Fi turned completely off.&quot;
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 p-1.5 bg-neutral-100/80 border border-neutral-200/80 rounded-2xl overflow-x-auto w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3.5 py-1.5 rounded-xl transition-all font-medium whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-white text-neutral-950 font-semibold shadow-xs"
                    : "text-neutral-600 hover:text-neutral-950 hover:bg-white/60"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Search topics or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-mono px-4 py-2.5 rounded-2xl bg-white border border-neutral-200/90 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-400 shadow-xs transition-colors"
            />
          </div>
        </div>

        {/* Blog Post Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {filteredPosts.map((post: BlogPost) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group p-6 sm:p-7 rounded-3xl bg-white border border-neutral-200/90 hover:border-neutral-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-medium">
                    {post.category}
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400">{post.readTime}</span>
                </div>

                <h2 className="text-xl font-bold text-neutral-950 group-hover:text-emerald-700 transition-colors mb-2.5 leading-snug">
                  {post.title}
                </h2>

                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-6">
                  {post.description}
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs font-mono text-neutral-500">
                <span>{post.date}</span>
                <span className="text-neutral-900 group-hover:text-emerald-700 group-hover:translate-x-1 transition-all inline-flex items-center gap-1 font-semibold">
                  Read Guide ➔
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center p-8 sm:p-12 rounded-3xl bg-[#141416] text-white border border-neutral-800 shadow-xl relative overflow-hidden">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-emerald-500/10 blur-3xl pointer-events-none" />
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Try private on-device dictation today
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto mb-6 leading-relaxed">
            Free forever, open-source (MIT), and runs 100% locally on your macOS or Windows machine.
          </p>
          <a
            href="/#download"
            className="inline-block text-sm font-semibold text-neutral-950 bg-white hover:bg-neutral-100 px-6 py-2.5 rounded-xl transition-colors shadow-md"
          >
            Download Free Murmur
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
