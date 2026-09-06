/* eslint-disable @next/next/no-html-link-for-pages */
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BLOG_POSTS, BlogPost } from "@/data/blogPosts";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) return { title: "Article Not Found · Murmur" };

  return {
    title: `${post.title} · Murmur Blog`,
    description: post.description,
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  // Helper to parse inline markdown: **bold** and `code`
  const formatInlineMarkdown = (text: string): React.ReactNode => {
    // Regex for matching **bold** or `code`
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="text-white font-bold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded bg-[#1f1f1f] text-emerald-400 font-mono text-[12px] border border-[#313131]"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  // Helper to format markdown headers and blocks into clean HTML structure
  const renderFormattedContent = (rawText: string) => {
    const lines = rawText.trim().split("\n");
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBuffer: string[] = [];
    let inTable = false;
    let tableBuffer: string[] = [];

    lines.forEach((line, idx) => {
      // Code blocks
      if (line.startsWith("```")) {
        if (inCodeBlock) {
          elements.push(
            <pre
              key={`code-${idx}`}
              className="p-4 rounded-xl bg-[#141414] border border-[#313131] font-mono text-xs text-white/90 overflow-x-auto my-6 leading-relaxed"
            >
              <code>{codeBuffer.join("\n")}</code>
            </pre>,
          );
          codeBuffer = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      // Tables
      if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
        inTable = true;
        tableBuffer.push(line);
        return;
      } else if (inTable) {
        // flush table
        const rows = tableBuffer.map((r) =>
          r
            .split("|")
            .filter((_, cIdx, arr) => cIdx > 0 && cIdx < arr.length - 1)
            .map((c) => c.trim()),
        );
        const header = rows[0];
        const body = rows.slice(2);

        elements.push(
          <div
            key={`table-${idx}`}
            className="my-6 rounded-xl border border-[#313131] overflow-x-auto bg-[#141414]"
          >
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="bg-[#1f1f1f] border-b border-[#313131] text-white/90">
                  {header.map((h, hIdx) => (
                    <th key={hIdx} className="p-3 font-semibold">
                      {formatInlineMarkdown(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#272727] text-white/70">
                {body.map((r, rIdx) => (
                  <tr key={rIdx} className="hover:bg-[#181818]">
                    {r.map((cell, cIdx) => (
                      <td key={cIdx} className="p-3">
                        {formatInlineMarkdown(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>,
        );
        tableBuffer = [];
        inTable = false;
      }

      // Headings
      if (line.startsWith("## ")) {
        elements.push(
          <h2
            key={idx}
            className="text-2xl sm:text-3xl font-bold text-white mt-12 mb-5 tracking-tight"
          >
            {formatInlineMarkdown(line.replace("## ", ""))}
          </h2>,
        );
      } else if (line.startsWith("### ")) {
        elements.push(
          <h3
            key={idx}
            className="text-xl sm:text-2xl font-bold text-white mt-10 mb-4 tracking-tight"
          >
            {formatInlineMarkdown(line.replace("### ", ""))}
          </h3>,
        );
      } else if (line.startsWith("#### ")) {
        elements.push(
          <h4 key={idx} className="text-base sm:text-lg font-bold text-emerald-400 mt-6 mb-2">
            {formatInlineMarkdown(line.replace("#### ", ""))}
          </h4>,
        );
      } else if (line.startsWith("---")) {
        elements.push(<hr key={idx} className="border-[#272727] my-8" />);
      } else if (line.startsWith("- ")) {
        elements.push(
          <li
            key={idx}
            className="text-xs sm:text-sm text-white/80 leading-relaxed ml-4 list-disc mb-2"
          >
            {formatInlineMarkdown(line.replace("- ", ""))}
          </li>,
        );
      } else if (/^\d+\.\s/.test(line)) {
        const match = line.match(/^(\d+\.)\s(.*)$/);
        elements.push(
          <div
            key={idx}
            className="flex items-start gap-2.5 text-xs sm:text-sm text-white/80 leading-relaxed mb-2.5 ml-1"
          >
            <span className="font-mono text-emerald-400 font-semibold shrink-0">
              {match ? match[1] : ""}
            </span>
            <div>{formatInlineMarkdown(match ? match[2] : line)}</div>
          </div>,
        );
      } else if (line.startsWith("> ")) {
        elements.push(
          <blockquote
            key={idx}
            className="p-4 my-6 rounded-xl bg-[#141414] border-l-2 border-emerald-400 text-xs sm:text-sm italic text-white/90"
          >
            {formatInlineMarkdown(line.replace("> ", ""))}
          </blockquote>,
        );
      } else if (line.trim().length > 0) {
        elements.push(
          <p key={idx} className="text-xs sm:text-sm text-white/80 leading-relaxed mb-4">
            {formatInlineMarkdown(line)}
          </p>,
        );
      }
    });

    return elements;
  };

  const otherPosts = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <main className="min-h-screen bg-[#000000] text-white selection:bg-white/20 selection:text-white">
      <Navbar />

      <article className="pt-36 pb-20 md:pt-44 md:pb-28 max-w-3xl mx-auto px-4">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-mono text-white/50 mb-8">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-white transition-colors">
            Blog
          </Link>
          <span>/</span>
          <span className="text-emerald-400 truncate max-w-[240px]">{post.category}</span>
        </nav>

        {/* Article Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#181818] text-emerald-400 border border-[#313131]">
              {post.category}
            </span>
            <span className="text-xs font-mono text-white/40">
              {post.readTime} · Published {post.date}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
            {post.title}
          </h1>

          <p className="text-base sm:text-lg text-white/70 leading-relaxed">{post.description}</p>

          {/* Author Badge */}
          <div className="flex items-center gap-3 mt-6 pt-6 border-t border-[#272727]">
            <div className="w-8 h-8 rounded-full bg-[#1f1f1f] border border-[#313131] flex items-center justify-center font-bold text-xs text-white">
              {post.author.avatar}
            </div>
            <div>
              <span className="text-xs font-semibold text-white block">{post.author.name}</span>
              <span className="text-[11px] font-mono text-white/40">{post.author.role}</span>
            </div>
          </div>
        </header>

        {/* Key Takeaways Box */}
        <div className="p-6 rounded-2xl bg-[#141414] border border-[#2b2b2b] mb-12">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Key Strategic Takeaways
          </div>
          <ul className="space-y-2">
            {post.keyTakeaways.map((takeaway, idx) => (
              <li
                key={idx}
                className="text-xs sm:text-sm text-white/80 leading-relaxed flex items-start gap-2"
              >
                <span className="text-emerald-400 font-mono">0{idx + 1}.</span>
                <span>{takeaway}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Rendered Content */}
        <div className="prose prose-invert max-w-none text-white/80">
          {renderFormattedContent(post.content)}
        </div>

        {/* Short-Form Video & Content Hooks Box */}
        {post.shortFormHooks.length > 0 && (
          <div className="my-12 p-6 rounded-2xl bg-[#181818] border border-[#313131]">
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold block mb-2">
              Short-Form Content Angle
            </span>
            <div className="space-y-2">
              {post.shortFormHooks.map((hook, hIdx) => (
                <div
                  key={hIdx}
                  className="p-3 rounded-lg bg-[#1f1f1f] text-xs font-mono text-white/90 border border-[#272727]"
                >
                  &quot;{hook}&quot;
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mid-Article Download Banner */}
        <div className="my-14 p-8 rounded-2xl bg-gradient-to-b from-[#181818] to-[#121212] border border-[#313131] text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            Experience 100% On-Device Voice Typing
          </h2>
          <p className="text-xs sm:text-sm text-white/70 max-w-md mx-auto mb-6 leading-relaxed">
            Murmur runs locally on your Mac or Windows PC. No cloud transcription, no audio uploads,
            zero subscriptions.
          </p>
          <a
            href="/#download"
            className="inline-block text-sm font-semibold text-black bg-white hover:bg-white/90 px-6 py-2.5 rounded-full transition-colors shadow-lg"
          >
            Download Murmur (Free Forever)
          </a>
        </div>

        {/* Related Articles */}
        <div className="pt-12 border-t border-[#272727]">
          <h3 className="text-base font-bold text-white mb-6">Related Guides & Analyses</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {otherPosts.map((other: BlogPost) => (
              <Link
                key={other.slug}
                href={`/blog/${other.slug}`}
                className="p-4 rounded-xl bg-[#141414] border border-[#272727] hover:border-white/40 transition-colors block"
              >
                <span className="text-[10px] font-mono text-emerald-400 block mb-1">
                  {other.category}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-2 mb-2">
                  {other.title}
                </h4>
                <span className="text-[11px] font-mono text-white/40">{other.readTime}</span>
              </Link>
            ))}
          </div>
        </div>
      </article>

      <Footer />
    </main>
  );
}
