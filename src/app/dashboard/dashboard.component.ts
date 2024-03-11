import { Component, inject} from '@angular/core';
import { Router} from '@angular/router';
import { AuthService } from '../service/auth.service'; 
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AcceptedOrdersComponent } from '../accepted-orders/accepted-orders.component';
import { catchError } from 'rxjs/internal/operators/catchError';
import { Observable, of } from 'rxjs';
import { OrdersComponent } from '../orders/orders.component';
import { StorageService } from '../service/storage.service';





@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [AcceptedOrdersComponent,OrdersComponent],
})

export class DashboardComponent {
  httpClient = inject(HttpClient);
  coinAmount : number | undefined;
  cargoIds: number[] = [];

  constructor(private http: HttpClient, private authService: AuthService, private router: Router, private storageService: StorageService) {}  

  ngOnInit() {
    this.cargoIds = this.storageService.getCargoIds();
    this.getCoinAmount().subscribe(
      amount => {
        this.coinAmount = amount;
      },
      error => {
        console.error('Error fetching coin amount:', error);
        this.coinAmount = 0; 
      }
    );
  }


  token = this.authService.getToken();
  

  StartSim() {
    if (this.token) {
      console.log("Sim Started");
      this.http.get < any > ('https://localhost:7115/Sim/Start', {
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      });
    }
  }

  StopSim() {
    if (this.token) {
      console.log("Sim Stoped");
      this.http.get < any > ('https://localhost:7115/Sim/Stop', {
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      });
    }
  }


  getCoinAmount(): Observable<number> {
    const token = this.authService.getToken();
    if (token) {
      return this.http.get<number>('https://localhost:7115/User/CoinAmount', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).pipe(
        catchError(error => {
          console.error("Error fetching coin amount:", error);
          return of(0); 
        })
      );
    } else {
      return of(0); 
    }
  }


  CreateOrders(){
    const token = this.authService.getToken();
    if (token) {
      const url = `https://localhost:7115/Order/Create`;
      this.http.post < any > (url, {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        .subscribe(
          () => console.log("Orders Created"),
          error => {
            console.error("Error accepting order:", error);
          }
        );
    }
  }
}
