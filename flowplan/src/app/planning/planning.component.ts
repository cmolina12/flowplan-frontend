import { Component, OnInit } from '@angular/core';
import { CourseService } from '../services/course.service';
import { CourseModel } from '../models/course-model';
import { ScheduleService } from '../services/schedule.service';
import { SectionModel } from '../models/section-model';
import { ChangeDetectorRef } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';


@Component({
  standalone: false,
  selector: 'app-planning',
  templateUrl: './planning.component.html',
  styleUrls: ['./planning.component.css'],
})
export class PlanningComponent implements OnInit {
 calendarOptions: CalendarOptions = {
  plugins: [timeGridPlugin, dayGridPlugin, interactionPlugin],
  height: 600,
  contentHeight: 600,
  initialView: 'timeGridWeek',
  headerToolbar: false,
  slotMinTime: '06:00:00',
  slotMaxTime: '20:00:00',
  allDaySlot: false,
  dayHeaderFormat: { weekday: 'long' }, // Short weekday format
  events: [
    {
      title: 'Test Event',
      start: '2025-07-28T08:00:00',
      end: '2025-07-28T09:00:00',
      color: '#1e90ff'
    }
    
  
  ],
  hiddenDays: [0], // Hide Sunday (0)
  
};

  // Properties for course search and selection
  searchQuery: string = '';
  courses: CourseModel[] = [];


  sections: SectionModel[] = [];
  selectedSections: SectionModel[] = [];
  scheduleOptions: any[] = [];

  selectedSectionsByCourse: { [courseCode: string]: SectionModel[] } = {}; // Maps course code to an array of selected sections for that course
  activeSelectedCourseCode: string | null = null;

  loading = false;
  empty = false;
  error: string = '';
  ScheduleError: string = '';
  expandedCourses: { [code: string]: boolean } = {};

  onSectionClick(course: CourseModel, section: SectionModel) : void {
    console.log('Section selected:', section);
    let action: string = ""

    // Initialize the selected sections array for the course if it doesn't exist
    if (!this.selectedSectionsByCourse[course.code]) {
      this.selectedSectionsByCourse[course.code] = []; // Create a new array for this course
      console.log(`Initialized selected sections for course ${course.code}.`);
    }

    // Prevent duplicates (using nrc as unique id)
    if (!this.selectedSectionsByCourse[course.code].some(s => s.nrc === section.nrc)) { // s is a section in the array, any of them currently present for that code
      this.selectedSectionsByCourse[course.code].push(section);
      console.log(`Section ${section.nrc} added to course ${course.code}.`,
        this.selectedSectionsByCourse
      );
    }
    // Remove if already selected
    else {
      this.selectedSectionsByCourse[course.code] = this.selectedSectionsByCourse[course.code].filter(
        s => s.nrc !== section.nrc
      );
      console.log(
        `Section ${section.nrc} removed from course ${course.code}.`,
        this.selectedSectionsByCourse
      );

      // Remove the whole course if no sections are selected after removal
      if (this.selectedSectionsByCourse[course.code].length === 0) {
        delete this.selectedSectionsByCourse[course.code];
        console.log(`No sections left for course ${course.code}, removing it from selected sections.`, this.selectedSectionsByCourse);
        action = 'removed';
      }
    }

    // Run the schedule fetch after selection change
    this.checkRequirement(course.code, action);
    
  }

  isSectionSelected(courseCode: string, sectionNrc: string): boolean {
    const arr = this.selectedSectionsByCourse[courseCode];
    return Array.isArray(arr) && arr.some(s => s.nrc === sectionNrc);
  }

  getSelectedCourseCodes(): string[] {
    return Object.keys(this.selectedSectionsByCourse);
  }

  constructor(
    private courseService: CourseService,
    private scheduleService: ScheduleService,
    private cdr: ChangeDetectorRef
  ) {}

  // Method to handle course selection
  toggleCourse(course: CourseModel): void {
    this.expandedCourses[course.code] = !this.expandedCourses[course.code];
    // This worked unintentionally as the dictionary is initialized empty as default.
    // When this first runs the opposite of 'undefined' will be true, so it will create the key-value pair for the course code and expand it correctly.
  }

