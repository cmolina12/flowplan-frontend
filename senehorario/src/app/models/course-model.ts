import { SectionModel } from './section-model';

export interface CourseModel {
  code: string; // The course code, e.g., "CS101"
  title: string; // The course name, e.g., "Introduction to Computer Science"
  sections: SectionModel[]; // A list of sections for this course
}