import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { SignupPageComponent } from './pages/signup-page/signup-page.component';
import { PersonalDetailsComponent } from './pages/signup-page/personal-details/personal-details.component';
import { AccountDetailsComponent } from './pages/signup-page/account-details/account-details.component';
import { WorkInformationComponent } from './pages/signup-page/work-information/work-information.component';
import { SummaryComponent } from './pages/signup-page/summary/summary.component';
import { MatStepperModule } from '@angular/material/stepper';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { LaunchTestComponent } from './pages/launch-test/launch-test.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { NavbarComponent } from './pages/navbar/navbar.component';
import { HttpClientModule } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UpdateProfileDialogComponent } from './pages/update-profile-dialog/update-profile-dialog.component';

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
    UpdateProfileDialogComponent, // Declare the standalone component here
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
   MatDialogModule, // Add MatDialogModule here
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true, // Allows multiple interceptors
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}