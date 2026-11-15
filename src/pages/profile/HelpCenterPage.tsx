import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MessageCircle, Phone, Mail } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqs } from "@/data/user";

const SUPPORT_PHONE_DISPLAY = "7842245679";
const SUPPORT_PHONE_TEL = "+917842245679";

const HelpCenterPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-2xl"
        >
          {/* Header */}
          <div className="mb-6 flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/profile")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Help Center</h1>
              <p className="text-sm text-muted-foreground">
                Get answers to common questions
              </p>
            </div>
          </div>

          {/* Contact Options */}
          <div className="mb-6 grid gap-3 sm:grid-cols-3">
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={() => navigate("/contact")}
            >
              <MessageCircle className="h-6 w-6 text-primary" />
              <span>Message us</span>
              <span className="text-xs text-muted-foreground">
                Contact form — we reply within 24h
              </span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              asChild
            >
              <a href={`tel:${SUPPORT_PHONE_TEL}`}>
                <Phone className="h-6 w-6 text-primary" />
                <span>Call Us</span>
                <span className="text-xs text-muted-foreground">
                  {SUPPORT_PHONE_DISPLAY}
                </span>
              </a>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              asChild
            >
              <a href="mailto:admin@purvita.in">
                <Mail className="h-6 w-6 text-primary" />
                <span>Email</span>
                <span className="text-xs text-muted-foreground">
                  admin@purvita.in
                </span>
              </a>
            </Button>
          </div>

          {/* FAQs */}
          <div className="rounded-xl bg-card p-4 shadow-sm">
            <h2 className="mb-4 font-semibold">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-sm">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Still need help */}
          <div className="mt-6 rounded-xl bg-primary/5 p-6 text-center">
            <h3 className="font-semibold">Still need help?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Our support team is always ready to assist you
            </p>
            <Button className="mt-4" onClick={() => navigate("/contact")}>
              <MessageCircle className="mr-2 h-4 w-4" />
              Contact Support
            </Button>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default HelpCenterPage;
