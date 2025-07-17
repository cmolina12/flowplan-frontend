import { Component, OnInit } from '@angular/core';
import { CourseService } from '../services/course.service';
import { CourseModel } from '../models/course-model';

@Component({
  standalone: false,
  selector: 'app-planning',
  templateUrl: './planning.component.html',
  styleUrls: ['./planning.component.css']
})
export class PlanningComponent implements OnInit {

  constructor(private courseService: CourseService) { }

  ngOnInit() {
    this.courseService.searchCourses('CONTROL DE PRODUCCION').subscribe({
      next: (courses: CourseModel[]) => {console.log('Courses found:', courses)},
      error: (error) => {console.error('Error fetching courses:', error);}
    })
  }

}
