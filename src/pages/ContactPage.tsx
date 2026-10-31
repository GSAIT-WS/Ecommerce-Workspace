import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Phone, MapPin, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FeedbackHighlights from "@/components/FeedbackHighlights";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const contactFaqs = [
  {
    question: "How can I share product feedback?",
    answer: "Use the contact form and include the product name along with your feedback.",
  },
  {
    question: "Where can I view my order history?",
    answer: "Sign in to your account and open My Orders to view your orders.",
  },
  {
    question: "How can I browse PURVITA products?",
    answer: "Use the Shop section to browse products, search, and apply filters.",
  },
];

const ContactPage = ({ embedded = false }: { embedded?: boolean }) => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = "Name is required";
    if (!formData.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()))
      errs.email = "Enter a valid email";
    if (!formData.message.trim()) errs.message = "Message is required";
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {!embedded && <Navbar />}

      <main
        id={embedded ? "contact" : undefined}
        className={`w-full px-4 py-8 sm:px-6 md:px-8 md:py-12 lg:px-12 ${
          embedded ? "scroll-mt-28" : ""
        }`}
      >
        {!embedded && (
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        )}

        <div className="mt-8 w-full">
          <h1 className="mb-2 text-center font-brand text-3xl font-semibold tracking-[-0.03em] text-foreground md:text-4xl">
            Contact &amp; Feedback
          </h1>
          <p className="mb-10 text-center font-body text-muted-foreground">
            Contact our team, share product feedback, or browse answers to common questions.
          </p>

          <FeedbackHighlights />

          <div className="grid gap-8 md:grid-cols-2">
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
                {[
                  { icon: Mail, label: "Email", value: "hello@purvita.in" },
                  { icon: Phone, label: "Phone", value: "+91 80 1234 5678" },
                  { icon: MapPin, label: "Address", value: "123, HSR Layout, Bangalore, Karnataka 560102" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-body text-xs font-medium text-muted-foreground">
                        {item.label}
                      </p>
                      <p className="font-body text-sm font-semibold text-foreground">
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl bg-primary/5 p-6 text-center">
                <p className="font-display text-sm font-bold text-primary">
                  💬 We typically respond within 24 hours
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="mb-5 font-brand text-xl font-semibold text-foreground">
                Send us a message
              </h2>
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10">
                    <CheckCircle2 className="h-8 w-8 text-secondary" />
                  </div>
                  <h3 className="mb-2 font-display text-xl font-bold text-foreground">
                    Message Sent!
                  </h3>
                  <p className="mb-6 font-body text-sm text-muted-foreground">
                    Thanks for reaching out. We'll get back to you soon.
                  </p>
                  <Button
                    variant="outline"
                    className="rounded-full font-body text-sm"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: "", email: "", message: "" });
                    }}
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-body text-sm">Name</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      maxLength={100}
                      value={formData.name}
                      onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                      className="rounded-lg"
                    />
                    {errors.name && <p className="font-body text-xs text-destructive">{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-body text-sm">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      maxLength={255}
                      value={formData.email}
                      onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                      className="rounded-lg"
                    />
                    {errors.email && <p className="font-body text-xs text-destructive">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message" className="font-body text-sm">
                      Message or product feedback
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Include the product name if you’re sharing product feedback."
                      maxLength={1000}
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                      className="rounded-lg"
                    />
                    {errors.message && <p className="font-body text-xs text-destructive">{errors.message}</p>}
                  </div>
                  <Button
                    type="submit"
                    className="w-full rounded-full bg-primary py-5 font-body font-semibold text-primary-foreground"
                  >
                    Send Message
                  </Button>
                </form>
              )}
            </div>
          </div>

          <section className="mt-10 rounded-2xl border border-border/70 bg-card/80 p-5 shadow-card sm:p-7" aria-labelledby="contact-faq-heading">
            <h2
              id="contact-faq-heading"
              className="mb-3 font-brand text-2xl font-semibold text-foreground sm:text-3xl"
            >
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {contactFaqs.map((faq, index) => (
                <AccordionItem key={faq.question} value={`contact-faq-${index}`}>
                  <AccordionTrigger className="text-left font-body text-sm sm:text-base">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="font-body leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        </div>
      </main>

      {!embedded && <Footer />}
    </div>
  );
};

export default ContactPage;
