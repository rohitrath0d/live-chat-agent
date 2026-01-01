// Prisma documentation upgrade
// If you use default output (node_modules/.prisma/client), you can still do:
// import {PrismaClient} from '@prisma/client';  -- but this doesnt work 
// If you use custom output path, the import changes:
import "dotenv/config";
import { PrismaClient } from '../../../prisma/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
export const prisma = new PrismaClient({
    adapter
});
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
    console.log("FAQ data seeded successfully! ------------>", faqs);
}
main()
    .catch((e) => {
    throw e;
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=dbConnection.js.map