import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { CTABand } from '../components/CTABand';
import { FourPointStar } from '../components/Motifs';
import { PageHero } from '../components/PageHero';
import { Reveal } from '../components/Reveal';
import { SectionHeader } from '../components/SectionHeader';
import { ServiceCard } from '../components/ServiceCard';

export function ServicesPage() {
  useDocumentMeta(siteConfig.meta.services);

  const [openFaqId, setOpenFaqId] = useState<string | null>(
    siteConfig.services.faq.items[0]?.id ?? null
  );

  const toggleFaq = (id: string) => {
    setOpenFaqId((current) => (current === id ? null : id));
  };

  return (
    <>
      {/* 1. Page Hero */}
      <PageHero
        label={siteConfig.services.hero.label}
        title={siteConfig.services.hero.title}
        subtitle={siteConfig.services.hero.subtitle}
      />

      {/* 2. Service cards in 2-column grid */}
      <section className="py-20 sm:py-24 md:py-28 border-b border-charcoal">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <Reveal>
            <SectionHeader
              kicker={siteConfig.services.offerings.kicker}
              title={siteConfig.services.offerings.title}
            />
          </Reveal>

          <div className="mt-10 sm:mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            {siteConfig.services.offerings.items.map((service, idx) => (
              <Reveal key={service.number} delay={Math.min(idx * 0.05, 0.2)}>
                <ServiceCard service={service} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 3. How to Buy: horizontal 3-step strip with thin connecting line */}
      <section className="py-20 sm:py-24 md:py-28 border-b border-charcoal bg-charcoal/20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <Reveal>
            <SectionHeader
              kicker={siteConfig.services.howToBuy.kicker}
              title={siteConfig.services.howToBuy.title}
            />
          </Reveal>

          <div className="relative mt-12 sm:mt-16">
            {/* Thin horizontal connecting line on desktop */}
            <div
              aria-hidden="true"
              className="hidden md:block absolute top-5 left-0 right-0 h-px bg-charcoal"
            />

            <ol className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
              {siteConfig.services.howToBuy.steps.map((step, idx) => (
                <Reveal key={step.number} delay={idx * 0.08} className="relative">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="inline-flex items-center justify-center w-10 h-10 bg-noir border border-charcoal text-xs uppercase tracking-[0.2em] text-ivory tabular-nums">
                      {step.number}
                    </span>
                    <FourPointStar className="w-2.5 h-2.5 text-steel" />
                  </div>

                  <h3 className="font-serif text-2xl sm:text-[28px] font-bold uppercase tracking-[-0.015em] text-ivory mb-2.5">
                    {step.title}
                  </h3>
                  <p className="text-sm sm:text-base text-steel leading-relaxed max-w-xs">
                    {step.description}
                  </p>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* 4. Condition guide table/legend (editable placeholder rows) */}
      <section className="py-20 sm:py-24 md:py-28 border-b border-charcoal">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <Reveal>
            <SectionHeader
              kicker={siteConfig.services.conditionGuide.kicker}
              title={siteConfig.services.conditionGuide.title}
              subtitle={siteConfig.services.conditionGuide.intro}
            />
          </Reveal>

          <Reveal delay={0.08} className="mt-10 sm:mt-12 overflow-x-auto">
            <table className="w-full text-left border-collapse border-t border-b border-charcoal">
              <thead>
                <tr className="border-b border-charcoal text-[11px] uppercase tracking-[0.24em] text-stone">
                  <th scope="col" className="py-4 pr-6 font-medium w-16">
                    No.
                  </th>
                  <th scope="col" className="py-4 pr-6 font-medium w-1/3">
                    Condition Grade
                  </th>
                  <th scope="col" className="py-4 font-medium">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal">
                {siteConfig.services.conditionGuide.grades.map((item, idx) => (
                  <tr key={item.grade} className="hover:bg-charcoal/20 transition-colors">
                    <td className="py-5 pr-6 text-xs text-stone tabular-nums">
                      0{idx + 1}
                    </td>
                    <td className="py-5 pr-6 font-serif text-lg sm:text-xl text-ivory whitespace-nowrap">
                      {item.grade}
                    </td>
                    <td className="py-5 text-sm sm:text-base text-stone italic">
                      {item.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
        </div>
      </section>

      {/* 5. FAQ Accordion */}
      <section className="py-20 sm:py-24 md:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <Reveal>
            <SectionHeader
              kicker={siteConfig.services.faq.kicker}
              title={siteConfig.services.faq.title}
            />
          </Reveal>

          <div className="mt-10 sm:mt-12 border-t border-charcoal">
            {siteConfig.services.faq.items.map((item) => {
              const isOpen = openFaqId === item.id;
              const panelId = `faq-panel-${item.id}`;
              return (
                <div key={item.id} className="border-b border-charcoal">
                  <button
                    type="button"
                    onClick={() => toggleFaq(item.id)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    className="w-full py-6 sm:py-7 flex items-center justify-between gap-6 text-left group cursor-pointer"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-8">
                      <span className="text-[11px] uppercase tracking-[0.24em] text-stone sm:w-32 shrink-0">
                        {item.topic}
                      </span>
                      <span className="font-serif text-xl sm:text-2xl text-ivory group-hover:text-ivory/85 transition-colors">
                        {item.question}
                      </span>
                    </div>

                    <span className="inline-flex items-center justify-center w-9 h-9 border border-charcoal group-hover:border-ivory text-ivory shrink-0 transition-colors">
                      {isOpen ? (
                        <Minus className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <Plus className="w-4 h-4" aria-hidden="true" />
                      )}
                    </span>
                  </button>

                  {isOpen && (
                    <div
                      id={panelId}
                      className="pb-7 sm:pl-40 pr-12"
                    >
                      <p className="text-sm sm:text-base text-stone italic leading-relaxed max-w-2xl">
                        {item.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Final CTA band */}
      <CTABand />
    </>
  );
}
