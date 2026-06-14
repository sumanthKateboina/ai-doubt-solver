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

  const systemPrompt = `You are "AI Doubt Solver", an expert academic tutor.
Your job is to help the student understand their doubt by providing a clear, friendly, and step-by-step explanation.
Subject context: The student's question is about ${detectedSub}.

Follow these guidelines:
1. Provide a direct, clear summary of the answer.
2. Break down the solution step-by-step.
3. Use Markdown headings (e.g. ### Step 1), bold text, bullet points, and numbered lists to make it readable.
4. If there is code, format it in markdown code blocks with the language tag (e.g. \`\`\`javascript).
5. If there are equations, use clear notation.
6. Keep the tone encouraging and positive. Do not just give the final answer, teach them the concept.
7. Detect the language of the student's question (e.g., English, Hindi, or Telugu). You MUST reply matching the language of their question, but follow these script/style guidelines:
   - If the question is in Telugu, reply in Telugu but write the words in the English/Latin alphabet (Tanglish). For example, write "Nuvvu ela unnavu?" instead of "నువ్వు ఎలా ఉన్నావు?".
   - If the question is in Hindi, reply in Hindi but write the words in the English/Latin alphabet (Hinglish). For example, write "Aap kaise hain?" instead of "आप कैसे हैं?".
   - Use colloquial, daily day-to-day conversational language. Avoid overly complex, formal, or pure regional vocabulary that is hard to understand.
   - If the question is in English, reply in English.
8. If the student's question is a simple casual greeting, small talk, or personal question (e.g. 'hi', 'hello', 'thinnava' / 'had your food', 'kya kar rahe ho', 'how are you'), respond warmly, casually, and briefly in the same language/script (e.g. Hinglish for Hindi, Tanglish for Telugu). Do not give academic lectures or subject explanations for casual greetings. Keep the response short and friendly, and ask how you can help them with their doubts today.`;

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
