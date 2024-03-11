import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  loginObj: Login;
  currentUrl: string | undefined;

  constructor(private http: HttpClient, private router: Router) {
    this.loginObj = new Login();
  }

  onLogin() {
    
    console.log(this.currentUrl)
    this.http.post('https://localhost:7115/User/Login', this.loginObj).subscribe((res:any)=>{
      if(!res.result) {
        console.log("Login Success");
        localStorage.setItem('HahnLoginToken', res.token);
        this.router.navigateByUrl('/dashboard');
        console.log('Navigating to:', this.router.createUrlTree(['/dashboard']).toString());
      } else {
        alert(res.message);
      }
    })
  }
}

export class Login { 
    userName: string;
    Password: string;
    constructor() {
      this.userName = '';
      this.Password = '';
    } 
}