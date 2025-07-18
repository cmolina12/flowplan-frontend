import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SectionModel } from '../models/section-model';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  private apiUrl: string = 'http://localhost:8080/api/schedules';


  constructor(private http: HttpClient) { }

  getSchedules(sectionsPerCourse: SectionModel[][]): Observable<SectionModel[][]>{

    return this.http.post<SectionModel[][]>(this.apiUrl, sectionsPerCourse);

  }

}
