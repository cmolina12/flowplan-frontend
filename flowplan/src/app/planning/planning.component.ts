import { Component, OnInit } from '@angular/core';
import { CourseService } from '../services/course.service';
import { CourseModel } from '../models/course-model';
import { ScheduleService } from '../services/schedule.service';
import { SectionModel } from '../models/section-model';

@Component({
  standalone: false,
  selector: 'app-planning',
  templateUrl: './planning.component.html',
  styleUrls: ['./planning.component.css']
})
export class PlanningComponent implements OnInit {
  searchQuery = '';
  courses: CourseModel[] = [];
  selectedCourse: CourseModel | null = null;
  sections: SectionModel[] = [];
  selectedSections: SectionModel[] = [];
  scheduleOptions: any[] = [];
  loading = false;
  error = '';
  
  constructor(
    private courseService: CourseService,
    private scheduleService: ScheduleService  
  ) {}

  ngOnInit() {

    this.courseService.searchCourses('CONTROL DE PRODUCCION').subscribe({
      next: (courses: CourseModel[]) => {
        console.log('COURSE SERVICE TEST 1 - Courses found:', courses);
      },
      error: (error) => {
        console.error('Error fetching courses:', error);
      }
    });

    this.courseService.getSections('IIND2201').subscribe({
      next: (sections: SectionModel[]) => {
        console.log('COURSE SERVICE TEST 2 - Sections for IIND2201:', sections);
      },
      error: (error) => {
        console.error('Error fetching sections:', error);
      }
    });

    // --- SCHEDULE SERVICE TEST ---

    this.courseService.getSections('IIND2201').subscribe({
      next: (sections1: SectionModel[]) => {
        const SectionOne_CourseOne = sections1.find(section => section.nrc === '10876');
        const SectionTwo_CourseOne = sections1.find(section => section.nrc === '10742');
        let sectionsForCourse1: SectionModel[] = [];
        if (SectionOne_CourseOne) sectionsForCourse1.push(SectionOne_CourseOne);
        if (SectionTwo_CourseOne) sectionsForCourse1.push(SectionTwo_CourseOne);
        console.log('SCHEDULE SERVICE TEST 1 - Sections for IIND2201:', sectionsForCourse1);

        // Now fetch the second course's sections
        this.courseService.getSections('IIND3400').subscribe({
          next: (sections2: SectionModel[]) => {
            const SectionOne_CourseTwo = sections2.find(section => section.nrc === '10752');
            const SectionTwo_CourseTwo = sections2.find(section => section.nrc === '77779');
            let sectionsForCourse2: SectionModel[] = [];
            if (SectionOne_CourseTwo) sectionsForCourse2.push(SectionOne_CourseTwo);
            if (SectionTwo_CourseTwo) sectionsForCourse2.push(SectionTwo_CourseTwo);
            console.log('SCHEDULE SERVICE TEST 2 - Sections for IIND3400:', sectionsForCourse2);

            // Now both arrays are ready, build the payload and call the schedule service
            const sectionsPerCourse: SectionModel[][] = [
              sectionsForCourse1,
              sectionsForCourse2
            ];

            console.log('SCHEDULE SERVICE TEST 3 - All sections per course:', sectionsPerCourse);

            this.scheduleService.getSchedules(sectionsPerCourse).subscribe({
              next: (schedules: SectionModel[][]) => {
                console.log('SCHEDULE SERVICE TEST 4 - Schedules:', schedules);
                console.log('SCHEDULE SERVICE TEST 5 - Number of schedules:', schedules.length);
              },
              error: (error) => {
                console.error('Error fetching schedules:', error);
              }
            });
          },
          error: (error) => {
            console.error('Error fetching sections for IIND3400:', error);
          }
        });
      },
      error: (error) => {
        console.error('Error fetching sections for IIND2201:', error);
      }
    });
  }


}

