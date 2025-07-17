import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CourseModel } from '../models/course-model';
import { SectionModel } from '../models/section-model';

@Injectable({
  providedIn: 'root'
})
export class CourseService {

  private apiUrl = 'http://localhost:8080/api/courses'

  constructor(private http: HttpClient) { }

  searchCourses(query: string): Observable<CourseModel[]> {
    return this.http.get<CourseModel[]>(`${this.apiUrl}/domain?nameInput=${query}`);
  }

  getSections(courseCode: string): Observable<SectionModel[]> {
    return this.http.get<SectionModel[]>(`${this.apiUrl}/${courseCode}/sections`);
  }

  
}
