const { GoogleGenerativeAI } = require("@google/generative-ai");

const generateDescription = async (req, res) => {
    console.log("AI Endpoint Hit. Body:", req.body);
    const { title, category } = req.body;
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        console.log("API Key present:", !!apiKey);

        if (!apiKey) {
            // Mock response if no key
            return res.json({
                description: `(AI Mock) An exquisite ${title} handcrafted with traditional ${category} techniques. This premium item is made from sustainable materials and features unique patterns characteristic of rural artistry.`,
                tags: ["Handmade", "Eco-friendly", "Premium", category]
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `Write a highly detailed, premium e-commerce product description for a handcrafted item titled "${title}" in the category "${category}". 
        Include:
        1. An engaging emotional hook/story about its rural origin and craftsmanship.
        2. A "Key Features" section with bullet points highlighting material, texture, and durability.
        3. A "Care Instructions" note.
        4. 5 relevant SEO tags.
        
        Format the response strictly as valid JSON with keys: "description" (string, use markdown for formatting like **bold** headers) and "tags" (array of strings). Avoid using markdown code blocks in the output, just raw JSON text.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Basic cleaning to ensure JSON parsing if model adds markdown blocks
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        res.json(JSON.parse(cleanedText));

    } catch (err) {
        console.error("AI Error:", err);
        // Fallback
        res.json({
            description: `A beautiful handcrafted ${title}.`,
            tags: ["Handmade", category]
        });
    }
};

module.exports = { generateDescription };
