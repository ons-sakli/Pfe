export interface Operateur {
  firstName: string;
  lastName: string;
  username: string;
  role: string;
  opMat: string;
  cin: string;
  segment: string;   
  groupe: string;  
    plantSiteName: string;         // ✅ Use plantSiteName
    phoneNumber: string;    
      password: string;              // "********"

showPassword?: boolean;
}