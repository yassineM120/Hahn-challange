import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { CommonModule } from '@angular/common';
import { AuthService } from '../service/auth.service';
import { catchError } from 'rxjs/internal/operators/catchError';
import { throwError } from 'rxjs/internal/observable/throwError';
import { MatButtonModule } from '@angular/material/button';
import {
  CargoTransporter
} from '../interfaces/interfaces.models';
import { StorageService } from '../service/storage.service';


@Component({
  selector: 'app-cargo-transporter',
  standalone: true,
  imports: [MatTableModule, MatPaginatorModule, MatIconModule, MatSidenavModule, CommonModule, MatButtonModule],
  templateUrl: './cargo-transporter.component.html',
  styleUrls: ['./cargo-transporter.component.css']
})
export class CargoTransporterComponent implements OnInit {
  cargoTransporter: CargoTransporter | undefined;
  error: any | undefined;

  constructor(private http: HttpClient, private authService: AuthService, private storageService: StorageService) {}

  @ViewChild(MatPaginator, {static:true}) paginatorCargo!: MatPaginator;
  tabledataCargo = new MatTableDataSource<CargoTransporter>();

  displayedColumnscargo: string[] = ['id', 'positionNodeId', 'inTransit', 'capacity', 'load', 'loadedOrders'];

  pageSize = 5;
  pageSizeOptions = [5, 10, 20];

  ngOnInit() {
    this.getAllCargo();
  }

  getAllCargo() {
    const token = this.authService.getToken();

    if (token) {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
      });
      const cargoIds = this.storageService.getCargoIds();
      for(let i = 0;i < this.storageService.getCargoIds.length;i++){
        this.http.get<CargoTransporter>(`https://localhost:7115/CargoTransporter/Get?transporterId=${cargoIds[i]}`, { headers })
        .subscribe(
          (data) => {
            this.cargoTransporter = data; 
            this.tabledataCargo.data = [this.cargoTransporter];
            this.tabledataCargo.paginator = this.paginatorCargo;
          },
          (error) => {
            this.error = error; 
            console.error('Error fetching cargo transporter data:', error); 
          }
        );

      }
    }
  }
}