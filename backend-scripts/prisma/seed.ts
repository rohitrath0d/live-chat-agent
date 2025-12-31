import  {prisma} from '../src/connections/db-orm/dbConnection.js'; 
// import { PrismaClient } from '../prisma/generated/prisma/client.js';

async function main() {
  // Seed FAQ data
  const faqs = [
    {
      question: "Do you ship internationally?",
      answer: "Yes, we ship to most countries. Shipping costs vary depending on your location.",
    },
    {
      question: "What is your return policy?",
      answer: "You can return unused items within 30 days for a full refund.",
    },
    {
      question: "When is customer support available?",
      answer: "Our support team is available Monday to Friday, 9am to 6pm EST.",
    },
    {
      question: "How long does shipping take?",
      answer: "Shipping usually takes between 5-7 business days depending on your location.",
    },
    {
      question: "Do you offer refunds for damaged items?",
      answer: "Yes, please contact our support team with a photo of the damaged item for a full refund.",
    },
  ];

  // Insert FAQ entries into the database
  for (const faq of faqs) {
    await prisma.fAQ.create({
      data: faq,
    });
  }

  console.log("FAQ data seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
