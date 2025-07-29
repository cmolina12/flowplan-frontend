import { Component, OnInit, OnDestroy } from '@angular/core';
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
export class PlanningComponent implements OnInit, OnDestroy {
  // Properties for course search and selection
  private calendarRefreshInterval: any;
  searchQuery: string = '';
  courses: CourseModel[] = [];

  selectedEvent: any = null; // To store the currently selected event for display

  sections: SectionModel[] = [];
  selectedSections: SectionModel[] = [];
  scheduleOptions: any[] = [];
  scheduleOptionsTest = [
    // Schedule 1
    [
      {
        title: 'Class 1',
        start: '2025-07-28T11:00:00',
        end: '2025-07-28T12:00:00',
        color: '#ffe066',
        textColor: '#222',
      },
    ],
    // Schedule 2
    [
      {
        title: 'Class 2',
        start: '2025-07-29T16:00:00',
        end: '2025-07-29T17:00:00',
        color: '#ff8c00',
        textColor: '#222',
      },
    ],
  ];

  selectedScheduleIndex = 0; // Start with the first schedule

  selectedSectionsByCourse: { [courseCode: string]: SectionModel[] } = {}; // Maps course code to an array of selected sections for that course
  activeSelectedCourseCode: string | null = null;

  loading = false;
  empty = false;
  error: string = '';
  ScheduleError: string = '';
  expandedCourses: { [code: string]: boolean } = {};

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
    events: [], // Use the first schedule for initial display
    hiddenDays: [0], // Hide Sunday (0)
    slotDuration: '00:30:00', // 30-minute slots
    slotLabelInterval: '00:30', // label every 30 minutes
    slotLabelFormat: { hour: '2-digit', minute: '2-digit', hour12: true }, // e.g., 08:00, 08:30
    eventContent: function (arg) {
      return { html: arg.event.title };
    },
    eventClick: (arg) => {
      this.selectedEvent = {
        title: arg.event.title,
        start: arg.event.start,
        end: arg.event.end,
        color: arg.event.backgroundColor,
        textColor: arg.event.textColor,
      };
    }
  };

  updateCalendarEvents() {
    this.calendarOptions = {
      ...this.calendarOptions,
      events: this.scheduleOptions[this.selectedScheduleIndex],
    };
    console.log('Updated calendar events:', this.calendarOptions.events);
  }

  goToPrevSchedule() {
    if (this.selectedScheduleIndex > 0) {
      this.selectedScheduleIndex--;
      this.updateCalendarEvents();
    }
  }

  get hasSelectedSections(): boolean {
    return Object.keys(this.selectedSectionsByCourse).length > 0;
  }

  goToNextSchedule() {
    if (this.selectedScheduleIndex < this.scheduleOptions.length - 1) {
      this.selectedScheduleIndex++;
      this.updateCalendarEvents();
    }
  }

  onSectionClick(course: CourseModel, section: SectionModel): void {
    console.log('Section selected:', section);
    let action: string = '';

    // Initialize the selected sections array for the course if it doesn't exist
    if (!this.selectedSectionsByCourse[course.code]) {
      this.selectedSectionsByCourse[course.code] = []; // Create a new array for this course
      console.log(`Initialized selected sections for course ${course.code}.`);
    }

    // Prevent duplicates (using nrc as unique id)
    if (
      !this.selectedSectionsByCourse[course.code].some(
        (s) => s.nrc === section.nrc
      )
    ) {
      // s is a section in the array, any of them currently present for that code
      this.selectedSectionsByCourse[course.code].push(section);
      console.log(
        `Section ${section.nrc} added to course ${course.code}.`,
        this.selectedSectionsByCourse
      );
    }
    // Remove if already selected
    else {
      this.selectedSectionsByCourse[course.code] =
        this.selectedSectionsByCourse[course.code].filter(
          (s) => s.nrc !== section.nrc
        );
      console.log(
        `Section ${section.nrc} removed from course ${course.code}.`,
        this.selectedSectionsByCourse
      );

      // Remove the whole course if no sections are selected after removal
      if (this.selectedSectionsByCourse[course.code].length === 0) {
        delete this.selectedSectionsByCourse[course.code];
        console.log(
          `No sections left for course ${course.code}, removing it from selected sections.`,
          this.selectedSectionsByCourse
        );
        action = 'removed';
      }
    }

    // Run the schedule fetch after selection change
    this.checkRequirement(course.code, action);
  }

  isSectionSelected(courseCode: string, sectionNrc: string): boolean {
    const arr = this.selectedSectionsByCourse[courseCode];
    return Array.isArray(arr) && arr.some((s) => s.nrc === sectionNrc);
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
          this.error = '';
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
    const sectionsPerCourse: SectionModel[][] = Object.values(
      this.selectedSectionsByCourse
    );
    const courseCodes = Object.keys(this.selectedSectionsByCourse);

    if (sectionsPerCourse.length === 0) {
      console.warn('No sections selected for scheduling.');
      return;
    } else {
      console.log('Fetching schedules for sections:', sectionsPerCourse);
      this.scheduleService.getSchedules(sectionsPerCourse).subscribe({
        next: (schedules: SectionModel[][]) => {
          console.log('Schedules received:', schedules);

          if (!Array.isArray(schedules) || schedules.length === 0) {
            console.warn('No schedules found for the selected sections.');
            this.ScheduleError =
              'No compatible schedules found for the selected sections. Please select different sections or check for conflicts.';
            this.cdr.detectChanges();
            return;
          }

          schedules.forEach((schedule) => {
            schedule.forEach((section, i) => {
              (section as any).courseCode = courseCodes[i]
            });
          });

          this.ScheduleError = ''; // Clear any previous error message
          this.scheduleOptions = this.mapSchedulesToCalendarEvents(schedules);
          this.selectedScheduleIndex = 0; // Reset to first schedule
          this.updateCalendarEvents(); // Update calendar with the first schedule
          this.cdr.detectChanges(); // Ensure view updates
          console.log('Schedules fetched successfully:', schedules);
          console.log('Number of schedules:', schedules.length);
          
        },
        error: (error) => {
          console.error('Error fetching schedules:', error);
          this.ScheduleError =
            'A critical error occurred while generating schedules. Please try again later or message me at contact@camilomolina.dev.';
        },
      });
    }
  }

  private mapSchedulesToCalendarEvents(schedules: SectionModel[][]): any[][] {
    const dayMap: { [key: string]: number } = {
      SUNDAY: 0,
      MONDAY: 1,
      TUESDAY: 2,
      WEDNESDAY: 3,
      THURSDAY: 4,
      FRIDAY: 5,
      SATURDAY: 6,
    };

    // Set the base week (Monday of the week you want to display)
    const baseWeek = new Date(2025, 6, 28); // July 28, 2025 (month is 0-based)

    function getDateForDay(baseDate: Date, dayOfWeek: number): Date {
      const date = new Date(baseDate);
      const currentDay = date.getDay();
      const diff = dayOfWeek - currentDay;
      date.setDate(date.getDate() + diff);
      return date;
    }

    function setTime(date: Date, time: string): Date {
      const [hours, minutes, seconds] = time.split(':').map(Number);
      date.setHours(hours, minutes, seconds || 0, 0);
      return date;
    }

    // Color palette for different sections
    const colorPalette = [
      '#ffe066',
      '#ff8c00',
      '#32cd32',
      '#1e90ff',
      '#ad2121',
      '#e3bc08',
    ];

    // This is the "return" for the function
    return schedules.map((schedule: SectionModel[]) =>
      schedule.flatMap((section: SectionModel, idx: number) =>
        section.meetings.map((meeting) => {
          const dayNum = dayMap[meeting.day];
          const startDate = setTime(
            getDateForDay(baseWeek, dayNum),
            meeting.start
          );
          const endDate = setTime(getDateForDay(baseWeek, dayNum), meeting.end);
          return {
            title: `
              <div style="font-size:0.95em;">
                <b>${(section as any).courseCode} - ${section.sectionId}</b><br><br>
                <span class = "fc-event-teacher" style="font-size:0.92em; font-weight:400;">${section.professors.join(
                  ', '
                )}</span>
              </div>
            `,
            start: startDate,
            end: endDate,
            color: colorPalette[idx % colorPalette.length],
            textColor: '#222',
          };
        })
      )
    );
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
        if (!Array.isArray(courses)) {
          console.log('Is null brother');
          this.cdr.detectChanges();
          this.fetchSchedules();
          return;
        }
        const labExists = courses.some((c) => c.code === labCode);

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
        this.ScheduleError =
          "Could not verify lab requirement. Please check if you selected all your courses' respective labs.";
        this.cdr.detectChanges();
        this.fetchSchedules();
      },
    });
  }

  runApiTests = false; // Set to true to run API tests on component initialization
  ngOnInit() {

    this.calendarRefreshInterval = setInterval(() => {
      this.updateCalendarEvents();
    }, 1000);
  


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

  ngOnDestroy() {
    if (this.calendarRefreshInterval) {
      clearInterval(this.calendarRefreshInterval);
    }
  }
}
