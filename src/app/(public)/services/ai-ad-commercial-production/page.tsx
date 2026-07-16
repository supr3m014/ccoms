'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Reveal } from '@/components/Reveal'
import {
  ArrowRight, ArrowUpRight, Plus, Minus, CheckCircle2, AlertCircle, Film,
  Target, PenTool, ScrollText, LayoutTemplate, Wand2, Scissors, Ratio, ShieldCheck,
  Megaphone, Globe, Mail, MousePointerClick, Repeat, Presentation,
} from 'lucide-react'

const NAVY = '#0A1730'
const CAL = 'https://calendly.com/ccoms/discovery-call'

/* ─────────────────────────── Data ─────────────────────────── */

const FORMATS = [
  { label: 'Landscape', ratio: '16:9', box: 'w-40 h-[90px]' },
  { label: 'Square', ratio: '1:1', box: 'w-[104px] h-[104px]' },
  { label: 'Vertical', ratio: '9:16', box: 'w-[64px] h-[114px]' },
  { label: 'Cutdown', ratio: ':06', box: 'w-24 h-[68px]' },
]

const PRODUCTION_TYPES = [
  { icon: Film, title: 'Product and Service Commercials', desc: 'Explain the problem, value, mechanism, proof, and action through a concise commercial narrative.' },
  { icon: Presentation, title: 'Launch Films', desc: 'Introduce a new product, application, platform, offer, or business direction.' },
  { icon: Megaphone, title: 'Paid-Social Ad Creatives', desc: 'Campaign-ready vertical, square, and landscape assets for Meta, TikTok, YouTube, LinkedIn, and other approved channels.' },
  { icon: ScrollText, title: 'Explainers and Feature Stories', desc: 'Translate complex products, systems, data, or technical capabilities into clear visual communication.' },
  { icon: Wand2, title: 'Brand and Positioning Films', desc: 'Express the company’s point of view, category position, or strategic message.' },
  { icon: Ratio, title: 'Animated Data and Visual Narratives', desc: 'Turn statistics, systems, processes, comparisons, and product logic into understandable motion.' },
  { icon: Scissors, title: 'Campaign Cutdowns and Variants', desc: 'Adapt the core commercial into shorter hooks, alternate openings, platform formats, and selected audience variations.' },
]

const METHOD = [
  { icon: Target, title: 'Commercial Objective', desc: 'Define the audience, offer, campaign role, desired action, platform, and success criteria.' },
  { icon: MousePointerClick, title: 'Positioning and Message', desc: 'Clarify the problem, promise, proof, difference, objections, and call to action.' },
  { icon: PenTool, title: 'Concept and Script', desc: 'Develop the central creative idea, narrative structure, dialogue or voiceover, visual direction, and duration.' },
  { icon: LayoutTemplate, title: 'Storyboard and Style Frames', desc: 'Approve key scenes, composition, product treatment, typography, brand usage, and visual consistency before full production.' },
  { icon: Wand2, title: 'AI-Assisted Production', desc: 'Generate or produce approved scenes, motion, voice, sound, graphics, product imagery, and transitions using the appropriate tools.' },
  { icon: Film, title: 'Editing and Brand Control', desc: 'Assemble timing, pacing, audio, subtitles, disclaimers, logo, end card, and campaign message.' },
  { icon: Ratio, title: 'Format Adaptation', desc: 'Prepare approved versions for required placements, aspect ratios, lengths, and file specifications.' },
  { icon: ShieldCheck, title: 'Review and Delivery', desc: 'Apply defined revision rounds, quality checks, rights review, and final export.' },
]

const DELIVERABLES = [
  'Campaign / creative brief', 'Positioning summary', 'Concept options', 'Script', 'Storyboard', 'Style frames',
  'Master commercial', 'Selected cutdowns', 'Selected aspect ratios', 'Captions / subtitles', 'End cards',
  'Thumbnails / key visuals', 'Approved source files (where contracted)', 'Usage and licensing summary', 'Delivery specifications',
]
const SCOPE_DEFINE = [
  'Number of concepts', 'Duration', 'Number of scenes', 'Approved outputs', 'Aspect ratios', 'Voice requirements',
  'Music / sound', 'Subtitles', 'Language versions', 'Revision rounds', 'Product assets', 'Likeness / character requirements',
  'Platform rights', 'Usage duration', 'Delivery format',
]

