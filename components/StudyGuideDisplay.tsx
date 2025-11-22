import React from 'react';
import { StudyGuide, Keyword, DifficultConcept } from '../types';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-10">
        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6 border-b-2 border-indigo-300 dark:border-indigo-700 pb-2">{title}</h3>
        {children}
    </div>
);

const BulletList: React.FC<{ items: string[] }> = ({ items }) => (
    <ul className="space-y-3 list-disc list-inside text-slate-600 dark:text-slate-300 leading-relaxed">
        {items.map((item, index) => (
            <li key={index}>{item}</li>
        ))}
    </ul>
);

const DefinitionList: React.FC<{ items: Keyword[] | DifficultConcept[] }> = ({ items }) => (
     <div className="space-y-4">
        {items.map((item, index) => (
            <div key={index} className="bg-slate-100/50 dark:bg-slate-800/50 p-4 rounded-lg">
                <p className="font-semibold text-slate-800 dark:text-slate-100">{'term' in item ? item.term : item.concept}</p>
                <p className="text-slate-600 dark:text-slate-300 mt-1">{'definition' in item ? item.definition : item.explanation}</p>
            </div>
        ))}
    </div>
);

const StudyGuideDisplay: React.FC<{ guide: StudyGuide }> = ({ guide }) => {
    return (
        <div className="w-full bg-white dark:bg-slate-800 shadow-xl rounded-2xl p-6 md:p-8 transition-all duration-500">
            
            <Section title="Chapter Summary">
                <BulletList items={guide.summary} />
            </Section>

            <Section title="Keywords & Definitions">
                <DefinitionList items={guide.keywords} />
            </Section>
            
            <Section title="Difficult Concepts Explained">
                 <DefinitionList items={guide.difficultConcepts} />
            </Section>

            <Section title="Common Mistakes to Avoid">
                <BulletList items={guide.commonMistakes} />
            </Section>

            <Section title="Exam Tips">
                <BulletList items={guide.examTips} />
            </Section>
        </div>
    );
};

export default StudyGuideDisplay;
