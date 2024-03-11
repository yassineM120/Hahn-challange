import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { GridListComponent } from './grid-list/grid-list.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthService  } from './service/auth.service';
import { NgModule } from '@angular/core';
import { OrdersComponent } from './orders/orders.component';
import { AcceptedOrdersComponent } from './accepted-orders/accepted-orders.component';
import { CargoTransporterComponent } from './cargo-transporter/cargo-transporter.component';
import { StartSimComponent } from './startsim/startsim.component';


export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'debug', component: DashboardComponent,canActivate: [AuthService ]},
  { path: 'grid/get', component: GridListComponent,canActivate: [AuthService ]},
  { path: 'order/all', component: OrdersComponent,canActivate: [AuthService ]},
  { path: 'order/accepted/all', component: AcceptedOrdersComponent,canActivate: [AuthService ]},
  { path: 'get/cargoTransporter', component: CargoTransporterComponent,canActivate: [AuthService ]},
  { path: 'dashboard', component: StartSimComponent,canActivate: [AuthService ]}
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthService]
})

export class AppRoutingModule { }
