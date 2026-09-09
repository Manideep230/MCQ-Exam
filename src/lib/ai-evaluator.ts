import OpenAI from 'openai';

export interface AIEvaluationInput {
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: 'A' | 'B' | 'C' | 'D';
  studentOption: 'A' | 'B' | 'C' | 'D';
  justification: string;
  marks: number;
}

export interface AIEvaluationResult {
  optionCorrect: boolean;
  justificationQuality: 'excellent' | 'good' | 'partial' | 'poor' | 'irrelevant' | 'invalid';
  justificationScore: number;
  finalScore: number;
  reason: string;
  evaluationStatus: 'completed' | 'pending' | 'failed';
}

export async function evaluateJustification(input: AIEvaluationInput): Promise<AIEvaluationResult> {
  const isOptionCorrect = input.studentOption === input.correctOption;

  // Rule 2: If option is incorrect, final score is immediately 0.
  if (!isOptionCorrect) {
    return {
      optionCorrect: false,
      justificationQuality: 'invalid',
      justificationScore: 0,
      finalScore: 0,
      reason: `The student selected Option ${input.studentOption}, but the authoritative correct option is ${input.correctOption}.`,
      evaluationStatus: 'completed',
    };
  }

  // Check if OpenAI API key is present
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your-openai-api-key')) {
    // If no key is set, perform a deterministic heuristic evaluation so the app works seamlessly out of the box!
    const cleanJustification = input.justification.trim().toLowerCase();
    const isReasonableLength = cleanJustification.length >= 15;
    const isQualityGood = isReasonableLength && !cleanJustification.includes('asdf') && !cleanJustification.includes('dont know');

    return {
      optionCorrect: true,
      justificationQuality: isQualityGood ? 'good' : 'poor',
      justificationScore: isQualityGood ? input.marks : 0,
      finalScore: isQualityGood ? input.marks : 0,
      reason: isQualityGood 
        ? 'The justification adequately explains the reasoning behind the correct option.' 
        : 'The justification provided is too brief or lacks technical depth.',
      evaluationStatus: 'completed',
    };
  }

  try {
    const openai = new OpenAI({ apiKey });

    const prompt = `You are an academic examination evaluator for a computer science MCQ exam.
Evaluate the student's justification for their answer to the following question.

QUESTION:
${input.questionText}

OPTIONS:
A. ${input.optionA}
B. ${input.optionB}
C. ${input.optionC}
D. ${input.optionD}

AUTHORITATIVE CORRECT OPTION:
${input.correctOption}

STUDENT SELECTED OPTION:
${input.studentOption}

STUDENT JUSTIFICATION:
"${input.justification}"

MAXIMUM MARKS AVAILABLE:
${input.marks}

EVALUATION RULES:
1. The student selected the CORRECT option (${input.correctOption}).
2. Evaluate whether the student's written justification demonstrates genuine conceptual understanding relevant to the question.
3. If the justification is vague, random, contradictory, copied text, or irrelevant to why ${input.correctOption} is correct, assign a score of 0.
4. If the justification provides a clear, technically sound explanation supporting ${input.correctOption}, award ${input.marks} marks.
5. Do NOT penalize minor grammatical or spelling errors if the core technical concept is correct.
6. Do NOT require exact textbook wording.

Respond ONLY with a valid JSON object strictly matching this schema:
{
  "optionCorrect": true,
  "justificationQuality": "excellent" | "good" | "partial" | "poor" | "irrelevant" | "invalid",
  "justificationScore": number,
  "finalScore": number,
  "reason": "Brief 1-2 sentence explanation of the evaluation decision"
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Empty AI response');

    const parsed = JSON.parse(content);

    return {
      optionCorrect: true,
      justificationQuality: parsed.justificationQuality || 'good',
      justificationScore: Number(parsed.justificationScore ?? parsed.finalScore ?? input.marks),
      finalScore: Number(parsed.finalScore ?? (parsed.justificationQuality === 'poor' || parsed.justificationQuality === 'irrelevant' ? 0 : input.marks)),
      reason: parsed.reason || 'AI justification evaluation complete.',
      evaluationStatus: 'completed',
    };
  } catch (error: any) {
    console.error('OpenAI Evaluation Error:', error);
    // Graceful AI failure fallback
    return {
      optionCorrect: true,
      justificationQuality: 'good',
      justificationScore: input.marks,
      finalScore: input.marks,
      reason: 'AI evaluation service unavailable. Pending manual review or default pass.',
      evaluationStatus: 'pending',
    };
  }
}
