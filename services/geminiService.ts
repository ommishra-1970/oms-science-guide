import { GoogleGenAI, Type } from "@google/genai";
import { Subject, MCQ, Difficulty, Language, SubjectiveSet, StudyGuide, ConceptMapNode } from '../types';

const mcqSchema = {
  type: Type.OBJECT,
  properties: {
    question: {
      type: Type.STRING,
      description: "The main body of the multiple-choice question. It should be innovative and test higher-order thinking skills."
    },
    options: {
      type: Type.ARRAY,
      description: "An array of 4 potential answers.",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "A unique identifier for the option, e.g., 'A', 'B', 'C', 'D'." },
          text: { type: Type.STRING, description: "The text of the answer option." }
        },
        required: ['id', 'text']
      }
    },
    answer: {
      type: Type.OBJECT,
      description: "The correct answer and its detailed explanation.",
      properties: {
        correctOptionId: { type: Type.STRING, description: "The 'id' of the correct option." },
        explanation: {
          type: Type.STRING,
          description: "A detailed, step-by-step explanation of why this option is the correct answer. It should clarify the underlying scientific concepts."
        }
      },
      required: ['correctOptionId', 'explanation']
    },
    distractors: {
      type: Type.ARRAY,
      description: "Explanations for why the incorrect options (distractors) are wrong.",
      items: {
        type: Type.OBJECT,
        properties: {
          optionId: { type: Type.STRING, description: "The 'id' of an incorrect option." },
          explanation: { type: Type.STRING, description: "A detailed explanation of the misconception or error that makes this option incorrect." }
        },
        required: ['optionId', 'explanation']
      }
    }
  },
  required: ['question', 'options', 'answer', 'distractors']
};

const mcqsArraySchema = {
    type: Type.ARRAY,
    items: mcqSchema
};

const subjectiveQuestionSchema = {
    type: Type.OBJECT,
    properties: {
        question: {
            type: Type.STRING,
            description: "The main body of the subjective question."
        },
        answer: {
            type: Type.STRING,
            description: "A detailed answer for the question, following the specified length constraints. The answer must start with 'Answer :'."
        }
    },
    required: ['question', 'answer']
};

const subjectiveSetSchema = {
    type: Type.OBJECT,
    properties: {
        veryShortAnswer: {
            type: Type.ARRAY,
            description: "An array of exactly 10 very short answer questions.",
            items: subjectiveQuestionSchema
        },
        shortAnswer: {
            type: Type.ARRAY,
            description: "An array of exactly 6 short answer questions.",
            items: subjectiveQuestionSchema
        },
        longAnswer: {
            type: Type.ARRAY,
            description: "An array of exactly 4 long answer questions.",
            items: subjectiveQuestionSchema
        }
    },
    required: ['veryShortAnswer', 'shortAnswer', 'longAnswer']
};

const studyGuideSchema = {
    type: Type.OBJECT,
    properties: {
        summary: {
            type: Type.ARRAY,
            description: "A concise summary of the chapter's main topics, presented as a list of bullet points.",
            items: { type: Type.STRING }
        },
        keywords: {
            type: Type.ARRAY,
            description: "A list of important keywords or terms from the chapter, each with a clear and simple definition.",
            items: {
                type: Type.OBJECT,
                properties: {
                    term: { type: Type.STRING, description: "The keyword or scientific term." },
                    definition: { type: Type.STRING, description: "The definition of the term." }
                },
                required: ['term', 'definition']
            }
        },
        difficultConcepts: {
            type: Type.ARRAY,
            description: "A breakdown of concepts within the chapter that students often find difficult, explained in a simple, easy-to-understand manner.",
            items: {
                type: Type.OBJECT,
                properties: {
                    concept: { type: Type.STRING, description: "The name of the difficult concept." },
                    explanation: { type: Type.STRING, description: "A simplified explanation of the concept." }
                },
                required: ['concept', 'explanation']
            }
        },
        commonMistakes: {
            type: Type.ARRAY,
            description: "A list of common mistakes or misconceptions students have about the topics in this chapter.",
            items: { type: Type.STRING }
        },
        examTips: {
            type: Type.ARRAY,
            description: "Actionable tips and strategies for studying this chapter and answering related questions in an exam.",
            items: { type: Type.STRING }
        }
    },
    required: ['summary', 'keywords', 'difficultConcepts', 'commonMistakes', 'examTips']
};

