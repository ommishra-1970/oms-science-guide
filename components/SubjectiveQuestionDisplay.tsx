import React, { useState } from 'react';
import { SubjectiveSet, SubjectiveQuestion } from '../types';

const QuestionSection: React.FC<{ title: string; questions: SubjectiveQuestion[]; showAnswers: boolean; }> = ({ title, questions, showAnswers }) => {
    if (!questions || questions.length === 0) return null;
    
    return (
        <div className="mb-10">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6 border-b-2 border-indigo-300 dark:border-indigo-700 pb-2">{title}</h3>
            <div className="space-y-8">
                {questions.map((q, index) => (
                    <div key={index} className="bg-white dark:bg-slate-800/50 p-5 rounded-lg shadow-md">
                        <p className="font-semibold text-slate-700 dark:text-slate-200 mb-3 leading-relaxed">
                            <span className="font-bold mr-2">{index + 1}.</span>{q.question}
                        </p>
                        {showAnswers && (
                            <div className="mt-4 border-t border-slate-200 dark:border-slate-600 pt-4 animate-fade-in">
                               <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                                {q.answer.startsWith('Answer :') ? (
                                    <>
                                        <span className="font-bold text-slate-800 dark:text-slate-100">Answer :</span>
                                        {q.answer.substring('Answer :'.length)}
                                    </>
                                ) : (
                                    q.answer
                                )}
                               </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};


const SubjectiveQuestionDisplay: React.FC<{ questions: SubjectiveSet }> = ({ questions }) => {
    const [showSolutions, setShowSolutions] = useState(false);

    return (
        <div className="w-full bg-white dark:bg-slate-800 shadow-xl rounded-2xl p-6 md:p-8 transition-all duration-500">
            <div className="text-center mb-8">
                <button
                    onClick={() => setShowSolutions(prev => !prev)}
                    className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105"
                >
                    {showSolutions ? 'Hide All Solutions' : 'Show All Solutions'}
                </button>
            </div>
            
            <QuestionSection title="Very Short Answer Questions" questions={questions.veryShortAnswer} showAnswers={showSolutions} />
            <QuestionSection title="Short Answer Questions" questions={questions.shortAnswer} showAnswers={showSolutions} />
            <QuestionSection title="Long Answer Questions" questions={questions.longAnswer} showAnswers={showSolutions} />
        </div>
    );
};

export default SubjectiveQuestionDisplay;