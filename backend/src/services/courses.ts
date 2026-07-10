import type {
  CourseRecommendation,
  SkillGapDifficulty,
  SkillGapPriority,
} from '../types';

/**
 * A course provider knows how to turn a missing skill into a course
 * recommendation. The learning pipeline only ever talks to this interface, so
 * swapping the stub providers below for real Coursera/Udemy/YouTube/NPTEL/edX
 * integrations requires no change to the pipeline itself.
 */
export interface CourseProvider {
  name: string;
  domain: string;
  build(
    skill: string,
    difficulty: SkillGapDifficulty,
    priority: SkillGapPriority,
    index: number,
  ): CourseRecommendation;
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Deterministic rating 4.0 - 4.6 so output is stable across runs. */
function ratingFor(index: number): number {
  return Math.round((4.0 + (index % 5) * 0.15) * 10) / 10;
}

function durationFor(d: SkillGapDifficulty): string {
  return d === 'hard' ? '6 weeks' : d === 'moderate' ? '4 weeks' : '3 weeks';
}

export const coursera: CourseProvider = {
  name: 'Coursera',
  domain: 'coursera.org',
  build: (skill, difficulty, priority, i) => ({
    title: `${skill}: Foundations`,
    provider: 'Coursera',
    skill,
    difficulty,
    estimatedDuration: durationFor(difficulty),
    url: `https://www.coursera.org/learn/${slug(skill)}`,
    rating: ratingFor(i),
    priority,
  }),
};

export const udemy: CourseProvider = {
  name: 'Udemy',
  domain: 'udemy.com',
  build: (skill, difficulty, priority, i) => ({
    title: `Master ${skill} from Scratch`,
    provider: 'Udemy',
    skill,
    difficulty,
    estimatedDuration: durationFor(difficulty),
    url: `https://www.udemy.com/course/${slug(skill)}-masterclass/`,
    rating: ratingFor(i + 1),
    priority,
  }),
};

export const youtube: CourseProvider = {
  name: 'YouTube',
  domain: 'youtube.com',
  build: (skill, difficulty, priority, i) => ({
    title: `${skill} - Full Course`,
    provider: 'YouTube',
    skill,
    difficulty,
    estimatedDuration: durationFor(difficulty),
    url: `https://www.youtube.com/results?search_query=${encodeURIComponent(skill + ' tutorial')}`,
    rating: ratingFor(i + 2),
    priority,
  }),
};

export const nptel: CourseProvider = {
  name: 'NPTEL',
  domain: 'nptel.ac.in',
  build: (skill, difficulty, priority, i) => ({
    title: `NPTEL ${skill} Course`,
    provider: 'NPTEL',
    skill,
    difficulty,
    estimatedDuration: durationFor(difficulty),
    url: `https://nptel.ac.in/courses/${slug(skill)}`,
    rating: ratingFor(i + 3),
    priority,
  }),
};

export const edx: CourseProvider = {
  name: 'edX',
  domain: 'edx.org',
  build: (skill, difficulty, priority, i) => ({
    title: `${skill}: Professional Certificate`,
    provider: 'edX',
    skill,
    difficulty,
    estimatedDuration: durationFor(difficulty),
    url: `https://www.edx.org/learn/${slug(skill)}`,
    rating: ratingFor(i + 4),
    priority,
  }),
};

/** Stub providers. Round-robin assignment spreads skills across sources. */
export const COURSE_PROVIDERS: CourseProvider[] = [
  coursera,
  udemy,
  youtube,
  nptel,
  edx,
];

/** Map a gap priority to a learning difficulty for the recommendation. */
export function priorityToDifficulty(priority: SkillGapPriority): SkillGapDifficulty {
  return priority === 'high' ? 'hard' : priority === 'medium' ? 'moderate' : 'easy';
}

/**
 * Produce course recommendations for missing skills using the stub providers.
 * One recommendation per skill, providers assigned round-robin.
 */
export function recommendStubCourses(
  items: { skill: string; difficulty: SkillGapDifficulty; priority: SkillGapPriority }[],
): CourseRecommendation[] {
  return items.map((it, i) => COURSE_PROVIDERS[i % COURSE_PROVIDERS.length].build(
    it.skill,
    it.difficulty,
    it.priority,
    i,
  ));
}
