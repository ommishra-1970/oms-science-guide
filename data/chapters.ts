import { Subject } from '../types';

export const chapters: Record<Subject, string[]> = {
  [Subject.PHYSICS]: [
    'Light – Reflection and Refraction',
    'The Human Eye and the Colourful World',
    'Electricity',
    'Magnetic Effects of Electric Current',
  ],
  [Subject.CHEMISTRY]: [
    'Chemical Reactions and Equations',
    'Acids, Bases and Salts',
    'Metals and Non-metals',
    'Carbon and its Compounds',
  ],
  [Subject.BIOLOGY]: [
    'Life Processes',
    'Control and Co-ordination',
    'How do Organisms Reproduce?',
    'Heredity',
    'Our Environment',
  ],
};