  getCicloLabel(section: any): string {
    if (section.ptrm === '8A') return 'First Cycle';
    if (section.ptrm === '8B') return 'Second Cycle';
    if (section.ptrm === '1') return 'Complete Cycle';
    return section.ptrm;
  }

  getIntersemetral(section: any): string {
    if (section.term === '202519') return 'Intersemestral';
    return section.term;
  }

  // Method to handle course search input
  onSearchCourse(searchQuery: string): void {
    if (this.searchQuery.trim().length > 0) {
      this.loading = true; // Set loading state
      this.courseService.searchCourses(this.searchQuery).subscribe({
        next: (courses: CourseModel[]) => {
          this.courses = courses;
          this.loading = false; // Reset loading state
          this.empty = false;
          this.error=''
          this.cdr.detectChanges(); // Ensure view updates
          console.log('Courses found:', courses);

          if (courses === null || courses.length === 0) {
            this.empty = true;
          }
        },
        error: (error) => {
          this.courses = []; // Clear courses on error
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

  // Method to fetch schedules based on selected sections

  fetchSchedules(): void {
    const sectionsPerCourse: SectionModel[][] = Object.values(this.selectedSectionsByCourse);

    if (sectionsPerCourse.length === 0) {
      console.warn('No sections selected for scheduling.');
      return;
    } 
    else {
      console.log('Fetching schedules for sections:', sectionsPerCourse);
      this.scheduleService.getSchedules(sectionsPerCourse).subscribe({
        next: (schedules: SectionModel[][]) => {
          this.scheduleOptions = schedules;
          console.log('Schedules fetched successfully:', schedules);
          console.log('Number of schedules:', schedules.length);
          this.ScheduleError = ''; // Clear any previous error message
        },
        error: (error) => {
          console.error('Error fetching schedules:', error);
          this.ScheduleError = 'Failed to fetch schedules. Please try again later.';
        },
      });
    }
  }

  // Method to check requirements before calling schedule service

checkRequirement(courseCode: string, action: string) {
  console.log(`Checking requirements for course: ${courseCode}`);
  const isLab = courseCode.endsWith('T');
  const baseCourseCode = isLab ? courseCode.slice(0, -1) : courseCode;
  const labCode = isLab ? courseCode : courseCode + 'T';

  // Helper: Is main course selected?
  const isMainSelected = !!this.selectedSectionsByCourse[baseCourseCode];
  // Helper: Is lab selected?
  const isLabSelected = !!this.selectedSectionsByCourse[labCode];

  if (isLab) {
    // LAB CASE
    if (action !== 'removed') {
      // Adding lab: main course must be selected
      if (!isMainSelected) {
        this.ScheduleError = `You selected a lab section for ${baseCourseCode}, you must also select the main course.`;
        this.cdr.detectChanges();
        return;
      }
    } else {
      // Removing lab: can't remove if main course is still selected
      if (isMainSelected) {
        this.ScheduleError = `You cannot remove the lab for ${baseCourseCode} while the main course is still selected.`;
        this.cdr.detectChanges();
        return;
      }
    }
    // No error, proceed
    this.ScheduleError = '';
    this.cdr.detectChanges();
    this.fetchSchedules();
    return;
  }

  // MAIN COURSE CASE
  this.courseService.searchCourses(labCode).subscribe({
    next: (courses: CourseModel[]) => {
      const labExists = courses.some(c => c.code === labCode);

      if (labExists) {
        if (action !== 'removed') {
          // Adding main: lab must be selected
          if (!isLabSelected) {
            this.ScheduleError = `The course ${courseCode} has an obligatory lab, you must also select a section of ${labCode}.`;
            this.cdr.detectChanges();
            return;
          }
        } else {
          // Removing main: can't remove if lab is still selected
          if (isLabSelected) {
            this.ScheduleError = `You cannot remove the main course ${courseCode} while the lab is still selected.`;
            this.cdr.detectChanges();
            return;
          }
        }
      }
      // No error, proceed
      this.ScheduleError = '';
      this.cdr.detectChanges();
      this.fetchSchedules();
    },
    error: () => {
      this.ScheduleError = "Could not verify lab requirement. Please check if you selected all your courses' respective labs.";
      this.cdr.detectChanges();
      this.fetchSchedules();
    }
  });
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
