import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { PersonalDetailsComponent } from './pages/Admin/add-users/personal-details/personal-details.component';
import { AccountDetailsComponent } from './pages/Admin/add-users/account-details/account-details.component';
import { WorkInformationComponent } from './pages/Admin/add-users/work-information/work-information.component';
import { SummaryComponent } from './pages/Admin/add-users/summary/summary.component';
import { SignupPageComponent } from './pages/signup-page/signup-page.component';
import { LaunchTestComponent } from './pages/launch-test/launch-test.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AuthGuard } from './auth/auth.guard';
import { AdminDashboardComponent } from './pages/Admin/admin-dashboard/admin-dashboard.component';
import { AddUsersComponent } from './pages/Admin/add-users/add-users.component';
import { ManageMachinesComponent } from './pages/Admin/manage-machines/manage-machines.component';
import { MeasurementTableComponent } from './pages/measurement-table/measurement-table.component';
import { testHistoryComponent } from './pages/Admin/testHistory/testHistory.component';

const routes: Routes = [
  { path: '', component: LoginPageComponent },
  { path: 'personaldet', component: PersonalDetailsComponent },
  { path: 'accountdet', component: AccountDetailsComponent },
  { path: 'workinfo', component: WorkInformationComponent },
  { path: 'summary', component: SummaryComponent },
  { path: 'signup', component: SignupPageComponent },
  { path: 'measurement-table', component: MeasurementTableComponent,
     canActivate: [AuthGuard], 
     data: { roles: ['operateur','qm' ,'admin'] }},
  {path: 'launch-test', component: LaunchTestComponent, canActivate: [AuthGuard], data: { roles:[ 'operateur','qm' ]}},
  
  {
    path: 'admin',
    canActivate: [AuthGuard],
    data: { roles: ['admin', 'qm'] }, // ✅ Both admin and QM can enter
    children: [
      { 
        path: 'admindashboard', 
        component: AdminDashboardComponent,
        data: { roles: ['admin', 'qm'] } // ✅ Explicit
      },
      { 
        path: 'ManageMachines', 
        component: ManageMachinesComponent,
        data: { roles: ['admin'] } // 🔒 Only admin
      },
      { 
        path: 'AddUsers', 
        component: AddUsersComponent,
        data: { roles: ['admin'] } // 🔒 Only admin
      },
      { 
        path: 'testHistory', 
        component: testHistoryComponent,
        data: { roles: ['admin', 'qm'] } // ✅ QM can view test history
      },
      { 
        path: 'profile', 
        component: ProfileComponent 
      },
   
      { 
        path: '', 
        redirectTo: 'admindashboard', 
        pathMatch: 'full' 
      },
    ]
  },
  // Redirect for incorrect casing
  { path: 'Admin', redirectTo: '/admin', pathMatch: 'prefix' },
    { path: '**', redirectTo: '' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}