const level4 = { type: Type.OBJECT, properties: { concept: { type: Type.STRING }, children: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: {concept: {type: Type.STRING}} } } }, required: ['concept'] };
const level3 = { type: Type.OBJECT, properties: { concept: { type: Type.STRING }, children: { type: Type.ARRAY, items: level4 } }, required: ['concept'] };
const level2 = { type: Type.OBJECT, properties: { concept: { type: Type.STRING }, children: { type: Type.ARRAY, items: level3 } }, required: ['concept'] };
const conceptMapSchema = { type: Type.OBJECT, properties: { concept: { type: Type.STRING, description: "The root concept of the map." }, children: { type: Type.ARRAY, items: level2, description: "Child nodes." } }, required: ['concept', 'children'] };


const getPrompt = (subject: Subject, difficulty: Difficulty, count: number, language: Language, chapter: string | null): string => {
  const difficultyInstruction = difficulty === Difficulty.HYBRID
    ? 'the generated questions must have a difficulty mix of approximately 50% Easy, 25% Medium, and 25% Hard.'
    : `its complexity must strictly align with the requested '${difficulty}' level.`;
  
  const instructions: string[] = [
    `Generate exactly ${count} unique MCQ(s).`,
    `Each question must not be a simple recall question. It should test higher-order thinking skills such as understanding, analysis, application, evaluation, or creativity, and ${difficultyInstruction}`,
    'Base the questions on concepts from the NCERT textbook, NCERT Science Exemplar, and past Science Olympiads. However, you MUST create unique, modified questions. DO NOT copy-paste from any source.',
    `The question and all options must be clear, concise, and unambiguous, and in the specified language.`,
    'The incorrect options (distractors) must be plausible and based on common student misconceptions.',
    'Provide a detailed explanation not only for why the correct answer is right but also for why each of the incorrect options is wrong.',
    "Return the output strictly in the provided JSON format, which is an array of MCQ objects. The 'id' for options should be 'A', 'B', 'C', 'D'."
  ];

  if (chapter && chapter !== 'All Chapters') {
    instructions.push(`**Chapter Focus:** All questions MUST be strictly based on the chapter: "${chapter}". All other instructions must still be followed.`);
  }

  if (count >= 5 && (!chapter || chapter === 'All Chapters')) {
    instructions.push(`**Syllabus Coverage:** It is crucial that the generated questions cover a wide range of topics. The ${count} questions must be sourced from different chapters within the CBSE Class 10 ${subject} syllabus. Ensure the questions are distributed as evenly as possible across various chapters to provide broad syllabus coverage. For example, if generating 5 questions, they should ideally come from 5 distinct chapters.`);
  }

  const formattedInstructions = instructions.map((inst, index) => `${index + 1}.  ${inst}`).join('\n    ');

  return `
    You are an expert question paper setter for a prestigious national scholarship exam in India. Your task is to generate ${count} high-quality, innovative Multiple Choice Question(s) (MCQ) for students who have just passed CBSE Class 10.

    Subject: ${subject}
    Syllabus: Exclusively the CBSE Class X Science syllabus for ${subject}.
    Difficulty: ${difficulty === Difficulty.HYBRID ? 'Hybrid (50% Easy, 25% Medium, 25% Hard)' : difficulty}
    Language: All generated text (question, options, explanations) MUST be in ${language}.

    Instructions:
    ${formattedInstructions}
    `;
}

