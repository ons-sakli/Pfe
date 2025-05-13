import { Component ,EventEmitter, Input, Output } from '@angular/core';
import { AuthService } from '../../../services/auth.service';


@Component({
  selector: 'app-personal-details',
  standalone: false,
  templateUrl: './personal-details.component.html',
  styleUrl: './personal-details.component.css'
})
export class PersonalDetailsComponent {
  @Input() selectedIndex: number = 0; 
  @Output() stepChange = new EventEmitter<number>();

  personalDetails = {
    matricule: '',
    firstName: '',
    lastName: '',
    nid: '',  
    email: ''
  };
  constructor(private authService: AuthService) {}
  updatePersonalDetails(details: any) {
    this.authService.personalDetails = details;
    console.log("Updated personalDetails:", this.authService.personalDetails);

  }
  onSubmit() {
    this.authService.personalDetails = this.personalDetails;

    this.stepChange.emit(1);
  }
}
