"use client";

import { memberFeedback, memberFeedbackCopy, memberFeedbackIds, type MemberFeedbackId } from "@/lib/member-feedback";
import { useLanguage } from "./language-provider";

export function MemberTestimonial({ memberId, compact = false }: { memberId: MemberFeedbackId; compact?: boolean }) {
  const { language } = useLanguage();
  const member = memberFeedback[memberId];

  return (
    <figure className={compact ? "ri-price-testimonial" : "ri-member-testimonial"}>
      <blockquote><p>{member.quote[language]}</p></blockquote>
      <figcaption>
        <strong><bdi>{member.name}</bdi></strong>
        <span>{member.feature[language]}</span>
      </figcaption>
      {language !== "en" && <p className="ri-testimonial-translation">{memberFeedbackCopy[language].translationNote}</p>}
    </figure>
  );
}

export function MemberTestimonials() {
  const { language } = useLanguage();
  const copy = memberFeedbackCopy[language];

  return (
    <section className="ri-section ri-testimonials" id="member-feedback" aria-labelledby="member-feedback-title">
      <div className="ri-section-heading">
        <span>{copy.eyebrow}</span>
        <h2 id="member-feedback-title">{copy.title}</h2>
        <p>{copy.description}</p>
      </div>
      <div className="ri-testimonial-grid">
        {memberFeedbackIds.map((memberId) => <MemberTestimonial key={memberId} memberId={memberId} />)}
      </div>
    </section>
  );
}
