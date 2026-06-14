const { groq } = require('../config/gemini');

/**
 * Detect the subject from a student query using Groq
 */
const detectSubject = async (question) => {
  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an academic classifier. Given a student question, classify it into one of these subjects: Mathematics, Physics, Chemistry, Biology, History, Geography, English, Computer Science, Economics, General. Return ONLY the name of the subject as a single word.'
        },
        {
          role: 'user',
          content: question
        }
      ],
      max_tokens: 10,
      temperature: 0.1,
    });

    const subject = response.choices[0].message.content.trim();
    const validSubjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'English', 'Computer Science', 'Economics', 'General'];
    
    // Clean any trailing punctuation or extra characters
    const cleanSubject = validSubjects.find(s => subject.toLowerCase().includes(s.toLowerCase()));
    return cleanSubject || 'General';
  } catch (error) {
    console.error('Subject detection error:', error);
    return 'General';
  }
};

/**
 * Generate a detailed academic tutoring response
 */
const generateTutoringResponse = async (question, subject, conversationHistory = []) => {
  const detectedSub = (subject === 'General' || !subject) ? await detectSubject(question) : subject;

  const systemPrompt = `You are "AI Doubt Solver", a friendly AI tutor and companion.
Your job is to help the student understand their doubts in an encouraging, friendly, and conversational way (like a helpful classmate or "bro").
Subject context: The student's question is about ${detectedSub}.

Follow these guidelines:
1. Provide a direct, clear summary of the answer.
2. Break down the solution step-by-step.
3. Use Markdown headings (e.g. ### Step 1), bold text, bullet points, and numbered lists to make it readable.
4. If there is code, format it in markdown code blocks with the language tag (e.g. \`\`\`javascript).
5. If there are equations, use clear notation.
6. Keep the tone encouraging, positive, and casual. Use simple friendly emojis (like 😄, 😂, 👍, 🙌) to make it engaging.
7. Detect the language of the student's question (e.g., English, Hindi, or Telugu). You MUST reply matching the language of their question, and you MUST follow these script/style guidelines strictly:
   - If the question is in Telugu (whether in Telugu script or English alphabet Tanglish), your entire response must be in Telugu but written in the English/Latin alphabet (Tanglish). Do NOT write Telugu script. Do NOT translate sentences to English. Do NOT mix English sentences. For example, explain the concept using Tanglish spelling: "Biryani chesukovachu, endukante..." instead of "You can make biryani, because...".
   - If the question is in Hindi (whether in Devanagari script or English alphabet Hinglish), your entire response must be in Hindi but written in the English/Latin alphabet (Hinglish). Do NOT write Devanagari script. Do NOT translate to English.
   - Use colloquial, daily day-to-day conversational vocabulary. Avoid complex, formal regional terms.
   - If the question is in English, reply in English.
8. If the student's question is a simple casual greeting, small talk, or personal/casual question (e.g. 'hi', 'hello', 'thinnava' / 'had your food', 'kya kar rahe ho', 'how are you', 'ha ayyindhi'), respond warmly, casually, and briefly like a companion/friend. Do NOT give academic lectures or subject explanations for casual greetings.
   Use these direct examples as style guidelines:
   - If the student asks 'thinnava' or 'had your food' in Tanglish, respond: "Haha 😄 nenu AI ni bro, thinalenu. Meeru thinnara? Breakfast/lunch complete ayyinda?"
   - If the student replies 'ha' or 'ha ayyindhi' or 'yes', respond: "Super 😄 Em thinnav bro? Meals ah, tiffin ah?"
   - Keep casual talk brief, friendly, and ask how you can help them with their studies today.`;

  // Format conversation history for Groq
  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.map(m => ({
      role: m.role,
      content: m.content
    })),
    { role: 'user', content: question }
  ];

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages,
    max_tokens: 1500,
    temperature: 0.7,
  });

  return {
    answer: response.choices[0].message.content,
    subject: detectedSub
  };
};

/**
 * Analyze image to extract question and subject using LLaMA Scout Vision
 */
const analyzeImage = async (fileBuffer, mimetype) => {
  const base64Image = fileBuffer.toString('base64');
  const response = await groq.chat.completions.create({
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimetype};base64,${base64Image}`
            }
          },
          {
            type: 'text',
            text: 'Analyze this image. Extract the question, equation, or diagram shown. Return ONLY a JSON object: {"question": "the extracted text or problem statement", "subject": "Math/Physics/Chemistry/Biology/History/etc"}. Do not return any other text, prefix, or markdown formatting.'
          }
        ]
      }
    ],
    max_tokens: 500,
    temperature: 0.1,
  });

  const content = response.choices[0].message.content;
  const jsonMatch = content.match(/\{[\s\S]*?\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      return { question: content, subject: 'General' };
    }
  }
  return { question: content, subject: 'General' };
};

module.exports = {
  detectSubject,
  generateTutoringResponse,
  analyzeImage
};
