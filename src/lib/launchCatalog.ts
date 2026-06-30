import type { EducationLevel, SubCategory } from '@/types';

export type LaunchClass = {
  id: string;
  name: string;
  level: EducationLevel | 'professional';
  subCategory?: SubCategory;
  visible: boolean;
  audience: string;
  launchFocus?: boolean;
};

export type LaunchSubject = {
  id: string;
  slug: string;
  name: string;
  catalogSubject: string;
  description: string;
  confidenceLine: string;
  href: string;
};

export const LAUNCH_CLASSES: LaunchClass[] = [
  { id: 'form-one', name: 'Form One', level: 'secondary', subCategory: 'Form 1', visible: false, audience: 'Future expansion' },
  { id: 'form-two', name: 'Form Two', level: 'secondary', subCategory: 'Form 2', visible: false, audience: 'Future expansion' },
  { id: 'form-three', name: 'Form Three', level: 'secondary', subCategory: 'Form 3', visible: false, audience: 'Future expansion' },
  { id: 'form-four', name: 'Form Four', level: 'secondary', subCategory: 'Form 4', visible: true, audience: 'Launch focus', launchFocus: true },
  { id: 'a-level', name: 'A-Level', level: 'highschool', visible: false, audience: 'Future expansion' },
  { id: 'professional', name: 'Professional Courses', level: 'professional', visible: false, audience: 'Future expansion' },
];

export const FORM_FOUR_SUBJECTS: LaunchSubject[] = [
  {
    id: 'mathematics',
    slug: 'mathematics',
    name: 'Mathematics',
    catalogSubject: 'Mathematics',
    description: 'Build step-by-step confidence across algebra, geometry, and revision drills.',
    confidenceLine: 'Clear methods that make difficult questions feel manageable.',
    href: '/subjects/mathematics',
  },
  {
    id: 'physics',
    slug: 'physics',
    name: 'Physics',
    catalogSubject: 'Physics',
    description: 'Understand formulas, motion, and calculations with structured worked examples.',
    confidenceLine: 'Learn the logic behind every answer before exam pressure begins.',
    href: '/subjects/physics',
  },
  {
    id: 'chemistry',
    slug: 'chemistry',
    name: 'Chemistry',
    catalogSubject: 'Chemistry',
    description: 'Strengthen concepts, reactions, and exam technique in focused lesson blocks.',
    confidenceLine: 'Turn confusing topics into steady, exam-ready understanding.',
    href: '/subjects/chemistry',
  },
  {
    id: 'biology',
    slug: 'biology',
    name: 'Biology',
    catalogSubject: 'Biology',
    description: 'Follow organized explanations that connect topics, diagrams, and revision points.',
    confidenceLine: 'Study living systems with clarity instead of memorizing blindly.',
    href: '/subjects/biology',
  },
  {
    id: 'bookkeeping',
    slug: 'bookkeeping',
    name: 'Bookkeeping',
    catalogSubject: 'Bookkeeping',
    description: 'Practice entries, balances, and business records through calm guided lessons.',
    confidenceLine: 'Gain the accuracy needed for dependable exam performance.',
    href: '/subjects/bookkeeping',
  },
  {
    id: 'computer-studies',
    slug: 'computer-studies',
    name: 'Computer Studies',
    catalogSubject: 'Computer Studies',
    description: 'Learn practical concepts and terminology in a structured, exam-focused flow.',
    confidenceLine: 'Build technical confidence one lesson at a time.',
    href: '/subjects/computer-studies',
  },
  {
    id: 'english',
    slug: 'english',
    name: 'English',
    catalogSubject: 'English',
    description: 'Sharpen grammar, comprehension, and written expression with direct explanations.',
    confidenceLine: 'Improve communication and answer with confidence in every paper.',
    href: '/subjects/english',
  },
];

export const PUBLIC_LAUNCH_CLASSES = LAUNCH_CLASSES.filter((entry) => entry.visible);
export const PUBLIC_LAUNCH_SUBJECT_NAMES = FORM_FOUR_SUBJECTS.map((subject) => subject.catalogSubject);
export const FORM_FOUR_CLASS = PUBLIC_LAUNCH_CLASSES.find((entry) => entry.launchFocus) || PUBLIC_LAUNCH_CLASSES[0];
export const FORM_FOUR_PRICE_TZS = 15000;
export const getLaunchSubjectBySlug = (slug: string) => FORM_FOUR_SUBJECTS.find((subject) => subject.slug === slug);

export const LAUNCH_NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Subjects', href: '/courses?level=secondary&sub=Form%204' },
  { label: 'Teachers', href: '/instructors' },
  { label: 'Mock Exams', href: '/#mock-exams' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'FAQ', href: '/#faq' },
] as const;