const getSubjectivePrompt = (subject: Subject, difficulty: Difficulty, language: Language, chapter: string | null): string => {
  const difficultyInstruction = difficulty === Difficulty.HYBRID
    ? 'The complexity of all questions must be a mix: approximately 50% Easy, 25% Medium, and 25% Hard across the entire set.'
    : `The complexity of all questions must strictly align with the requested '${difficulty}' level.`;
    
  const instructions: string[] = [
    `Generate a set of subjective questions.`,
    `The question set must contain exactly three types of questions: 10 Very Short Answer, 6 Short Answer, and 4 Long Answer questions.`,
    difficultyInstruction,
    'Base the questions on concepts from the NCERT textbook, NCERT Science Exemplar, and past Science Olympiads. However, you MUST create unique, modified questions. DO NOT copy-paste from any source.',
    `The questions and answers must be clear, concise, and unambiguous, and in the specified language.`,
    `**Answer Length Rules:**`,
    ` - Very Short Answers: Must be in one or two sentences.`,
    ` - Short Answers: Must be in three or four sentences.`,
    ` - Long Answers: Must be structured with exactly 6 distinct bullet points. Do not use numbers (e.g., 1., 2.); use bullet symbols (e.g., • or -) instead.`,
    "For every question, the 'answer' string must begin with the prefix 'Answer :' followed by the actual answer.",
    "Return the output strictly in the provided JSON format."
  ];

  if (chapter && chapter !== 'All Chapters') {
    instructions.push(`**Chapter Focus:** All questions MUST be strictly based on the chapter: "${chapter}". All other instructions must still be followed.`);
  }

  if (subject === Subject.BIOLOGY) {
    instructions.push(`**Biology Specific:** At least two of the six 'Short Answer' questions MUST be figure-based. This means you should describe a biological diagram or scenario and ask questions based on it (e.g., 'A diagram of a neuron is shown... Identify part X and state its function.').`)
  }

  const formattedInstructions = instructions.map((inst, index) => `${index + 1}.  ${inst}`).join('\n    ');

  return `
    You are an expert question paper setter for a prestigious national scholarship exam in India. Your task is to generate a high-quality, innovative set of Subjective Questions for students who have just passed CBSE Class 10.

    Subject: ${subject}
    Syllabus: Exclusively the CBSE Class X Science syllabus for ${subject}.
    Difficulty: ${difficulty === Difficulty.HYBRID ? 'Hybrid (50% Easy, 25% Medium, 25% Hard)' : difficulty}
    Language: All generated text (questions, answers) MUST be in ${language}.

    Instructions:
    ${formattedInstructions}
    `;
}

const getStudyGuidePrompt = (subject: Subject, language: Language, chapter: string): string => {
  return `
    You are an expert educator and content creator for students in India. Your task is to generate a comprehensive, high-quality Study Guide for a specific chapter for students who have just passed CBSE Class 10.

    Subject: ${subject}
    Chapter: "${chapter}"
    Syllabus: Exclusively the CBSE Class X Science syllabus for ${subject}.
    Language: All generated text MUST be in ${language}.

    Instructions:
    1.  Create a detailed study guide for the specified chapter.
    2.  The guide must be broken down into five distinct sections as defined in the JSON schema.
    3.  **Summary:** Provide an elaborate and detailed summary of the chapter's key topics. Cover the main concepts and their relationships comprehensively, presenting the information as a list of bullet points.
    4.  **Keywords:** List crucial scientific terms from the chapter and provide simple, clear definitions.
    5.  **Difficult Concepts Explained:** Identify a comprehensive list of concepts students often find difficult. For each, provide an in-depth, step-by-step explanation. Crucially, you MUST include a relevant real-world example or analogy for each concept to solidify understanding.
    6.  **Common Mistakes:** List common errors or misconceptions students make related to this chapter's content.
    7.  **Exam Tips:** Offer practical advice on how to study for and answer questions from this chapter in an exam.
    8.  Return the output strictly in the provided JSON format. The content should be accurate, engaging, and pedagogically sound.
    `;
};

const getConceptMapPrompt = (subject: Subject, language: Language, chapter: string): string => {
  return `
    You are an expert educational designer specializing in visual learning tools. Your task is to generate a hierarchical, top-down concept map for a specific chapter for students who have just passed CBSE Class 10.

    Subject: ${subject}
    Chapter: "${chapter}"
    Syllabus: Exclusively the CBSE Class X Science syllabus for ${subject}.
    Language: All generated text MUST be in ${language}.

    Instructions:
    1.  Create a concept map with the main chapter topic as the root node.
    2.  Branch out from the root node to major sub-topics.
    3.  Further branch out from sub-topics to related concepts, definitions, or key points.
    4.  The structure must be strictly hierarchical (a tree structure). A parent node should connect to one or more child nodes.
    5.  Keep the concept text in each node concise and to the point.
    6.  The depth of the map should be sufficient to cover the chapter's core ideas, typically 3-4 levels deep.
    7.  Return the output strictly in the provided JSON format, representing a nested tree structure. The root object is the main concept of the chapter.
    `;
};

