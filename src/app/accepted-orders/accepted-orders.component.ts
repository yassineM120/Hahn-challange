import { Component, ViewChild, inject } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { HttpClient } from '@angular/common/http';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { CommonModule } from '@angular/common';
import { Order } from '../interfaces/interfaces.models';
import { Subscription, interval, startWith, switchMap } from 'rxjs';



@Component({
  selector: 'app-accepted-orders',
  standalone: true,
  imports: [MatTableModule, MatPaginatorModule, MatIconModule, MatSidenavModule, CommonModule],
  templateUrl: './accepted-orders.component.html',
  styleUrls: ['./accepted-orders.component.css']
})
export class AcceptedOrdersComponent {
  httpClient = inject(HttpClient);

  @ViewChild('paginatorOrders', { static: true }) paginatorOrders!: MatPaginator;
  tabledataOrders = new MatTableDataSource<Order>();
  orders: Order[] = [];


  displayedColumnsOrders: string[] = ['id', 'originNodeId', 'targetNodeId', 'load', 'value', 'deliveryDateUtc', 'expirationDateUtc'];

  pageSize = 5;
  pageSizeOptions = [5, 10, 20];

  constructor(private http: HttpClient, private authService: AuthService) {}

  private dataRefreshSubscription: Subscription | undefined;

  ngOnInit() {
    this.getAllAcceptedOrders();
    this.dataRefreshSubscription = interval(800)
      .pipe(
        startWith(0),
        switchMap(() => this.http.get<any>('https://localhost:7115/Order/GetAllAccepted', {
          headers: {
            Authorization: `Bearer ${this.authService.getToken()}`
          }
        }))
      )
      .subscribe(
        (orderData: Order[]) => {
          this.orders = orderData;
          this.tabledataOrders.data = this.orders;
          this.tabledataOrders.paginator = this.paginatorOrders;
        },
        error => {
          console.error("API error:", error);
        }
      );
  }

  getAllAcceptedOrders() {
    const token = this.authService.getToken();
    if (token) {
      this.http.get<Order[]>('https://localhost:7115/Order/GetAllAccepted', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .subscribe(orderData => {
        this.orders = orderData;
        this.tabledataOrders.data = this.orders;
        this.tabledataOrders.paginator = this.paginatorOrders;
      },
      error => {
        console.error("API error:", error);  
      });
    }
  }
}
