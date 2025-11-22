import React, { useState, useCallback, useEffect } from 'react';
import { Subject, MCQ, Difficulty, Language, QuestionType, SubjectiveSet, SubjectiveQuestion, StudyGuide, ConceptMapNode } from './types';
import { generateMCQs, generateSubjectiveQuestions, generateStudyGuide, generateConceptMap } from './services/geminiService';
import { chapters } from './data/chapters';
import Loader from './components/Loader';
import QuestionCard from './components/QuestionCard';
import SubjectiveQuestionDisplay from './components/SubjectiveQuestionDisplay';
import StudyGuideDisplay from './components/StudyGuideDisplay';
import ConceptMapDisplay from './components/ConceptMapDisplay';
import { PhysicsIcon } from './components/icons/PhysicsIcon';
import { ChemistryIcon } from './components/icons/ChemistryIcon';
import { BiologyIcon } from './components/icons/BiologyIcon';
import { EasyIcon } from './components/icons/EasyIcon';
import { MediumIcon } from './components/icons/MediumIcon';
import { HardIcon } from './components/icons/HardIcon';
import { HybridIcon } from './components/icons/HybridIcon';

const SubjectButton: React.FC<{
  subject: Subject;
  icon: React.ReactNode;
  selectedSubject: Subject | null;
  onSelect: (subject: Subject) => void;
}> = ({ subject, icon, selectedSubject, onSelect }) => {
  const isSelected = selectedSubject === subject;
  const baseClasses = "flex flex-col items-center justify-center p-6 text-center transition-all duration-300 ease-in-out border-2 rounded-xl shadow-lg cursor-pointer transform hover:-translate-y-1";
  const selectedClasses = "bg-indigo-600 text-white border-indigo-700 ring-4 ring-indigo-300 dark:ring-indigo-500";
  const unselectedClasses = "bg-white dark:bg-slate-800 border-transparent text-slate-700 dark:text-slate-200 hover:border-indigo-400 dark:hover:border-indigo-500";
  
  return (
    <div className={`${baseClasses} ${isSelected ? selectedClasses : unselectedClasses}`} onClick={() => onSelect(subject)}>
      <div className="mb-2">{icon}</div>
      <span className="font-semibold text-lg">{subject}</span>
    </div>
  );
};

const DifficultyButton: React.FC<{
  level: Difficulty;
  icon: React.ReactNode;
  selectedDifficulty: Difficulty | null;
  onSelect: (level: Difficulty) => void;
}> = ({ level, icon, selectedDifficulty, onSelect }) => {
    const isSelected = selectedDifficulty === level;
    
    const levelClasses = {
        [Difficulty.EASY]: {
            base: 'border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 hover:border-green-500 dark:hover:border-green-400',
            selected: 'bg-green-600 text-white border-green-700 ring-4 ring-green-300 dark:ring-green-500',
        },
        [Difficulty.MEDIUM]: {
            base: 'border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300 hover:border-orange-500 dark:hover:border-orange-400',
            selected: 'bg-orange-500 text-white border-orange-600 ring-4 ring-orange-300 dark:ring-orange-400',
        },
        [Difficulty.HARD]: {
            base: 'border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:border-red-500 dark:hover:border-red-400',
            selected: 'bg-red-600 text-white border-red-700 ring-4 ring-red-300 dark:ring-red-500',
        },
        [Difficulty.HYBRID]: {
            base: 'border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:border-purple-500 dark:hover:border-purple-400',
            selected: 'bg-purple-600 text-white border-purple-700 ring-4 ring-purple-300 dark:ring-purple-500',
        },
    };

    const baseClasses = "flex flex-col items-center justify-center p-4 text-center transition-all duration-300 ease-in-out border-2 rounded-xl shadow-lg cursor-pointer transform hover:-translate-y-1 bg-white dark:bg-slate-800";
    const currentLevelClasses = levelClasses[level];

    return (
        <div 
            className={`${baseClasses} ${isSelected ? currentLevelClasses.selected : currentLevelClasses.base}`} 
            onClick={() => onSelect(level)}
        >
            <div className="mb-2">{icon}</div>
            <span className="font-semibold text-lg">{level}</span>
        </div>
    );
};


