
import React, { useState, useMemo } from 'react';
import { MCQ, Option, Distractor } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface QuestionCardProps {
  mcq: MCQ;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ mcq }) => {
  const [showSolution, setShowSolution] = useState(false);

  const explanationMap = useMemo(() => {
    const map = new Map<string, string>();
    map.set(mcq.answer.correctOptionId, mcq.answer.explanation);
    mcq.distractors.forEach((d: Distractor) => map.set(d.optionId, d.explanation));
    return map;
  }, [mcq]);

  const getOptionClasses = (optionId: string) => {
    if (!showSolution) {
      return "border-slate-300 dark:border-slate-600 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-slate-700";
    }
    if (optionId === mcq.answer.correctOptionId) {
      return "border-green-500 bg-green-50 dark:bg-green-900/30 ring-2 ring-green-500";
    }
    return "border-red-500 bg-red-50 dark:bg-red-900/30";
  };
  
  return (
    <div className="w-full bg-white dark:bg-slate-800 shadow-xl rounded-2xl p-6 md:p-8 transition-all duration-500">
      <h2 className="text-lg md:text-xl font-semibold text-slate-800 dark:text-slate-100 mb-6 leading-relaxed">{mcq.question}</h2>
      
      <div className="space-y-4 mb-8">
        {mcq.options.map((option: Option) => (
          <div
            key={option.id}
            className={`flex items-start space-x-4 p-4 border-2 rounded-lg transition-all ${getOptionClasses(option.id)}`}
          >
            <div className="font-bold text-slate-600 dark:text-slate-300">{option.id}.</div>
            <p className="flex-1 text-slate-700 dark:text-slate-200">{option.text}</p>
          </div>
        ))}
      </div>
      
      {!showSolution && (
        <div className="text-center">
            <button
                onClick={() => setShowSolution(true)}
                className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105"
            >
                Show Solution
            </button>
        </div>
      )}
      
      {showSolution && (
        <div className="mt-8 border-t-2 border-slate-200 dark:border-slate-700 pt-6 animate-fade-in">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Detailed Explanations</h3>
          <div className="space-y-6">
            {mcq.options.map((option: Option) => {
                const isCorrect = option.id === mcq.answer.correctOptionId;
                const explanation = explanationMap.get(option.id);
                return (
                    <div key={option.id} className={`p-5 rounded-xl ${isCorrect ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500' : 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500'}`}>
                        <div className="flex items-center space-x-3 mb-3">
                            {isCorrect ? <CheckCircleIcon className="h-7 w-7 text-green-500" /> : <XCircleIcon className="h-7 w-7 text-red-500" />}
                            <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Option {option.id} {isCorrect ? "(Correct)" : "(Incorrect)"}</h4>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{explanation}</p>
                    </div>
                );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
