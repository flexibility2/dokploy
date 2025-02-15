"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

const faqs = [
  {
    question: "How secure is TOM3 Console?",
    answer:
      "TOM3 Console implements bank-grade security protocols, including multi-factor authentication, end-to-end encryption, and regular security audits to ensure your assets are protected.",
  },
  {
    question: "Can I integrate with existing blockchain networks?",
    answer:
      "Yes, TOM3 Console supports integration with major blockchain networks and can be customized to work with your specific requirements.",
  },
  {
    question: "What kind of support do you offer?",
    answer:
      "We provide 24/7 technical support, comprehensive documentation, and dedicated account managers for enterprise clients.",
  },
  {
    question: "Is there a free trial available?",
    answer:
      "Yes, we offer a 14-day free trial with full access to all features, allowing you to thoroughly evaluate our platform.",
  },
];

export const FAQSection = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-3xl mx-auto"
    >
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </motion.div>
  );
};
