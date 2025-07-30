import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlanningComponent } from './planning/planning.component';
import { LandingComponent } from './landing/landing.component';

const routes: Routes = [

  {path: 'landing', component: LandingComponent },
  {path: '', redirectTo: '/landing', pathMatch: 'full'},
  {path: 'planning', component: PlanningComponent},




];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
