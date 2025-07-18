import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CourseModel } from '../models/course-model';
import { SectionModel } from '../models/section-model';

@Injectable({
  providedIn: 'root'
})
export class CourseService {

  private apiUrl: string = 'http://localhost:8080/api/courses'

  constructor(private http: HttpClient) { }

  // Search for courses by name
  searchCourses(query: string): Observable<CourseModel[]> {
    const wildcarded = query.trim().replace(/\s+/g, '%');
    // URL-encode the result
    const encoded = encodeURIComponent(wildcarded);
    return this.http.get<CourseModel[]>(`${this.apiUrl}/domain?nameInput=${encodeURIComponent(encoded)}`);
  }

  // Get sections for a specific course once the course is known by complete code (e.g., "IIND2201")
  getSections(courseCode: string): Observable<SectionModel[]> {
    return this.http.get<SectionModel[]>(`${this.apiUrl}/${courseCode}/sections`);
  }

  
}
