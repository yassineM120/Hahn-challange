import {
  Component,
  ViewChild,
  inject
} from '@angular/core';
import {
  AuthService
} from '../service/auth.service';
import {
  HttpClient
} from '@angular/common/http';
import {
  MatTableDataSource,
  MatTableModule
} from '@angular/material/table';
import {
  MatPaginator,
  MatPaginatorModule
} from '@angular/material/paginator';
import {
  MatIconModule
} from '@angular/material/icon';
import {
  MatSidenavModule
} from '@angular/material/sidenav';
import {
  CommonModule
} from '@angular/common';
import {
  Order
} from '../interfaces/interfaces.models';
import {
  MatButtonModule
} from '@angular/material/button';
import { Subscription, interval, startWith, switchMap } from 'rxjs';


@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [MatTableModule, MatPaginatorModule, MatIconModule, MatSidenavModule, CommonModule, MatButtonModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})




export class OrdersComponent {


  httpClient = inject(HttpClient);

  @ViewChild('paginatorOrders', {
    static: true
  }) paginatorOrders!: MatPaginator;
  tabledataOrders = new MatTableDataSource < Order > ();
  orders: Order[] = [];

  displayedColumnsOrders: string[] = ['id', 'originNodeId', 'targetNodeId', 'load', 'value', 'deliveryDateUtc', 'expirationDateUtc', 'actions'];

  pageSize = 5;
  pageSizeOptions = [5, 10, 20];

  constructor(private http: HttpClient, private authService: AuthService) {}
  private dataRefreshSubscription: Subscription | undefined;

  ngOnInit() {
    this.getAllOrders();
    this.dataRefreshSubscription = interval(800)
      .pipe(
        startWith(0),
        switchMap(() => this.http.get<any>('https://localhost:7115/Order/GetAllAvailable', {
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

  getAllOrders() {
    const token = this.authService.getToken();
    if (token) {
      this.http.get < any > ('https://localhost:7115/Order/GetAllAvailable', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        .subscribe((orderData: Order[]) => {
            this.orders = orderData;
            this.tabledataOrders.data = this.orders;

            this.tabledataOrders.paginator = this.paginatorOrders;
          },
          error => {
            console.error("API error:", error);
          });
    }
  }



  acceptOrder(id: number) {
    const token = this.authService.getToken();
    if (token) {
      const url = `https://localhost:7115/Order/Accept?orderId=${id}`;
      this.http.post < any > (url, {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        .subscribe(
          () => console.log("Order accepted successfully: ", id),
          error => {
            console.error("Error accepting order:", error);
          }
        );
    }
  }


}
