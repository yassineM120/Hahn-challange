import { Component, ViewChild } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatButtonModule} from '@angular/material/button';
import { AuthService } from './service/auth.service'; 
import { HttpClient } from '@angular/common/http';

import { BreakpointObserver } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatNavList } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, MatButtonModule , MatMenuModule,
    MatIconModule, MatNavList, MatSidenavModule, MatToolbarModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'hahn-cargo-sim';

  constructor(private http: HttpClient, private authService: AuthService, private observer: BreakpointObserver, private router: Router) {}  


  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;
  isMobile= true;
  isCollapsed = true;

  ngOnInit() {
      this.observer.observe(['(max-width: 800px)']).subscribe((screenSize) => {
        if (screenSize.matches) {
          this.isMobile = true;
        } else {
          this.isMobile = false;
        }
      });
  }


  toggleMenu() {
    if(this.isMobile){
      this.sidenav.toggle();
      this.isCollapsed = false;
    } else {
      this.sidenav.open();
      this.isCollapsed = !this.isCollapsed;
    }
  }

  CreateFile(){
    const token = this.authService.getToken();
    if (token) {
      const url = `https://localhost:7115/Order/GenerateFile?maxTicks=720&filename=BigGridOrders.json`;
      this.http.post < any > (url, {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        .subscribe(
          () => console.log("File generated successfully"),
          error => {
            console.error("Error accepting order:", error);
          }
        );
    }
  }

}