const CONTROLS = [
  { title: 'Brand Consistency', desc: 'Approved product appearance, colors, typography, logo, message, and tone.' },
  { title: 'Visual Continuity', desc: 'Character, object, environment, lighting, and scene consistency across generated sequences.' },
  { title: 'Claim Accuracy', desc: 'No unsupported performance, medical, financial, technical, or product claims.' },
  { title: 'Rights and Usage', desc: 'Tool-license limitations, stock/music terms, voice rights, trademarks, likeness, and client-provided asset permissions.' },
  { title: 'Disclosure and Platform Requirements', desc: 'Apply disclosures or restrictions required by law, platform policy, sector regulation, or client governance.' },
  { title: 'Human Review', desc: 'Every final asset is reviewed for narrative clarity, visual artifacts, factual accuracy, brand alignment, and delivery requirements.' },
]

const GROWTH_OUTPUTS = [
  { icon: Megaphone, label: 'Meta campaign' },
  { icon: MousePointerClick, label: 'Landing page' },
  { icon: Globe, label: 'Website hero' },
  { icon: Presentation, label: 'Sales presentation' },
  { icon: Mail, label: 'Email launch' },
  { icon: Scissors, label: 'Organic cutdowns' },
  { icon: Repeat, label: 'Remarketing' },
]

const ENGAGEMENTS = [
  { title: 'Single Commercial', desc: 'One defined concept and master output.' },
  { title: 'Campaign Asset System', desc: 'Master commercial plus selected cutdowns, formats, hooks, thumbnails, or variants.' },
  { title: 'Launch Story Package', desc: 'Positioning, script, launch film, product visuals, landing-page assets, and selected campaign adaptations.' },
  { title: 'Ongoing Creative Production', desc: 'A recurring production backlog supporting active campaigns, subject to defined monthly capacity and approval workflow.' },
]

const PRICING_FACTORS = ['Concept complexity', 'Duration', 'Scene count', 'Visual consistency', 'Product realism', 'Characters / voices', 'Languages', 'Motion / data graphics', 'Music & licensing', 'Output formats', 'Revision rounds', 'Turnaround', 'Regulatory review']

const FAQS = [
  { q: 'Is this traditional filming?', a: 'The primary offer is AI-assisted and AI-generated commercial production combined with scripting, editing, sound, motion, and campaign adaptation. Traditional filming or location production is only offered when explicitly available and included.' },
  { q: 'Can you make realistic people or product scenes?', a: 'Potentially, depending on the concept, rights, reference material, technical feasibility, and required consistency. The production plan sets realistic expectations before approval.' },
  { q: 'Can the video be used for paid advertising?', a: 'Yes — when the creative, claims, aspect ratios, duration, usage rights, and platform requirements are prepared for the intended campaign.' },
  { q: 'Do you guarantee ad performance?', a: 'No. Creative quality affects performance, but results also depend on offer, audience, placement, budget, landing experience, competition, timing, and sales process.' },
  { q: 'How many revisions are included?', a: 'The proposal defines concept, storyboard, rough-cut, and final revision stages. Changes after an approved stage may require additional scope. We do not advertise unlimited revisions.' },
  { q: 'Who owns the final asset?', a: 'Usage, ownership, project files, tool limitations, third-party licenses, music, voice, stock, and reusable production elements are defined in the contract.' },
]

/* ─────────────────────────── Helpers ─────────────────────────── */

