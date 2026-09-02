"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BLOG_POSTS, BlogPost } from "@/data/blogPosts";

export default function BlogIndexPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = ["All", "Comparisons", "Privacy & Security", "Guides"];

  const filteredPosts = BLOG_POSTS.filter((post) => {
    const matchesCategory =
      selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-[#000000] text-white selection:bg-white/20 selection:text-white">
      <Navbar />

      <section className="pt-36 pb-20 md:pt-44 md:pb-28 max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-[680px] mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181818] border border-[#313131] mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-semibold text-white/90">
              Voice Dictation & Privacy Engineering
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white mb-6">
            Articles & Comparison Guides.
          </h1>

          <p className="text-base sm:text-lg text-white/70 leading-relaxed font-normal">
            Technical breakdowns, fair comparison benchmarks, and workflows for air-gapped, on-device voice dictation.
          </p>
        </div>

        {/* Short-Form Content Hooks & Key Angles Callout */}
        <div className="p-6 rounded-2xl bg-[#141414] border border-[#2b2b2b] mb-12">
          <div className="flex items-center justify-between gap-4 mb-3">
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-semibold">
              Content Strategy & High-Impact Hooks
            </span>
            <span className="text-[11px] font-mono text-white/40">
              Battle-tested angles
            </span>
          </div>
          <h2 className="text-base font-bold text-white mb-3">
            Core Short-Form Narrative Hooks
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono text-white/80">
            <div className="p-3 rounded-lg bg-[#1f1f1f] border border-[#313131]">
              <span className="text-emerald-400 block font-semibold mb-1">1. The Privacy Contrast</span>
              &quot;Your voice dictation app may be uploading every spoken word. Mine does not.&quot;
            </div>
            <div className="p-3 rounded-lg bg-[#1f1f1f] border border-[#313131]">
              <span className="text-emerald-400 block font-semibold mb-1">2. The High-Trust Persona</span>
              &quot;I built voice typing for people who cannot send client conversations to the cloud.&quot;
            </div>
            <div className="p-3 rounded-lg bg-[#1f1f1f] border border-[#313131]">
              <span className="text-emerald-400 block font-semibold mb-1">3. The Architecture Angle</span>
              &quot;Cloud transcription is convenient. Local transcription is a completely different privacy model.&quot;
            </div>
            <div className="p-3 rounded-lg bg-[#1f1f1f] border border-[#313131]">
              <span className="text-emerald-400 block font-semibold mb-1">4. The Offline Proof</span>
              &quot;A demo of voice dictation with Wi-Fi turned completely off.&quot;
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#181818] border border-[#313131] rounded-xl overflow-x-auto w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3.5 py-1.5 rounded-lg transition-all font-medium whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-white text-black font-semibold shadow-sm"
                    : "text-white/60 hover:text-white hover:bg-[#222222]"
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
              className="w-full text-xs font-mono px-3.5 py-2 rounded-xl bg-[#181818] border border-[#313131] text-white placeholder-white/40 focus:outline-none focus:border-white/60 transition-colors"
            />
          </div>
        </div>

        {/* Blog Post Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {filteredPosts.map((post: BlogPost) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group p-6 rounded-2xl bg-[#181818] border border-[#313131] hover:border-white/40 transition-all duration-500 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#222222] text-emerald-400 border border-[#313131]">
                    {post.category}
                  </span>
                  <span className="text-[11px] font-mono text-white/40">
                    {post.readTime}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors mb-2.5 leading-snug">
                  {post.title}
                </h2>

                <p className="text-xs sm:text-sm text-white/70 leading-relaxed mb-6">
                  {post.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[#272727] flex items-center justify-between text-xs font-mono text-white/50">
                <span>{post.date}</span>
                <span className="text-white group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 font-semibold">
                  Read Guide ➔
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center p-8 rounded-2xl bg-[#181818] border border-[#313131]">
          <h2 className="text-2xl font-bold text-white mb-2">
            Try private on-device dictation today
          </h2>
          <p className="text-xs sm:text-sm text-white/70 max-w-md mx-auto mb-6">
            Free forever, open-source (MIT), and runs 100% locally on your macOS or Windows machine.
          </p>
          <a
            href="/#download"
            className="inline-block text-sm font-semibold text-black bg-white hover:bg-white/90 px-6 py-2.5 rounded-full transition-colors"
          >
            Download Free Murmur
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
