import {
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';
import {
  interval,
  Observable,
  of ,
  Subscription
} from 'rxjs';
import {
  catchError,
  takeWhile,
  tap
} from 'rxjs/operators';
import {
  CommonModule
} from '@angular/common';
import {
  AuthService
} from '../service/auth.service';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';
import {
  StorageService
} from '../service/storage.service';
import {
  AcceptedOrders,
  CargoTransporter,
  Connection,
  Edge,
  GridData,
  IsPossibleOrder,
  Order
} from '../interfaces/interfaces.models';
import {
  OrdersComponent
} from '../orders/orders.component';
import {
  AcceptedOrdersComponent
} from '../accepted-orders/accepted-orders.component';
import {
  MatIconModule
} from '@angular/material/icon';

@Component({
  selector: 'app-startsim',
  standalone: true,
  imports: [CommonModule, OrdersComponent, AcceptedOrdersComponent, MatIconModule],
  templateUrl: './startsim.component.html',
  styleUrl: './startsim.component.css'
})


export class StartSimComponent implements OnInit {

  constructor(private http: HttpClient, private authService: AuthService, private storageService: StorageService) {}

  private intervalSubscription!: Subscription;
  private isRunning = false;
  coins = 0;
  private token = this.authService.getToken();
  orders: Order[] = [];
  cargotransporter: CargoTransporter[] = [];
  acceptedOrdersdata: AcceptedOrders[] = [];
  ispossibleorder: IsPossibleOrder[] = [];
  error: any;
  nodes: Node[] = [];
  edges: Edge[] = [];
  connections: Connection[] = [];
  cargoes: number[] = [];

  ngOnInit() {
    this.buyCargo();
    let retryCount = 0;
    const retry = async () => {
      try {
        await this.updatecargo();
        await this.updateCoin();
        await this.updateOrder();
        await this.updateAcceptedOrders();
        await this.updateGrid();
      } catch (error) {
        retryCount++;
        const backoffDelay = Math.min(2 ** retryCount * 1000, 60000);
        console.error('Error fetching data, retrying in', backoffDelay, 'ms');
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
      return retryCount < 2;
    };

    (async () => {
      const shouldContinue = await retry();
      if (shouldContinue) {
        setTimeout(retry, 2000);
      }
    })();
  }

  private async updateCoin() {
    this.getCoinAmount().subscribe(
      coin => {
        this.coins = coin;
      },
      error => {
        console.error('Error fetching coin amount:', error);
        this.coins = 0;
      }
    );
  }

  private async updatecargo() {
    const cargoIds = this.storageService.getCargoIds();

    for (let i = 0; i < cargoIds.length; i++) {
      const cargoId = cargoIds[i];

      await this.http.get < CargoTransporter > (`https://localhost:7115/CargoTransporter/Get?transporterId=${cargoId}`, {
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      }).subscribe(
        (responseData) => {
          if (responseData && typeof responseData === 'object') {
            const cargoes = responseData as CargoTransporter;
            const existingCargoIndex = this.cargotransporter.findIndex(c => c.id === cargoes.id);
            if (existingCargoIndex === -1) {
              this.cargotransporter.push(cargoes);
            }
          } else {
            console.error("Unexpected response format for cargo transporter:", responseData);
          }
        },
        (error) => {
          console.error("Error fetching cargo transporter:", error);
        }
      );
    }
  }

  private async updateGrid() {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });

    this.http.get < GridData > ('https://localhost:7115/Grid/Get', {
        headers
      })
      .subscribe(
        (responseData) => {
          if (responseData && typeof responseData === 'object') {
            const gridData = responseData as GridData;
            this.connections = gridData.Connections;
          } else {
            console.error("Unexpected response format for grid data:", responseData);
          }
        }
      );
  }


  private async updateAcceptedOrders() {
    await this.http.get < any > (`https://localhost:7115/Order/GetAllAccepted`, {
      headers: {
        Authorization: `Bearer ${this.token}`
      }
    }).subscribe(
      (responseData) => {
        if (Array.isArray(responseData)) {
          responseData.forEach((accorder: AcceptedOrders) => {
            const existingOrderIndex = this.acceptedOrdersdata.findIndex(o => o.id === accorder.id);
            if (existingOrderIndex === -1) {
              this.acceptedOrdersdata.push(accorder);
            }
          });
        } else {
          console.error("Unexpected response format for accepted orders data");
        }
      },
      (error) => {
        console.error("Error fetching accepted orders:", error);
      }
    );
  }

  private async updateOrder() {
    for (let i = 0; i < this.cargoes.length; i++) {
      await this.http.get < Order > (`https://localhost:7115/Order/GetAllAvailable`, {
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      }).subscribe(
        (responseData) => {
          if (responseData && Array.isArray(responseData)) {
            responseData.forEach((order: Order) => {
              const existingOrderIndex = this.orders.findIndex(o => o.id === order.id);
              if (existingOrderIndex === -1) {
                this.orders.push(order);
              }
            });
          } else {
            console.error("Unexpected response format for orders:", responseData);
          }
        },
        (error) => {
          console.error("Error fetching orders:", error);
        }
      );
    }
  }


  private getCoinAmount(): Observable < number > {
    const token = this.authService.getToken();
    if (token) {
      return this.http.get < number > ('https://localhost:7115/User/CoinAmount', {
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

  startSim() {
    if (!this.isRunning) {
      this.isRunning = true;
      console.log("Sim Starts in 5 seconds!");
      this.intervalSubscription = interval(5000) 
        .pipe(
          takeWhile(() => this.isRunning),
          tap(() => {
            this.runSimulationCycle()
              .catch(error => this.handleError(error)); 
          })
        )
        .subscribe();
    }
  }

  stopSim() {
    if (this.isRunning) {
      this.isRunning = false;
      this.intervalSubscription.unsubscribe();
      console.log("Sim Stopped");
    }
  }

  private handleError(error: any) {
    console.error('An error occurred:', error);
  }

  ngOnDestroy() {
    this.stopSim(); 
  }


  private async runSimulationCycle() {

    console.log("Starting simulation cycle...");
    try {
      if (this.cargoes.length > 0) {
        if(this.coins > 2000){
          await this.buyCargo();
        }      
        await this.updateAcceptedOrders();
        await this.updateOrder();
        for (let i = 0; i < this.cargoes.length; i++) {
          console.log(`Processing cargo ${i + 1} out of ${this.cargoes.length}...`);

          if (this.acceptedOrdersdata.length > i) {
            console.log(`Cargo ${i + 1} has accepted orders.`);
            console.log(`data send to route cargotransporter: ${this.cargotransporter[0].positionNodeId} 
           ...acceptedOrdersdata origin Node :${this.acceptedOrdersdata[i].originNodeId} `)

            const routeToOrder = await this.findRoute(this.cargotransporter[i].positionNodeId, this.acceptedOrdersdata[i].originNodeId, new Set());

            if (routeToOrder) {
              console.log(`Found route for cargo ${i + 1} to the origin of accepted order.`);
              const OriginNodeIds = routeToOrder.map(targetNode => targetNode.nodeId);
              console.log("routes to Order", OriginNodeIds)
              await this.moveCargo(this.cargoes[i], OriginNodeIds);
            } else {
              console.log("No Route found for the current Cargo Transporter to Order!");
              this.ispossibleorder.push({
                originNodeId: this.cargotransporter[i].positionNodeId,
                targetNodeId: this.acceptedOrdersdata[i].originNodeId,
                isPossible: false
              });
              console.log(`the route from cargo position : ${this.cargotransporter[i].positionNodeId} , to Order possition : ${this.acceptedOrdersdata[i].originNodeId}...
            is not possinle`)
            }

            const routeToOrderTarget = await this.findRoute(this.acceptedOrdersdata[i].originNodeId, this.acceptedOrdersdata[i].targetNodeId, new Set());

            if (routeToOrderTarget) {
              console.log(`Found route for cargo ${i + 1} to the target of accepted order.`);
              const targetNodeIds = routeToOrderTarget.map(targetNode => targetNode.nodeId);
              await this.moveCargo(this.cargoes[i], targetNodeIds);
            } else {
              console.log("No Route found for the current Cargo Transporter to Order!");
              this.ispossibleorder.push({
                originNodeId: this.acceptedOrdersdata[i].originNodeId,
                targetNodeId: this.acceptedOrdersdata[i].targetNodeId,
                isPossible: false
              });
            }
          } else {
            console.log(`Cargo ${i + 1} has no accepted orders.`);
            const numOrdersToAccept = Math.min(this.orders.length, this.cargoes.length - this.acceptedOrdersdata.length);

            if (numOrdersToAccept > 0) {
              console.log(`Accepting orders for cargo ${i + 1}...`);
              await this.orderAccepted(this.orders[i].id);
              await this.updatecargo();
              await this.updateAcceptedOrders();
              await this.updateOrder();
              const routeToOrder = await this.findRoute(this.cargotransporter[i].positionNodeId, this.acceptedOrdersdata[i].originNodeId, new Set());

              if (routeToOrder) {
                console.log(`Found route for cargo ${i + 1} to the origin of available order.`);
                const OriginNodeIds = routeToOrder.map(targetNode => targetNode.nodeId);
                await this.moveCargo(this.cargoes[i], OriginNodeIds);
              } else {
                console.log("No Route found for the current Cargo Transporter to Order!");
                this.ispossibleorder.push({
                  originNodeId: this.cargotransporter[i].positionNodeId,
                  targetNodeId: this.acceptedOrdersdata[i].originNodeId,
                  isPossible: false
                });
              }
            }
          }
        }  
      console.log("Simulation cycle completed.");
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  buyCargo() {
    if (this.token) {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      });
      if (this.coins > 2000 || this.cargoes.length === 0) {
        this.http.post < number > (
            'https://localhost:7115/CargoTransporter/Buy?positionNodeId=10', {}, {
              headers
            }
          )
          .subscribe(
            (cargoId: number) => {
              if (cargoId != -1) {
                this.authService.storeCargoId(cargoId);
                this.cargoes.push(cargoId);
                console.log(`Cargo with ID ${cargoId} purchased!`);
              }
            },
            (error) => {
              console.error('Error buying cargo:', error);
            }
          );
      } else if (this.storageService.getCargoIds.length === 0) {
        this.http.post < number > (
            'https://localhost:7115/CargoTransporter/Buy?positionNodeId=10', {}, {
              headers
            }
          )
          .subscribe(
            (cargoId: number) => {
              if (cargoId != -1) {
                this.authService.storeCargoId(cargoId);
                console.log(` Starter Cargo with ID ${cargoId}!`);
                this.updatecargo();
              }
            },
            (error) => {
              console.error('Error buying cargo:', error);
            }
          );
      }
    }
  }


  private async orderAccepted(orderId: number) {
    console.log("in acceptOrder()");
    if (this.token) {
      const url = `https://localhost:7115/Order/Accept?orderId=${orderId}`;
      this.http.post < any > (url, {}, {
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      }).subscribe(
        (response) => {
          console.log(`Order accepted`);
        },
        (error) => {
          console.error('Error accepting Order:', error);
        }
      );
    }
  }



  findRoute(currentNodeId: number, targetNodeId: number, visitedNodes: Set < number > = new Set(), currentPath: {
    nodeId: number;distance: number
  } [] = [], depth: number = 0): {
    nodeId: number;distance: number
  } [] | null {
    visitedNodes.add(currentNodeId);

    
    if (depth > 100) { 
      return null;
    }

    for (const connection of this.connections) {
      if (connection.FirstNodeId === currentNodeId && !visitedNodes.has(connection.SecondNodeId)) {
        const {
          SecondNodeId
        } = connection;
        const distance = currentPath.length + 1;

        if (SecondNodeId === targetNodeId) {
         
          return [...currentPath, {
            nodeId: SecondNodeId,
            distance
          }];
        }

        visitedNodes.add(SecondNodeId);
        
        const result = this.findRoute(SecondNodeId, targetNodeId, visitedNodes, [...currentPath, {
          nodeId: SecondNodeId,
          distance
        }], depth + 1);
        if (result) {
          return result;
        }
      }
    }

    
    return null;
  }



  async moveCargo(transporterId: number, targetNodeId: number[]) {
    for (const nodeId of targetNodeId) {
      try {
        const url = `https://localhost:7115/CargoTransporter/Move?transporterId=${transporterId}&targetNodeId=${nodeId}`;
        await this.http.put < any > (url, {}, {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        }).toPromise();
        console.log(`Cargo transporter ${transporterId} moved to node ${nodeId}`);
      } catch (error) {
        console.error('Error moving cargo transporter:', error);
      }
    }
  }

}