function Kicker({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return <span className={`inline-block text-xs font-semibold uppercase tracking-[0.24em] mb-4 ${light ? 'text-amber-400' : 'text-amber-700'}`}>{children}</span>
}
function GoldButton({ href, children, external = false }: { href: string; children: React.ReactNode; external?: boolean }) {
  const cls = 'group inline-flex items-center justify-center gap-2.5 bg-[#0A1730] hover:bg-[#122548] text-white font-semibold px-7 py-3.5 rounded-lg transition-colors'
  const inner = <>{children} <ArrowRight className="w-4 h-4 text-amber-400 transition-transform group-hover:translate-x-1" /></>
  return external ? <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a> : <Link href={href} className={cls}>{inner}</Link>
}
function OutlineButton({ href, children, light = false }: { href: string; children: React.ReactNode; light?: boolean }) {
  const cls = light
    ? 'inline-flex items-center justify-center gap-2 border border-white/25 text-white hover:border-white/60 font-semibold px-7 py-3.5 rounded-lg transition-colors'
    : 'inline-flex items-center justify-center gap-2 border cc-rule-md text-[#0A1730] hover:border-[#0A1730] font-semibold px-7 py-3.5 rounded-lg transition-colors'
  return (
    <Link href={href} className={cls}>
      {children} <ArrowUpRight className="w-4 h-4" />
    </Link>
  )
}

/* A single film frame (styled, not fake footage) */
function Frame({ children, className = '', dark = false }: { children?: React.ReactNode; className?: string; dark?: boolean }) {
  return (
    <div className={`relative rounded-lg overflow-hidden border ${dark ? 'border-white/15 bg-white/[0.05]' : 'border-slate-200 bg-slate-100'} ${className}`}>
      <div className="absolute inset-x-0 top-0 h-2 flex items-center justify-between px-1 opacity-40">
        {Array.from({ length: 8 }).map((_, i) => <span key={i} className={`w-1 h-1 rounded-[1px] ${dark ? 'bg-white/40' : 'bg-slate-400'}`} />)}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  )
}

/* ─────────────────────────── Page ─────────────────────────── */

export default function AiAdCommercialProductionPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  return (
    <div className="relative overflow-hidden cc-canvas text-[#0A1730]">

      {/* ══════════ 1 · HERO ══════════ */}
      <section className="relative border-b cc-rule">
        <div className="container-custom pt-36 pb-20 lg:pt-44 lg:pb-24">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-14 lg:gap-12 items-center">
            <div>
              <Kicker>AI Ad &amp; Commercial Production</Kicker>
              <h1 className="text-4xl md:text-5xl lg:text-[3.4rem] font-bold leading-[1.06] tracking-tight text-[#0A1730]">
                Turn the Offer Into a Commercial People Can Understand and Remember.
              </h1>
              <p className="mt-7 text-lg md:text-xl text-slate-600 leading-relaxed max-w-xl">
                Core Conversion develops story-led advertising and commercial assets using AI-assisted visual production,
                scripting, motion, editing, sound, and campaign adaptation.
              </p>
              <p className="mt-5 flex items-start gap-3 text-base text-slate-800 max-w-xl">
                <span className="h-px w-8 bg-amber-500 shrink-0 mt-3" />
                Built to communicate value — not merely generate impressive scenes.
              </p>
              <div className="mt-9 flex flex-col sm:flex-row gap-4">
                <GoldButton href={CAL} external>Discuss Your Campaign</GoldButton>
                <OutlineButton href="#work">View Production Examples</OutlineButton>
              </div>
            </div>

            {/* storyboard → final */}
            <div className="relative">
              <div className="rounded-xl border cc-rule-md cc-canvas-white p-6 shadow-[0_24px_60px_-30px_rgba(10,23,48,0.35)]">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-700 mb-4">Storyboard → Final</p>
                <div className="flex items-center gap-2.5 mb-5">
                  {['01', '02', '03'].map((n) => (
                    <Frame key={n} className="w-1/3 aspect-video">
                      <span className="text-xs font-bold text-slate-400">{n}</span>
                    </Frame>
                  ))}
                  <ArrowRight className="w-5 h-5 text-amber-600 shrink-0" />
                  <Frame className="w-1/3 aspect-video ring-1 ring-amber-500/60">
                    <Film className="w-6 h-6 text-amber-600" />
                  </Frame>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {FORMATS.map((f) => (
                    <span key={f.ratio} className="text-[11px] font-semibold text-slate-700 bg-white border cc-rule-md rounded-full px-3 py-1">{f.ratio} · {f.label}</span>
                  ))}
                </div>
                <div className="mt-5 pt-4 border-t cc-rule flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-slate-400">Every asset</span>
                  <span className="text-sm font-semibold text-amber-700">Message-first</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ 2 · THE COMMERCIAL PROBLEM ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-alt border-y cc-rule">
        <div className="container-custom">
          <Reveal className="max-w-3xl mb-12">
            <Kicker>The Commercial Problem</Kicker>
            <h2 className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold leading-[1.12] text-slate-900">
              A Beautiful Video Can Still Fail to Sell the Idea.
            </h2>
            <p className="mt-5 text-lg text-slate-600 leading-relaxed">
              AI can reduce production barriers and expand creative possibilities. It does not replace positioning,
              message discipline, story structure, brand control, or campaign judgment.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-6">
            <Reveal>
              <div className="h-full rounded-2xl bg-white border border-slate-200 p-8">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4">Impressive but unclear</p>
                <p className="text-[17px] text-slate-600 leading-relaxed">
                  Striking visuals that win attention but leave the audience unsure what is being offered, who it is for,
                  or why it matters — attention without comprehension.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="h-full rounded-2xl bg-[#0A1730] text-white p-8">
                <p className="text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-4">Commercially structured</p>
                <p className="text-[15px] text-slate-300 mb-4">Commercial creative must help the audience understand:</p>
                <ul className="space-y-2.5">
                  {['what is being offered', 'who it is for', 'why it matters', 'why the claim should be believed', 'what action should happen next'].map((t) => (
                    <li key={t} className="flex gap-3 text-[15px] text-slate-200"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-1" />{t}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>

          <Reveal className="mt-8">
            <p className="border-l-2 border-amber-400 pl-5 text-[17px] font-semibold text-slate-800 leading-snug max-w-3xl">
              Core Conversion uses AI as a production capability inside a commercial process — not as the strategy itself.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══════════ 3 · WHAT WE PRODUCE ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-white">
        <div className="container-custom">
          <Reveal className="max-w-3xl mb-12">
            <Kicker>What We Produce</Kicker>
            <h2 className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold leading-[1.12] text-slate-900">
              One Idea, Adapted to Every Placement.
            </h2>
            <p className="mt-5 text-lg text-slate-600 leading-relaxed">
              A single commercial concept is produced and re-cut for the formats each channel actually needs.
            </p>
          </Reveal>

          {/* format morph */}
          <Reveal className="mb-14">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 flex flex-wrap items-end justify-center gap-6">
              {FORMATS.map((f, i) => (
                <div key={f.ratio} className="flex items-center gap-6">
                  <div className="flex flex-col items-center gap-2">
                    <Frame className={f.box}><Film className="w-5 h-5 text-slate-400" /></Frame>
                    <span className="text-xs font-semibold text-slate-500">{f.ratio} · {f.label}</span>
                  </div>
                  {i < FORMATS.length - 1 && <ArrowRight className="w-4 h-4 text-amber-400 hidden sm:block" />}
                </div>
              ))}
            </div>
          </Reveal>

          {/* production types as editorial rows */}
          <div className="grid md:grid-cols-2 gap-x-10 gap-y-6">
            {PRODUCTION_TYPES.map(({ icon: Icon, title, desc }) => (
              <Reveal key={title}>
                <div className="flex gap-4 border-t border-slate-200 pt-5">
                  <span className="w-11 h-11 rounded-xl bg-[#0A1730] flex items-center justify-center shrink-0"><Icon className="w-5 h-5 text-amber-400" /></span>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                    <p className="mt-1 text-[15px] text-slate-600 leading-relaxed">{desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ 4 · PRODUCTION METHOD (filmstrip) ══════════ */}
      <section className="py-24 md:py-28 relative cc-canvas-alt border-y cc-rule">
        <div className="container-custom relative z-10">
          <Reveal className="max-w-3xl mb-14">
            <Kicker>The Production Method</Kicker>
            <h2 className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold leading-[1.12] text-[#0A1730]">
              A Continuous Line From Objective to Delivery.
            </h2>
          </Reveal>

          <div className="relative">
            <span className="absolute left-[27px] top-2 bottom-2 w-px bg-gradient-to-b from-amber-500/70 via-[rgba(10,23,48,0.15)] to-amber-500/70 md:hidden" aria-hidden />
            <div className="grid md:grid-cols-4 gap-x-5 gap-y-8">
              {METHOD.map(({ icon: Icon, title, desc }, i) => (
                <Reveal key={title} delay={(i % 4) * 0.06}>
                  <div className="relative md:pt-0 pl-16 md:pl-0">
                    <span className="absolute md:static left-0 top-0 md:mb-4 inline-flex items-center gap-2">
                      <span className="w-14 h-14 rounded-xl bg-white border cc-rule-md flex items-center justify-center relative z-10 shadow-sm">
                        <Icon className="w-6 h-6 text-[#0A1730]" />
                      </span>
                    </span>
                    <div className="md:mt-4">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-amber-700">Stage {String(i + 1).padStart(2, '0')}</span>
                      <h3 className="text-lg font-bold text-[#0A1730] mt-0.5">{title}</h3>
                      <p className="mt-1.5 text-[14.5px] text-slate-600 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ 5 · WHAT THE CLIENT RECEIVES ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-alt border-y cc-rule">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <Reveal className="lg:sticky lg:top-28">
              <Kicker>What the Client Receives</Kicker>
              <h2 className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold leading-[1.12] text-slate-900">
                Defined Deliverables, Defined Scope.
              </h2>
              <p className="mt-5 text-lg text-slate-600 leading-relaxed max-w-md">
                Every engagement states exactly what is produced and under what boundaries — so expectations, rights, and
                revisions are clear before production begins.
              </p>
              <div className="mt-7 rounded-2xl bg-white border border-slate-200 p-6">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">The proposal defines</p>
                <div className="flex flex-wrap gap-2">
                  {SCOPE_DEFINE.map((s) => (
                    <span key={s} className="rounded-full bg-slate-50 border border-slate-200 px-3 py-1.5 text-[12.5px] font-medium text-slate-700">{s}</span>
                  ))}
                </div>
                <p className="mt-4 text-[13px] text-amber-700 font-semibold">We do not advertise “unlimited revisions.”</p>
              </div>
            </Reveal>

            <Reveal delay={0.05}>
              <div className="rounded-2xl bg-white border border-slate-200 p-8">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-5">Possible deliverables</p>
                <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
                  {DELIVERABLES.map((d) => (
                    <li key={d} className="flex gap-3 text-[15px] text-slate-700 leading-snug"><CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />{d}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════ 6 · AI PRODUCTION WITH COMMERCIAL GOVERNANCE ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-white">
        <div className="container-custom">
          <Reveal className="max-w-3xl mb-12">
            <Kicker>Commercial Governance</Kicker>
            <h2 className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold leading-[1.12] text-slate-900">
              AI Production, Under Commercial Control.
            </h2>
            <p className="mt-5 text-lg text-slate-600 leading-relaxed">
              Every asset moves through a quality-control pipeline before it represents your brand in market.
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CONTROLS.map(({ title, desc }, i) => (
              <Reveal key={title} delay={(i % 3) * 0.06}>
                <div className="h-full rounded-2xl border border-slate-200 bg-slate-50/60 p-6">
                  <span className="text-sm font-bold text-slate-300 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1 mb-1.5">{title}</h3>
                  <p className="text-[15px] text-slate-600 leading-relaxed">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-8">
            <p className="border-l-2 border-amber-400 pl-5 text-[17px] font-semibold text-slate-800 leading-snug max-w-3xl">
              AI lowers some production barriers. It does not remove the need for approval, rights management, factual
              control, or professional review.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══════════ 7 · CONNECTION TO THE GROWTH SYSTEM ══════════ */}
      <section className="py-24 md:py-28 relative cc-canvas-alt border-y cc-rule">
        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16 items-center">
            <Reveal>
              <Kicker>Connection to the Growth System</Kicker>
              <h2 className="text-3xl md:text-4xl lg:text-[2.6rem] font-bold leading-[1.14] text-[#0A1730]">
                One Commercial Idea Can Support the Entire Campaign System.
              </h2>
              <p className="mt-5 text-[17px] text-slate-600 leading-relaxed">
                Commercial production creates more value when the message, landing experience, targeting, follow-up, and
                measurement are aligned. Core Conversion can deliver it as a focused engagement or integrate it into a
                broader digital marketing program.
              </p>
              <div className="mt-8"><Link href="/services/digital-marketing-services" className="inline-flex items-center gap-2 text-amber-700 font-semibold hover:gap-3 transition-all">See the digital marketing program <ArrowRight className="w-4 h-4" /></Link></div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="rounded-xl border cc-rule-md cc-canvas-white p-7 shadow-[0_18px_50px_-30px_rgba(10,23,48,0.3)]">
                <div className="flex justify-center mb-6">
                  <span className="inline-flex items-center gap-2.5 rounded-full bg-[#0A1730] px-5 py-2.5">
                    <Film className="w-4 h-4 text-amber-400" /><span className="font-bold text-white text-sm">One Commercial</span>
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {GROWTH_OUTPUTS.map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2.5 rounded-xl border cc-rule bg-white px-3.5 py-3">
                      <Icon className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="text-[13px] font-medium text-slate-700 leading-snug">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════ 8 · FEATURED WORK ══════════ */}
      <section id="work" className="py-24 md:py-28 cc-noir scroll-mt-20">
        <div className="container-custom">
          <Reveal className="max-w-3xl mb-10">
            <Kicker light>Featured Work</Kicker>
            <h2 className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold leading-[1.12] text-white">
              How a Commercial Is Built — From Brief to Delivered Formats.
            </h2>
            <p className="mt-5 text-lg text-slate-300 leading-relaxed">
              A representative production flow. Approved client reels are embedded here as each campaign clears rights and
              usage — we do not publish unapproved work or invented results.
            </p>
          </Reveal>

          <Reveal>
            <div className="rounded-2xl border border-white/10 bg-white p-8 md:p-10 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)]">
              <div className="grid md:grid-cols-4 gap-6 items-center">
                <div className="text-center">
                  <div className="flex justify-center gap-1.5 mb-3">{['01', '02', '03'].map(n => <Frame key={n} className="w-12 aspect-video"><span className="text-[9px] font-bold text-slate-400">{n}</span></Frame>)}</div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Storyboard</p>
                </div>
                <div className="text-center"><ArrowRight className="w-5 h-5 text-amber-400 mx-auto mb-3" /><Frame className="w-24 aspect-video mx-auto"><LayoutTemplate className="w-5 h-5 text-slate-400" /></Frame><p className="mt-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Style Frames</p></div>
                <div className="text-center"><ArrowRight className="w-5 h-5 text-amber-400 mx-auto mb-3" /><Frame className="w-24 aspect-video mx-auto ring-1 ring-amber-400/40"><Film className="w-5 h-5 text-amber-500" /></Frame><p className="mt-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Master Cut</p></div>
                <div className="text-center">
                  <div className="flex justify-center items-end gap-1.5 mb-3">{FORMATS.slice(0, 3).map(f => <Frame key={f.ratio} className={f.ratio === '9:16' ? 'w-6 h-11' : 'w-11 aspect-video'} />)}</div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Delivered Formats</p>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-200 grid sm:grid-cols-3 gap-4 text-[14px]">
                <div><dt className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">Objective</dt><dd className="text-slate-700">Make a new offer understood and memorable to a defined audience.</dd></div>
                <div><dt className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">Approach</dt><dd className="text-slate-700">Positioning → script → approved storyboard → AI-assisted production → brand-controlled edit.</dd></div>
                <div><dt className="text-[11px] font-bold uppercase tracking-widest text-amber-600 mb-1">Delivered</dt><dd className="text-slate-900 font-semibold">Master commercial + platform cutdowns in required aspect ratios.</dd></div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════ 9 · ENGAGEMENT TYPES & INVESTMENT ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-white">
        <div className="container-custom">
          <Reveal className="max-w-3xl mb-12">
            <Kicker>Engagement &amp; Investment</Kicker>
            <h2 className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold leading-[1.12] text-slate-900">
              Choose the Scope That Fits the Campaign.
            </h2>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {ENGAGEMENTS.map(({ title, desc }, i) => (
              <Reveal key={title} delay={(i % 4) * 0.06}>
                <div className="h-full rounded-2xl border border-slate-200 bg-slate-50/60 p-6">
                  <span className="w-9 h-9 rounded-lg bg-[#0A1730] text-amber-400 font-bold flex items-center justify-center mb-4">{i + 1}</span>
                  <h3 className="text-lg font-bold text-slate-900 mb-1.5 leading-snug">{title}</h3>
                  <p className="text-[15px] text-slate-600 leading-relaxed">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 overflow-hidden grid lg:grid-cols-2">
              <div className="p-9 md:p-11">
                <h3 className="text-2xl font-bold text-slate-900">Investment Follows the Production, Not a Fixed Menu.</h3>
                <p className="mt-4 text-[16px] text-slate-600 leading-relaxed">
                  Starting ranges are shared during discovery, once the concept and outputs are understood. Final
                  investment reflects real production hours, tool costs, rights, revision risk, and complexity.
                </p>
                <div className="mt-6"><GoldButton href={CAL} external>Scope Your Production</GoldButton></div>
              </div>
              <div className="cc-canvas-alt border-t lg:border-t-0 lg:border-l cc-rule p-9 md:p-11">
                <p className="text-[11px] font-bold uppercase tracking-widest text-amber-700 mb-4">What shapes the range</p>
                <div className="flex flex-wrap gap-2">
                  {PRICING_FACTORS.map((f) => (
                    <span key={f} className="rounded-full bg-white border cc-rule-md px-3 py-1.5 text-[13px] font-medium text-slate-700">{f}</span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════ 10 · FAQs ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-alt border-y cc-rule">
        <div className="container-custom">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16 items-start">
            <Reveal className="lg:sticky lg:top-28">
              <Kicker>Decision Support</Kicker>
              <h2 className="text-3xl md:text-4xl font-bold leading-[1.14] text-slate-900">
                Questions Before You Commission a Commercial.
              </h2>
            </Reveal>
            <Reveal delay={0.05} className="divide-y divide-slate-200 border-y border-slate-200">
              {FAQS.map((f, i) => {
                const open = openFaq === i
                return (
                  <div key={f.q}>
                    <button onClick={() => setOpenFaq(open ? null : i)} aria-expanded={open} className="w-full flex items-start justify-between gap-6 text-left py-6 group">
                      <span className="text-lg font-semibold text-slate-900 group-hover:text-amber-600 transition-colors">{f.q}</span>
                      <span className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center shrink-0 mt-0.5 text-slate-500 group-hover:border-amber-400 group-hover:text-amber-600 transition-colors">
                        {open ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </span>
                    </button>
                    <div className={`grid transition-all duration-300 ease-out ${open ? 'grid-rows-[1fr] opacity-100 pb-6' : 'grid-rows-[0fr] opacity-0'}`}>
                      <div className="overflow-hidden"><p className="text-[16px] text-slate-600 leading-relaxed max-w-2xl">{f.a}</p></div>
                    </div>
                  </div>
                )
              })}
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════ 11 · FINAL CTA ══════════ */}
      <section className="relative py-28 md:py-32 cc-noir overflow-hidden">
        <div className="container-custom relative z-10">
          <Reveal className="max-w-3xl mx-auto text-center">
            <span className="block h-10 w-px bg-amber-400 mx-auto mb-8" aria-hidden />
            <Kicker light>Start With the Message</Kicker>
            <h2 className="text-3xl md:text-5xl font-bold leading-[1.1] text-white">Start With the Commercial Message.</h2>
            <p className="mt-6 text-lg md:text-xl text-slate-300 leading-relaxed">
              Tell us what the business is offering, who must understand it, where the campaign will run, and what action
              the audience should take.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <a href={CAL} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center justify-center gap-2.5 bg-amber-400 hover:bg-amber-300 text-[#0B0C10] font-semibold px-7 py-3.5 rounded-lg transition-colors">
                Discuss Your Commercial <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>
              <OutlineButton href="/portfolio" light>View Production Work</OutlineButton>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
