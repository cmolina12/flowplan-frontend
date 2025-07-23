import { Component, OnInit } from '@angular/core';
import { CourseService } from '../services/course.service';
import { CourseModel } from '../models/course-model';
import { ScheduleService } from '../services/schedule.service';
import { SectionModel } from '../models/section-model';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-planning',
  templateUrl: './planning.component.html',
  styleUrls: ['./planning.component.css'],
})
export class PlanningComponent implements OnInit {
  // Properties for course search and selection
  searchQuery: string = '';
  courses: CourseModel[] = [];

  selectedCourse: CourseModel | null = null;
  sections: SectionModel[] = [];
  selectedSections: SectionModel[] = [];
  scheduleOptions: any[] = [];

  selectedSectionsByCourse: { [courseCode: string]: SectionModel[] } = {}; // Maps course code to an array of selected sections for that course

  loading = false;
  empty = false;
  error: string = '';
  expandedCourses: { [code: string]: boolean } = {};

  onSectionClick(course: CourseModel, section: SectionModel) {
    console.log('Section selected:', section);
    console.log('Course selected:', course);

    // Initialize the selected sections array for the course if it doesn't exist
    if (!this.selectedSectionsByCourse[course.code]) {
      this.selectedSectionsByCourse[course.code] = []; // Create a new array for this course
    }

    // Prevent duplicates (using nrc as unique id)
    if (!this.selectedSectionsByCourse[course.code].some(s => s.nrc === section.nrc)) { // s is a section in the array, any of them currently present for that code
      this.selectedSectionsByCourse[course.code].push(section);
      console.log(
        `Section ${section.nrc} added to course ${course.code}. Current sections:`,
        this.selectedSectionsByCourse[course.code]
      );
    }
    
  }

  constructor(
    private courseService: CourseService,
    private scheduleService: ScheduleService,
    private cdr: ChangeDetectorRef
  ) {}

  // Method to handle course selection
  toggleCourse(course: CourseModel) {
    this.expandedCourses[course.code] = !this.expandedCourses[course.code];
    // This worked unintentionally as the dictionary is initialized empty as default.
    // When this first runs the opposite of 'undefined' will be true, so it will create the key-value pair for the course code and expand it correctly.
  }

  getCicloLabel(section: any): string {
    if (section.ptr === '8A') return 'First Cycle';
    if (section.ptrm === '8B') return 'Second Cycle';
    if (section.ptrm === '1') return 'Complete Cycle';
    return section.ptrm;
  }

  getIntersemetral(section: any): string {
    if (section.term === '202519') return 'Intersemestral';
    return section.term;
  }

  // Method to handle course search input
  onSearchCourse() {
    if (this.searchQuery.trim().length > 0) {
      this.loading = true; // Set loading state
      this.courseService.searchCourses(this.searchQuery).subscribe({
        next: (courses: CourseModel[]) => {
          this.courses = courses;
          this.loading = false; // Reset loading state
          this.empty = false;
          this.cdr.detectChanges(); // Ensure view updates
          console.log('Courses found:', courses);

          if (courses === null || courses.length === 0) {
            this.empty = true;
          }
        },
        error: (error) => {
          console.error('Error fetching courses:', error);
          this.error =
            'The Uniandes database has errors in course values. Please try again later when the university fixes this issue.';
          this.loading = false;
          this.empty = false; // Reset empty state
          this.cdr.detectChanges(); // Ensure view updates
        },
      });
    } else {
      this.courses = []; // Clear courses if search query is empty
      this.error = ''; // Clear any previous error message
      this.loading = false;
      this.cdr.detectChanges(); // Ensure view updates
      console.log('Search query is empty, clearing courses.');
    }
  }

  runApiTests = false; // Set to true to run API tests on component initialization
  ngOnInit() {
    if (this.runApiTests) {
      this.courseService.searchCourses('CONTROL DE PRODUCCION').subscribe({
        next: (courses: CourseModel[]) => {
          console.log('COURSE SERVICE TEST 1 - Courses found:', courses);
        },
        error: (error) => {
          console.error('Error fetching courses:', error);
        },
      });

      this.courseService.getSections('IIND2201').subscribe({
        next: (sections: SectionModel[]) => {
          console.log(
            'COURSE SERVICE TEST 2 - Sections for IIND2201:',
            sections
          );
        },
        error: (error) => {
          console.error('Error fetching sections:', error);
        },
      });

      // --- SCHEDULE SERVICE TEST ---

      this.courseService.getSections('IIND2201').subscribe({
        next: (sections1: SectionModel[]) => {
          const SectionOne_CourseOne = sections1.find(
            (section) => section.nrc === '10876'
          );
          const SectionTwo_CourseOne = sections1.find(
            (section) => section.nrc === '10742'
          );
          let sectionsForCourse1: SectionModel[] = [];
          if (SectionOne_CourseOne)
            sectionsForCourse1.push(SectionOne_CourseOne);
          if (SectionTwo_CourseOne)
            sectionsForCourse1.push(SectionTwo_CourseOne);
          console.log(
            'SCHEDULE SERVICE TEST 1 - Sections for IIND2201:',
            sectionsForCourse1
          );

          // Now fetch the second course's sections
          this.courseService.getSections('IIND3400').subscribe({
            next: (sections2: SectionModel[]) => {
              const SectionOne_CourseTwo = sections2.find(
                (section) => section.nrc === '10752'
              );
              const SectionTwo_CourseTwo = sections2.find(
                (section) => section.nrc === '77779'
              );
              let sectionsForCourse2: SectionModel[] = [];
              if (SectionOne_CourseTwo)
                sectionsForCourse2.push(SectionOne_CourseTwo);
              if (SectionTwo_CourseTwo)
                sectionsForCourse2.push(SectionTwo_CourseTwo);
              console.log(
                'SCHEDULE SERVICE TEST 2 - Sections for IIND3400:',
                sectionsForCourse2
              );

              // Now both arrays are ready, build the payload and call the schedule service
              const sectionsPerCourse: SectionModel[][] = [
                sectionsForCourse1,
                sectionsForCourse2,
              ];

              console.log(
                'SCHEDULE SERVICE TEST 3 - All sections per course:',
                sectionsPerCourse
              );

              this.scheduleService.getSchedules(sectionsPerCourse).subscribe({
                next: (schedules: SectionModel[][]) => {
                  console.log(
                    'SCHEDULE SERVICE TEST 4 - Schedules:',
                    schedules
                  );
                  console.log(
                    'SCHEDULE SERVICE TEST 5 - Number of schedules:',
                    schedules.length
                  );
                },
                error: (error) => {
                  console.error('Error fetching schedules:', error);
                },
              });
            },
            error: (error) => {
              console.error('Error fetching sections for IIND3400:', error);
            },
          });
        },
        error: (error) => {
          console.error('Error fetching sections for IIND2201:', error);
        },
      });
    }
  }
}