export const generateMCQs = async (subject: Subject, difficulty: Difficulty, count: number, language: Language, chapter: string | null): Promise<MCQ[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: getPrompt(subject, difficulty, count, language, chapter),
      config: {
        responseMimeType: "application/json",
        responseSchema: mcqsArraySchema,
        temperature: 0.8,
      },
    });

    const text = response.text?.trim() || "";
    if (!text) {
      throw new Error("Empty response from AI");
    }
    const mcqData = JSON.parse(text);

    if (!Array.isArray(mcqData)) {
      throw new Error("Generated data is not an array of questions.");
    }
    
    // Basic validation to ensure the parsed object matches the MCQ structure
    if (mcqData.length > 0 && (
      !mcqData[0].question ||
      !mcqData[0].options ||
      !mcqData[0].answer ||
      !mcqData[0].distractors)
    ) {
      throw new Error("Generated data is missing required fields.");
    }

    return mcqData as MCQ[];
  } catch (error) {
    console.error("Error generating MCQs:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate questions. Please try again. Details: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the questions.");
  }
};

export const generateSubjectiveQuestions = async (subject: Subject, difficulty: Difficulty, language: Language, chapter: string | null): Promise<SubjectiveSet> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: getSubjectivePrompt(subject, difficulty, language, chapter),
      config: {
        responseMimeType: "application/json",
        responseSchema: subjectiveSetSchema,
        temperature: 0.7,
      },
    });

    const text = response.text?.trim() || "";
    if (!text) {
      throw new Error("Empty response from AI");
    }
    const subjectiveData = JSON.parse(text);

    // Basic validation
    if (!subjectiveData.veryShortAnswer || !subjectiveData.shortAnswer || !subjectiveData.longAnswer) {
       throw new Error("Generated data is missing required question categories.");
    }

    return subjectiveData as SubjectiveSet;
  } catch (error) {
    console.error("Error generating Subjective Questions:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate questions. Please try again. Details: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the questions.");
  }
};

export const generateStudyGuide = async (subject: Subject, language: Language, chapter: string): Promise<StudyGuide> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: getStudyGuidePrompt(subject, language, chapter),
      config: {
        responseMimeType: "application/json",
        responseSchema: studyGuideSchema,
        temperature: 0.6,
      },
    });

    const text = response.text?.trim() || "";
    if (!text) {
      throw new Error("Empty response from AI");
    }
    const studyGuideData = JSON.parse(text);

    // Basic validation
    if (!studyGuideData.summary || !studyGuideData.keywords || !studyGuideData.difficultConcepts || !studyGuideData.commonMistakes || !studyGuideData.examTips) {
       throw new Error("Generated data is missing required study guide sections.");
    }

    return studyGuideData as StudyGuide;
  } catch (error) {
    console.error("Error generating Study Guide:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate study guide. Please try again. Details: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the study guide.");
  }
};

export const generateConceptMap = async (subject: Subject, language: Language, chapter: string): Promise<ConceptMapNode> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: getConceptMapPrompt(subject, language, chapter),
      config: {
        responseMimeType: "application/json",
        responseSchema: conceptMapSchema,
        temperature: 0.5,
      },
    });

    const text = response.text?.trim() || "";
    if (!text) {
      throw new Error("Empty response from AI");
    }
    const conceptMapData = JSON.parse(text);

    // Basic validation
    if (!conceptMapData.concept || !conceptMapData.children) {
       throw new Error("Generated data is missing required concept map fields.");
    }

    return conceptMapData as ConceptMapNode;
  } catch (error) {
    console.error("Error generating Concept Map:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate concept map. Please try again. Details: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the concept map.");
  }
};