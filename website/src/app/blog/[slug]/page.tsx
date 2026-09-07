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
          <strong key={i} className="text-neutral-950 font-bold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded-md bg-neutral-100 text-emerald-800 font-mono text-[12px] border border-neutral-200/80"
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
              className="p-4 sm:p-5 rounded-2xl bg-[#0e0e11] border border-neutral-800 font-mono text-xs text-neutral-100 overflow-x-auto my-6 leading-relaxed shadow-sm"
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
            className="my-6 rounded-2xl border border-neutral-200/90 overflow-x-auto bg-white shadow-xs"
          >
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="bg-neutral-50/90 border-b border-neutral-200 text-neutral-800">
                  {header.map((h, hIdx) => (
                    <th key={hIdx} className="p-3.5 font-semibold">
                      {formatInlineMarkdown(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {body.map((r, rIdx) => (
                  <tr key={rIdx} className="hover:bg-neutral-50/50 transition-colors">
                    {r.map((cell, cIdx) => (
                      <td key={cIdx} className="p-3.5">
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
            className="text-2xl sm:text-3xl font-bold text-neutral-950 mt-12 mb-5 tracking-tight"
          >
            {formatInlineMarkdown(line.replace("## ", ""))}
          </h2>,
        );
      } else if (line.startsWith("### ")) {
        elements.push(
          <h3
            key={idx}
            className="text-xl sm:text-2xl font-bold text-neutral-950 mt-10 mb-4 tracking-tight"
          >
            {formatInlineMarkdown(line.replace("### ", ""))}
          </h3>,
        );
      } else if (line.startsWith("#### ")) {
        elements.push(
          <h4 key={idx} className="text-base sm:text-lg font-bold text-emerald-700 mt-6 mb-2">
            {formatInlineMarkdown(line.replace("#### ", ""))}
          </h4>,
        );
      } else if (line.startsWith("---")) {
        elements.push(<hr key={idx} className="border-neutral-200 my-8" />);
      } else if (line.startsWith("- ")) {
        elements.push(
          <li
            key={idx}
            className="text-xs sm:text-sm text-neutral-700 leading-relaxed ml-4 list-disc mb-2"
          >
            {formatInlineMarkdown(line.replace("- ", ""))}
          </li>,
        );
      } else if (/^\d+\.\s/.test(line)) {
        const match = line.match(/^(\d+\.)\s(.*)$/);
        elements.push(
          <div
            key={idx}
            className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-700 leading-relaxed mb-2.5 ml-1"
          >
            <span className="font-mono text-emerald-700 font-semibold shrink-0">
              {match ? match[1] : ""}
            </span>
            <div>{formatInlineMarkdown(match ? match[2] : line)}</div>
          </div>,
        );
      } else if (line.startsWith("> ")) {
        elements.push(
          <blockquote
            key={idx}
            className="p-4 sm:p-5 my-6 rounded-2xl bg-neutral-50/80 border-l-4 border-emerald-600 text-xs sm:text-sm italic text-neutral-800 shadow-2xs"
          >
            {formatInlineMarkdown(line.replace("> ", ""))}
          </blockquote>,
        );
      } else if (line.trim().length > 0) {
        elements.push(
          <p key={idx} className="text-xs sm:text-sm text-neutral-700 leading-relaxed mb-4">
            {formatInlineMarkdown(line)}
          </p>,
        );
      }
    });

    return elements;
  };

  const otherPosts = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <main className="min-h-screen bg-white text-neutral-900 selection:bg-neutral-900 selection:text-white relative overflow-hidden">
      {/* Background glow & subtle texture */}
      <div className="absolute inset-0 pointer-events-none -z-10 flex items-center justify-center overflow-hidden">
        <div className="absolute -top-32 w-[700px] h-[600px] bg-gradient-to-b from-neutral-100/90 to-transparent rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50" />
      </div>

      <Navbar />

      <article className="pt-36 pb-20 md:pt-44 md:pb-28 max-w-3xl mx-auto px-4">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-mono text-neutral-400 mb-8">
          <Link href="/" className="hover:text-neutral-950 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-neutral-950 transition-colors">
            Blog
          </Link>
          <span>/</span>
          <span className="text-emerald-700 font-semibold truncate max-w-[240px]">{post.category}</span>
        </nav>

        {/* Article Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-medium">
              {post.category}
            </span>
            <span className="text-xs font-mono text-neutral-500">
              {post.readTime} · Published {post.date}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-950 mb-6 leading-tight">
            {post.title}
          </h1>

          <p className="text-base sm:text-lg text-neutral-600 leading-relaxed">{post.description}</p>

          {/* Author Badge */}
          <div className="flex items-center gap-3 mt-6 pt-6 border-t border-neutral-200">
            <div className="w-8 h-8 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center font-bold text-xs text-neutral-800">
              {post.author.avatar}
            </div>
            <div>
              <span className="text-xs font-semibold text-neutral-950 block">{post.author.name}</span>
              <span className="text-[11px] font-mono text-neutral-500">{post.author.role}</span>
            </div>
          </div>
        </header>

        {/* Key Takeaways Box */}
        <div className="p-6 sm:p-7 rounded-3xl bg-neutral-50/80 border border-neutral-200/90 mb-12 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-emerald-700 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Key Strategic Takeaways
          </div>
          <ul className="space-y-2">
            {post.keyTakeaways.map((takeaway, idx) => (
              <li
                key={idx}
                className="text-xs sm:text-sm text-neutral-700 leading-relaxed flex items-start gap-2"
              >
                <span className="text-emerald-700 font-mono font-semibold">0{idx + 1}.</span>
                <span>{takeaway}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Rendered Content */}
        <div className="prose prose-neutral max-w-none text-neutral-800">
          {renderFormattedContent(post.content)}
        </div>

        {/* Short-Form Video & Content Hooks Box */}
        {post.shortFormHooks.length > 0 && (
          <div className="my-12 p-6 sm:p-7 rounded-3xl bg-neutral-50/80 border border-neutral-200/90 shadow-xs">
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-700 font-semibold block mb-2">
              Short-Form Content Angle
            </span>
            <div className="space-y-2">
              {post.shortFormHooks.map((hook, hIdx) => (
                <div
                  key={hIdx}
                  className="p-3.5 rounded-2xl bg-white text-xs font-mono text-neutral-800 border border-neutral-200/80 shadow-2xs"
                >
                  &quot;{hook}&quot;
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mid-Article Download Banner */}
        <div className="my-14 p-8 sm:p-12 rounded-3xl bg-[#141416] text-white border border-neutral-800 shadow-xl text-center relative overflow-hidden">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-emerald-500/10 blur-3xl pointer-events-none" />
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Experience 100% On-Device Voice Typing
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto mb-6 leading-relaxed">
            Murmur runs locally on your Mac or Windows PC. No cloud transcription, no audio uploads,
            zero subscriptions.
          </p>
          <a
            href="/#download"
            className="inline-block text-sm font-semibold text-neutral-950 bg-white hover:bg-neutral-100 px-6 py-2.5 rounded-xl transition-colors shadow-md"
          >
            Download Murmur (Free Forever)
          </a>
        </div>

        {/* Related Articles */}
        <div className="pt-12 border-t border-neutral-200">
          <h3 className="text-base font-bold text-neutral-950 mb-6">Related Guides & Analyses</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {otherPosts.map((other: BlogPost) => (
              <Link
                key={other.slug}
                href={`/blog/${other.slug}`}
                className="p-5 rounded-2xl bg-white border border-neutral-200/90 hover:border-neutral-300 hover:shadow-md transition-all block shadow-xs"
              >
                <span className="text-[10px] font-mono text-emerald-700 block mb-1 font-semibold">
                  {other.category}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-neutral-950 line-clamp-2 mb-2">
                  {other.title}
                </h4>
                <span className="text-[11px] font-mono text-neutral-400">{other.readTime}</span>
              </Link>
            ))}
          </div>
        </div>
      </article>

      <Footer />
    </main>
  );
}
