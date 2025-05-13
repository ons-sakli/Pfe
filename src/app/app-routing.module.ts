import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { PersonalDetailsComponent } from './pages/signup-page/personal-details/personal-details.component';
import { AccountDetailsComponent } from './pages/signup-page/account-details/account-details.component';
import { WorkInformationComponent } from './pages/signup-page/work-information/work-information.component';
import { SummaryComponent } from './pages/signup-page/summary/summary.component';
import { SignupPageComponent } from './pages/signup-page/signup-page.component';
import { LaunchTestComponent } from './pages/launch-test/launch-test.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

const routes: Routes = [
  { path: '', component: LoginPageComponent },
  { path: 'personaldet', component: PersonalDetailsComponent },
  { path: 'accountdet', component: AccountDetailsComponent },
  { path: 'workinfo', component: WorkInformationComponent },
  { path: 'summary', component: SummaryComponent },
  { path: 'signup', component: SignupPageComponent },
  { path: 'launch-test', component: LaunchTestComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'dashboard', component: DashboardComponent },



];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
