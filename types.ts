export enum Subject {
  PHYSICS = 'Physics',
  CHEMISTRY = 'Chemistry',
  BIOLOGY = 'Biology',
}

export enum Difficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard',
  HYBRID = 'Hybrid',
}

export enum Language {
  ENGLISH = 'English',
  ODIA = 'Odia',
}

export enum QuestionType {
  MCQ = 'MCQ',
  SUBJECTIVE = 'Subjective',
  STUDY_GUIDE = 'Study Guide',
  CONCEPT_MAP = 'Concept Map',
}

export interface Option {
  id: string;
  text: string;
}

export interface Distractor {
  optionId: string;
  explanation: string;
}

export interface Answer {
  correctOptionId: string;
  explanation: string;
}

export interface MCQ {
  question: string;
  options: Option[];
  answer: Answer;
  distractors: Distractor[];
}

export interface SubjectiveQuestion {
    question: string;
    answer: string;
}

export interface SubjectiveSet {
    veryShortAnswer: SubjectiveQuestion[];
    shortAnswer: SubjectiveQuestion[];
    longAnswer: SubjectiveQuestion[];
}

export interface Keyword {
    term: string;
    definition: string;
}

export interface DifficultConcept {
    concept: string;
    explanation: string;
}

export interface StudyGuide {
    summary: string[];
    keywords: Keyword[];
    difficultConcepts: DifficultConcept[];
    commonMistakes: string[];
    examTips: string[];
}

export interface ConceptMapNode {
    concept: string;
    children: ConceptMapNode[];
}