function App() {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  const [numberOfQuestions, setNumberOfQuestions] = useState<number>(1);
  const [language, setLanguage] = useState<Language>(Language.ENGLISH);
  const [questionType, setQuestionType] = useState<QuestionType>(QuestionType.MCQ);
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [subjectiveQuestions, setSubjectiveQuestions] = useState<SubjectiveSet | null>(null);
  const [studyGuide, setStudyGuide] = useState<StudyGuide | null>(null);
  const [conceptMap, setConceptMap] = useState<ConceptMapNode | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<string>('Copy All');
  
  useEffect(() => {
    const chapterBasedModes = [QuestionType.STUDY_GUIDE, QuestionType.CONCEPT_MAP];
    if (chapterBasedModes.includes(questionType) && selectedSubject && (!selectedChapter || selectedChapter === 'All Chapters')) {
      setSelectedChapter(chapters[selectedSubject][0]);
    }
  }, [questionType, selectedSubject]);

  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubject(subject);
    setSelectedDifficulty(null);
    const chapterBasedModes = [QuestionType.STUDY_GUIDE, QuestionType.CONCEPT_MAP];
    if (chapterBasedModes.includes(questionType)) {
        setSelectedChapter(chapters[subject][0]);
    } else {
        setSelectedChapter('All Chapters');
    }
  };
  
  const handleClearAll = () => {
      setMcqs([]);
      setSubjectiveQuestions(null);
      setStudyGuide(null);
      setConceptMap(null);
      setSelectedSubject(null);
      setSelectedDifficulty(null);
      setSelectedChapter(null);
      setError(null);
  };

  const handleCopyAll = useCallback(() => {
    if (mcqs.length === 0 && !subjectiveQuestions && !studyGuide && !conceptMap) return;

    let formattedText = '';

    if (questionType === QuestionType.MCQ && mcqs.length > 0) {
        formattedText = mcqs.map((mcq, index) => {
            const { question, options, answer, distractors } = mcq;
            const correctOptionText = options.find(o => o.id === answer.correctOptionId)?.text || 'N/A';
            
            let allExplanations = options.map(opt => {
                const isCorrect = opt.id === answer.correctOptionId;
                const explanation = isCorrect 
                    ? answer.explanation 
                    : distractors.find(d => d.optionId === opt.id)?.explanation || "No explanation provided.";
                return `Option ${opt.id} (${isCorrect ? "Correct" : "Incorrect"}):\n${explanation}`;
            }).join('\n\n');

            return `
----------------------------------------
Question ${index + 1}
----------------------------------------

${question}

Options:
${options.map(o => `${o.id}. ${o.text}`).join('\n')}

--- Solution ---
Correct Answer: ${answer.correctOptionId}. ${correctOptionText}

--- Detailed Explanations ---
${allExplanations}
`;
        }).join('\n========================================\n');
    } else if (questionType === QuestionType.SUBJECTIVE && subjectiveQuestions) {
        const formatSection = (title: string, questions: SubjectiveQuestion[]) => {
            if (!questions || questions.length === 0) return '';
            let sectionText = `\n--- ${title} ---\n`;
            sectionText += questions.map((q, i) => 
                `\nQ${i + 1}: ${q.question}\n${q.answer}`
            ).join('\n');
            return sectionText;
        };

        formattedText = "Om's Science scholarship Guide\n========================================\n";
        formattedText += formatSection('Very Short Answer Questions', subjectiveQuestions.veryShortAnswer);
        formattedText += formatSection('Short Answer Questions', subjectiveQuestions.shortAnswer);
        formattedText += formatSection('Long Answer Questions', subjectiveQuestions.longAnswer);
    } else if (questionType === QuestionType.STUDY_GUIDE && studyGuide) {
        const formatSection = (title: string, items: (string | { term: string; definition: string; } | { concept: string; explanation: string; })[]) => {
            let sectionText = `\n--- ${title} ---\n\n`;
            if (typeof items[0] === 'string') {
                sectionText += (items as string[]).map((item, i) => `${i + 1}. ${item}`).join('\n');
            } else {
                 sectionText += (items as any[]).map(item => `**${item.term || item.concept}**\n${item.definition || item.explanation}`).join('\n\n');
            }
            return sectionText;
        };

        formattedText = `Om's Science scholarship Guide - Study Guide\n`;
        formattedText += `Subject: ${selectedSubject} | Chapter: ${selectedChapter}\n`;
        formattedText += `========================================\n`;
        formattedText += formatSection('Chapter Summary', studyGuide.summary);
        formattedText += formatSection('Keywords & Definitions', studyGuide.keywords);
        formattedText += formatSection('Difficult Concepts Explained', studyGuide.difficultConcepts);
        formattedText += formatSection('Common Mistakes to Avoid', studyGuide.commonMistakes);
        formattedText += formatSection('Exam Tips', studyGuide.examTips);
    } else if (questionType === QuestionType.CONCEPT_MAP && conceptMap) {
        const formatNode = (node: ConceptMapNode, prefix = ''): string => {
            let text = `${prefix}- ${node.concept}\n`;
            if (node.children) {
                node.children.forEach(child => {
                    text += formatNode(child, prefix + '  ');
                });
            }
            return text;
        };
        formattedText = `Concept Map for ${selectedChapter}\n========================================\n`;
        formattedText += formatNode(conceptMap);
    }


    navigator.clipboard.writeText(formattedText.trim())
      .then(() => {
        setCopyStatus('Copied!');
        setTimeout(() => setCopyStatus('Copy All'), 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        setCopyStatus('Failed to copy');
         setTimeout(() => setCopyStatus('Copy All'), 2000);
      });
  }, [mcqs, subjectiveQuestions, studyGuide, conceptMap, questionType, selectedSubject, selectedChapter]);

  const handleGenerateClick = useCallback(async () => {
    const chapterBasedModes = [QuestionType.STUDY_GUIDE, QuestionType.CONCEPT_MAP];
    if (!selectedSubject || (questionType !== QuestionType.MCQ && !chapterBasedModes.includes(questionType) && !selectedDifficulty) || (chapterBasedModes.includes(questionType) && (!selectedChapter || selectedChapter === 'All Chapters'))) {
        if (chapterBasedModes.includes(questionType) && (!selectedChapter || selectedChapter === 'All Chapters')) {
            setError(`Please select a specific chapter to generate a ${questionType}.`);
        }
        return;
    }

    setIsLoading(true);
    setError(null);
    setMcqs([]);
    setSubjectiveQuestions(null);
    setStudyGuide(null);
    setConceptMap(null);

    try {
      if (questionType === QuestionType.MCQ) {
        const generatedQuestions = await generateMCQs(selectedSubject, selectedDifficulty!, numberOfQuestions, language, selectedChapter);
        setMcqs(generatedQuestions);
      } else if (questionType === QuestionType.SUBJECTIVE) {
        const generatedQuestions = await generateSubjectiveQuestions(selectedSubject, selectedDifficulty!, language, selectedChapter);
        setSubjectiveQuestions(generatedQuestions);
      } else if (questionType === QuestionType.STUDY_GUIDE) {
        const generatedGuide = await generateStudyGuide(selectedSubject, language, selectedChapter!);
        setStudyGuide(generatedGuide);
      } else if (questionType === QuestionType.CONCEPT_MAP) {
        const generatedMap = await generateConceptMap(selectedSubject, language, selectedChapter!);
        setConceptMap(generatedMap);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSubject, selectedDifficulty, numberOfQuestions, language, selectedChapter, questionType]);

  const hasGeneratedContent = mcqs.length > 0 || subjectiveQuestions !== null || studyGuide !== null || conceptMap !== null;
  
  const chapterOptions = selectedSubject ? chapters[selectedSubject] : [];
  const chapterBasedModes = [QuestionType.STUDY_GUIDE, QuestionType.CONCEPT_MAP];
  const finalChapterOptions = chapterBasedModes.includes(questionType) ? chapterOptions : ['All Chapters', ...chapterOptions];
  const showDifficulty = !chapterBasedModes.includes(questionType);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 font-sans flex flex-col items-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            Om's Science scholarship Guide
          </h1>
          <p className="mt-3 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Your AI-powered guide for mastering the CBSE Class 10 Science syllabus, complete with study guides, subjective questions, and MCQs for scholarship aspirants.
          </p>
        </header>

        <main>
          <div className="bg-white/50 dark:bg-slate-800/50 p-6 sm:p-8 rounded-2xl shadow-md backdrop-blur-sm border border-slate-200 dark:border-slate-700">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-center text-slate-800 dark:text-slate-100 mb-4">1. Choose Language</h2>
                    <div className="flex justify-center gap-4">
                        {(Object.values(Language) as Language[]).map(lang => (
                            <button key={lang} onClick={() => setLanguage(lang)} className={`px-6 py-2 w-full rounded-lg font-semibold transition-colors duration-200 ${language === lang ? 'bg-indigo-600 text-white shadow-md' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-indigo-100 dark:hover:bg-slate-600'}`}>
                                {lang}
                            </button>
                        ))}
                    </div>
                </div>
                 <div>
                    <h2 className="text-xl font-bold text-center text-slate-800 dark:text-slate-100 mb-4">2. Content Type</h2>
                    <div className="grid grid-cols-2 gap-2">
                        {(Object.values(QuestionType) as QuestionType[]).map(type => (
                            <button key={type} onClick={() => setQuestionType(type)} className={`px-3 py-2 text-sm sm:text-base rounded-lg font-semibold transition-colors duration-200 ${questionType === type ? 'bg-indigo-600 text-white shadow-md' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-indigo-100 dark:hover:bg-slate-600'}`}>
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            
            <div className="border-t border-slate-200 dark:border-slate-700 my-6"></div>
            
            <h2 className="text-xl font-bold text-center text-slate-800 dark:text-slate-100 mb-2">3. Choose a Subject</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 my-6">
              <SubjectButton subject={Subject.PHYSICS} icon={<PhysicsIcon className="h-10 w-10"/>} selectedSubject={selectedSubject} onSelect={handleSubjectSelect}/>
              <SubjectButton subject={Subject.CHEMISTRY} icon={<ChemistryIcon className="h-10 w-10"/>} selectedSubject={selectedSubject} onSelect={handleSubjectSelect}/>
              <SubjectButton subject={Subject.BIOLOGY} icon={<BiologyIcon className="h-10 w-10"/>} selectedSubject={selectedSubject} onSelect={handleSubjectSelect}/>
            </div>
            
            <div className={`transition-all duration-500 ease-in-out ${selectedSubject ? 'max-h-[30rem] opacity-100 mt-8' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                <h2 className="text-xl font-bold text-center text-slate-800 dark:text-slate-100 mb-4">4. Select Options</h2>
                <div className={`grid grid-cols-1 ${showDifficulty ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-8 items-start`}>
                    {showDifficulty && (
                        <div className="animate-fade-in">
                            <label className="block text-sm font-medium text-center text-slate-700 dark:text-slate-300 mb-2">Difficulty</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <DifficultyButton level={Difficulty.EASY} icon={<EasyIcon className="h-8 w-8"/>} selectedDifficulty={selectedDifficulty} onSelect={setSelectedDifficulty} />
                                <DifficultyButton level={Difficulty.MEDIUM} icon={<MediumIcon className="h-8 w-8"/>} selectedDifficulty={selectedDifficulty} onSelect={setSelectedDifficulty} />
                                <DifficultyButton level={Difficulty.HARD} icon={<HardIcon className="h-8 w-8"/>} selectedDifficulty={selectedDifficulty} onSelect={setSelectedDifficulty} />
                                <DifficultyButton level={Difficulty.HYBRID} icon={<HybridIcon className="h-8 w-8"/>} selectedDifficulty={selectedDifficulty} onSelect={setSelectedDifficulty} />
                            </div>
                        </div>
                    )}
                    <div className={`space-y-6 ${!showDifficulty ? 'max-w-md mx-auto w-full' : ''}`}>
                        <div>
                            <label htmlFor="chapter-select" className="block text-sm font-medium text-center text-slate-700 dark:text-slate-300 mb-2">Chapter</label>
                            <select
                                id="chapter-select"
                                value={selectedChapter || ''}
                                disabled={!selectedSubject}
                                onChange={(e) => setSelectedChapter(e.target.value)}
                                className="w-full bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-lg py-2 px-3 text-slate-900 dark:text-slate-100 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                            >
                                {selectedSubject && finalChapterOptions.map(ch => (
                                    <option key={ch} value={ch}>{ch}</option>
                                ))}
                            </select>
                        </div>
                        {questionType === QuestionType.MCQ && (
                            <div className="animate-fade-in">
                                <label htmlFor="num-questions" className="block text-sm font-medium text-center text-slate-700 dark:text-slate-300 mb-2">Number of Questions</label>
                                <select id="num-questions" value={numberOfQuestions} onChange={(e) => setNumberOfQuestions(Number(e.target.value))} className="w-full bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-lg py-2 px-3 text-slate-900 dark:text-slate-100 focus:ring-indigo-500 focus:border-indigo-500">
                                   {Array.from({ length: 20 }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="text-center mt-8">
              <button onClick={handleGenerateClick} disabled={!selectedSubject || (showDifficulty && !selectedDifficulty) || isLoading} className="w-full sm:w-auto px-10 py-4 text-lg font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-2xl hover:scale-105 disabled:hover:scale-100">
                {isLoading ? 'Generating...' : `✨ Generate ${questionType === QuestionType.MCQ ? `${numberOfQuestions} Question(s)` : questionType}`}
              </button>
            </div>
          </div>

          <div className="mt-10">
            {isLoading && <Loader />}
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                <p className="font-bold">Error</p>
                <p>{error}</p>
              </div>
            )}
            {hasGeneratedContent && (
                <div className="space-y-4 sm:space-y-0 sm:flex sm:justify-center sm:gap-4 mb-8">
                    <button onClick={handleCopyAll} className="w-full sm:w-auto px-6 py-2 font-semibold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 transition-colors duration-200">{copyStatus}</button>
                    <button onClick={handleClearAll} className="w-full sm:w-auto px-6 py-2 font-semibold text-white bg-red-600 rounded-lg shadow-md hover:bg-red-700 transition-colors duration-200">Clear All</button>
                </div>
            )}
            
            {mcqs.length > 0 && questionType === QuestionType.MCQ && (
                <div className="space-y-8">
                    {mcqs.map((mcq, index) => (
                        <div key={index} className="animate-fade-in-up">
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Question {index + 1}</h3>
                            <QuestionCard mcq={mcq} />
                        </div>
                    ))}
                </div>
            )}

            {subjectiveQuestions && questionType === QuestionType.SUBJECTIVE && (
                 <div className="animate-fade-in-up">
                    <SubjectiveQuestionDisplay questions={subjectiveQuestions} />
                 </div>
            )}

            {studyGuide && questionType === QuestionType.STUDY_GUIDE && (
                 <div className="animate-fade-in-up">
                    <h3 className="text-2xl font-bold text-center text-slate-800 dark:text-slate-100 mb-4">Study Guide: {selectedChapter}</h3>
                    <StudyGuideDisplay guide={studyGuide} />
                 </div>
            )}

            {conceptMap && questionType === QuestionType.CONCEPT_MAP && (
                 <div className="animate-fade-in-up">
                    <h3 className="text-2xl font-bold text-center text-slate-800 dark:text-slate-100 mb-4">Concept Map: {selectedChapter}</h3>
                    <ConceptMapDisplay map={conceptMap} />
                 </div>
            )}
          </div>
        </main>
         <footer className="text-center mt-12 text-slate-500 dark:text-slate-400 text-sm">
            <p>Powered by Google Gemini. Questions are AI-generated and may require verification.</p>
        </footer>
      </div>
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.5s ease-in-out; }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
        
        .concept-map {
            padding: 1.5rem;
            margin: auto;
            background: #fff;
            border-radius: 1rem;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,.1), 0 4px 6px -4px rgba(0,0,0,.1);
        }
        .dark .concept-map {
             background: #1e293b; /* slate-800 */
        }
        .concept-map ul {
            position: relative;
            padding-left: 2rem;
            list-style: none;
        }
        .concept-map li {
            position: relative;
        }
        .concept-map li::before {
            content: '';
            position: absolute;
            top: 0;
            left: -1.25rem;
            border-left: 2px solid #64748b; /* slate-500 */
            height: 100%;
        }
        .concept-map li:last-child::before {
             height: 1.75rem;
        }
        .dark .concept-map li::before {
            border-left: 2px solid #475569; /* slate-600 */
        }
        .concept-map li span {
            display: inline-block;
            position: relative;
            padding: 0.5rem 1rem;
            margin: 0.5rem 0;
            background: #f1f5f9; /* slate-100 */
            border-radius: 0.5rem;
            border: 1px solid #cbd5e1; /* slate-300 */
            color: #1e293b; /* slate-800 */
            min-width: 100px;
            text-align: center;
        }
        .dark .concept-map li span {
            background: #334155; /* slate-700 */
            border-color: #475569; /* slate-600 */
            color: #f1f5f9; /* slate-100 */
        }
        .concept-map li span::before {
            content: '';
            position: absolute;
            top: 1.25rem;
            left: -1.25rem;
            border-top: 2px solid #64748b; /* slate-500 */
            width: 1.25rem;
            height: 0;
        }
         .dark .concept-map li span::before {
            border-top-color: #475569; /* slate-600 */
        }
        .concept-map > ul > li::before, .concept-map > ul > li span::before {
            border: none;
        }
        .concept-map > ul {
            padding-left: 0;
        }
        .concept-map > ul > li {
            text-align: center;
        }
         .concept-map > ul > li span {
            background-color: #4f46e5; /* indigo-600 */
            color: white;
            font-weight: bold;
            border-color: #4338ca; /* indigo-700 */
         }
         .dark .concept-map > ul > li span {
             background-color: #6366f1; /* indigo-500 */
             border-color: #4f46e5; /* indigo-600 */
         }

      `}</style>
    </div>
  );
}

export default App;