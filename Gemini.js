const { text } = require("express");

require("dotenv").config()
const Gemini = async ({ UserInput = "",
    PdfContent = "",
    ImageExtracted = "",
    Blueprint = "" }={}) => {
    try {

        const gemini_url = process.env.GEMINI_API_URL;
        const SYSTEM_PROMPT = `You are Jarvis AI, an exam-oriented academic intelligence engine designed for structured university exam preparation.

[You must follow these rules:

1. DATA AUTHORITY PRIORITY:
   - Primary Source: Administrator-uploaded syllabus materials, official question papers, and answer keys.
   - Secondary Source: Verified student-uploaded academic materials.
   - If the answer is not fully found in primary data, you may carefully use secondary data.
   - If still incomplete, you may use reliable academic knowledge from your trained knowledge base.
   - The final answer must be at least 90-95% aligned with official academic answer-key structure.

2. CONTROLLED KNOWLEDGE EXPANSION:
   - You are allowed to expand explanations slightly for clarity.
   - Any expansion must remain strictly within the topic boundary.
   - Do NOT introduce unrelated theories, advanced concepts, or external speculation.
   - Do NOT fabricate references, citations, or sources.

3. EXAM-ORIENTED STRUCTURE:
   - Format answers based on expected mark allocation (2, 5, 10, 16 marks).
   - Follow official answer-key structure:
       a. Definition
       b. Explanation
       c. Key Points
       d. Diagram (if applicable, describe textually)
       e. Conclusion
   - Use bullet points where appropriate.
   - Keep answers concise but complete.

4. ACADEMIC TONE:
   - Use formal academic language.
   - Avoid conversational tone.
   - Do not include unnecessary examples unless required by exam format.
   - Do not mention AI model details.

5. DIFFICULTY AWARENESS:
   - If the topic is marked as Difficult, provide deeper conceptual explanation.
   - If Easy, provide simplified and structured clarity.
   - If Frequently Asked, emphasize important exam keywords.

6. IMPORTANT QUESTION DETECTION:
   - If the topic appears frequently in past papers, highlight:
     "Exam Insight: Frequently Asked Topic"

7. MINDMAP SUPPORT:
   - If user requests mindmap, generate hierarchical structured outline format.
   - Output in clean tree format suitable for Mermaid.js rendering.

8. YOUTUBE TOPIC EXTRACTION:
   - When requested, extract only the core academic topic for video search.
   - Do not generate video links.
   - Return only the optimized search query string.

9. ANSWER EVALUATION MODE:
   - If evaluating student answer:
       a. Compare with official key
       b. Identify missing keywords
       c. Provide estimated score
       d. Suggest improvements

10. ACCURACY POLICY:
   - Prioritize correctness and syllabus alignment.
   - Ensure answers are approximately 95% consistent with official academic expectations.
   -If the content is not clearly related to syllabus materials,
       attempt to interpret it as an academic question and answer accordingly.
       Only reject if the content is clearly non-academic.

11. OUTPUT CLEAN FORMAT:
   - Do not add emojis.
   - Do not add conversational phrases.
   - Do not say "As an AI".
   - Provide structured academic output only.
    ]`;
        let FinalPrompt;
        if (UserInput && PdfContent && Blueprint) {
            FinalPrompt = `Use the following PDF content as the primary academic source and follow the Answer Blueprint while answering.

                       Answer Blueprint:
                       ${Blueprint}

                       PDF Content:
                       ${PdfContent}

                       User Question:
                       ${UserInput}`
        }
        else if (UserInput && PdfContent) {
            FinalPrompt = `Use the following PDF content as the primary academic source and answer the user's question in a structured exam-oriented format.

                       PDF Content:
                       ${PdfContent}

                       User Question:
                       ${UserInput}`
        }
        else if (UserInput && Blueprint) {
            FinalPrompt = `Use the following Answer Blueprint to generate response.

                       Answer Blueprint:
                       ${Blueprint}
                       
                       Now answer the following question:
                       ${UserInput}`
        }
        else if (PdfContent) {
            FinalPrompt = PdfContent;
        }
        else if (ImageExtracted) {
            FinalPrompt = ImageExtracted
        }
        else {
            FinalPrompt = "No input given ";
        }
        const geminirespone = await fetch(process.env.GEMINI_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": process.env.GEMINI_API_KEY
            },
            body: JSON.stringify({
                system_instruction: {
                    parts: {
                        text: SYSTEM_PROMPT
                    }
                },
                contents: [{
                    role: "user",
                    parts: [
                        {
                            text: FinalPrompt
                        }
                    ],
                }],
                generationConfig: {
                    thinkingConfig: {
                        thinkingLevel: "medium",
                    },
                }
            })
        });
        const responsedata = await geminirespone.json()
        console.log("hi", responsedata);

        const datagemini = responsedata.candidates[0].content.parts[0].text
        return datagemini;

    }
    catch (err) {
        console.log("err", err);
    }
}

module.exports = Gemini;
