import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {
  BaseChartDirective,                    // standalone directive
  provideCharts,                         // provider factory
  withDefaultRegisterables               // helper to register all default Chart.js pieces
} from 'ng2-charts';

import {
  Chart, LineController, LineElement, PointElement,
  LinearScale, CategoryScale, Title, Tooltip, Legend
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

/* Register the extra plugin once */
Chart.register(annotationPlugin);
/* Material & App Components below — unchanged except added ChartsModule */
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { SignupPageComponent } from './pages/signup-page/signup-page.component';
import { PersonalDetailsComponent } from './pages/Admin/add-users/personal-details/personal-details.component';
import { AccountDetailsComponent } from './pages/Admin/add-users/account-details/account-details.component';
import { WorkInformationComponent } from './pages/Admin/add-users/work-information/work-information.component';
import { SummaryComponent } from './pages/Admin/add-users/summary/summary.component';
import { MatStepperModule } from '@angular/material/stepper';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { LaunchTestComponent } from './pages/launch-test/launch-test.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { NavbarComponent } from './pages/navbar/navbar.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UpdateProfileDialogComponent } from './pages/update-profile-dialog/update-profile-dialog.component';
import { testHistoryComponent } from './pages/Admin/testHistory/testHistory.component';
import { AdminDashboardComponent } from './pages/Admin/admin-dashboard/admin-dashboard.component';
import { AddUsersComponent } from './pages/Admin/add-users/add-users.component';
import { MatTabsModule } from '@angular/material/tabs';
import { ConsultUpdateUserComponent } from './pages/Admin/consult-update-user/consult-update-user.component';
import { ManageMachinesComponent } from './pages/Admin/manage-machines/manage-machines.component';
import { AddMachinesComponent } from './pages/Admin/manage-machines/add-machines/add-machines.component';
import { DeleteMachinesComponent } from './pages/Admin/manage-machines/delete-machines/delete-machines.component';
import { ConsultUpdateMachinesComponent } from './pages/Admin/manage-machines/consult-update-machines/consult-update-machines.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MeasurementTableComponent } from './pages/measurement-table/measurement-table.component';
import { EditMachineDialogComponent } from './pages/Admin/manage-machines/edit-machine-dialog/edit-machine-dialog.component';
import { MatCardModule } from '@angular/material/card';
import { rxStompServiceFactory } from './services/rx-stomp-service-factory';
import { RxStomp } from '@stomp/rx-stomp';
import { QmComponent } from './pages/qm/qm.component'; 
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@NgModule({
  declarations: [
    AppComponent,
    LoginPageComponent,
    SignupPageComponent,
    PersonalDetailsComponent,
    AccountDetailsComponent,
    WorkInformationComponent,
    SummaryComponent,
    LaunchTestComponent,
    ProfileComponent,
    DashboardComponent,
    NavbarComponent,
    UpdateProfileDialogComponent,
    AddUsersComponent,
testHistoryComponent,
    AdminDashboardComponent,
    ConsultUpdateUserComponent,
    ManageMachinesComponent,
    AddMachinesComponent,
    DeleteMachinesComponent,
    ConsultUpdateMachinesComponent,
    MeasurementTableComponent,
    EditMachineDialogComponent,
    QmComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatStepperModule,
    MatSelectModule,
    MatDialogModule,
    MatTabsModule,
    MatSnackBarModule,
    MatDividerModule,
    MatTableModule,
    MatIconModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatCardModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatInputModule,
    BaseChartDirective
  ],
  providers: [  
        /* Register default Chart.js controllers/scales/etc. in one line */
    provideCharts(withDefaultRegisterables()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
      {
    provide: RxStomp,
      useFactory: rxStompServiceFactory
    }

  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
