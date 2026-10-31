import Reveal from "@/components/motion/Reveal";

const feedbackTopics = [
  {
    title: "Product feedback",
    description: "Share what you think about a PURVITA product using the form below.",
  },
  {
    title: "Questions & suggestions",
    description: "Send your question or suggestion to the PURVITA team.",
  },
  {
    title: "Order support",
    description: "Sign in and visit My Orders to view your order history.",
  },
];

const FeedbackHighlights = () => (
  <section className="mb-10 overflow-hidden" aria-labelledby="feedback-heading">
    <Reveal distance={12} amount={0.15}>
      <div className="mb-5 text-center">
        <h3
          id="feedback-heading"
          className="font-brand text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl"
        >
          We&apos;d love your feedback
        </h3>
        <p className="mt-2 font-body text-sm leading-relaxed text-muted-foreground sm:text-base">
          Product thoughts, questions, and suggestions are all welcome.
        </p>
      </div>
    </Reveal>

    <Reveal distance={10} amount={0.1}>
      <div className="relative">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-background to-transparent sm:w-16"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-background to-transparent sm:w-16"
          aria-hidden
        />
        <div className="marquee-track flex w-max animate-marquee">
          {[0, 1].map((copy) => (
            <div
              key={copy}
              className="flex shrink-0 gap-4 px-2 sm:gap-5 sm:px-3"
              aria-hidden={copy === 1}
            >
              {feedbackTopics.map((topic) => (
                <article
                  key={`${copy}-${topic.title}`}
                  className="w-[min(76vw,20rem)] rounded-2xl border border-border/70 bg-card/90 p-4 shadow-card sm:w-[19rem] sm:p-5"
                >
                  <h4 className="font-brand text-lg font-semibold text-primary">
                    {topic.title}
                  </h4>
                  <p className="mt-1.5 font-body text-sm leading-relaxed text-muted-foreground">
                    {topic.description}
                  </p>
                </article>
              ))}
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  </section>
);

export default FeedbackHighlights;
