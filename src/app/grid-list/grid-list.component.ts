import {
  HttpClient
} from '@angular/common/http';
import {
  Component,
  OnInit,
  ViewChild,
  inject
} from '@angular/core';

import {
  Node,
  Edge,
  Connection,
  GridData
} from '../interfaces/interfaces.models';
import {
  AuthService
} from '../service/auth.service'; 
import {
  MatPaginator,
  MatPaginatorModule
} from '@angular/material/paginator';
import {
  MatTableDataSource,
  MatTableModule
} from '@angular/material/table';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-grid-list',
  standalone: true,
  templateUrl: './grid-list.component.html',
  styleUrls: ['./grid-list.component.css'],
  imports: [MatTableModule, MatPaginatorModule, MatIconModule, MatSidenavModule, CommonModule]
})
export class GridListComponent implements OnInit {

  @ViewChild('paginatorNodes',{static:true}) paginatorNodes!: MatPaginator;
  @ViewChild('paginatorEdges',{static:true}) paginatorEdges!: MatPaginator;
  @ViewChild('paginatorConnections',{static:true}) paginatorConnections!: MatPaginator;


  tabledataNodes = new MatTableDataSource < Node > ();
  tabledataEdges = new MatTableDataSource < Edge > ();
  tabledataConnections = new MatTableDataSource < Connection > ();

  httpClient = inject(HttpClient);
  nodes: Node[] = [];
  edges: Edge[] = [];
  connections: Connection[] = [];
  errorHandlingService: any;
  errorNotificationService: any;

  displayedColumnsNodes: string[] = ['Id', 'Name'];
  displayedColumnsEdges: string[] = ['Id', 'Cost', 'Time'];
  displayedColumnsConnection: string[] = ['Id', 'EdgeId', 'FirstNodeId', 'SecondNodeId'];

  pageSize = 5;
  pageSizeOptions = [5, 10, 20];

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit() {
    this.getAllGrid(); 
  }

  

  getAllGrid() {
    const token =  this.authService.getToken();
    if (token) {
      this.http.get < any > ('https://localhost:7115/Grid/Get', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .subscribe((gridData: GridData) => {
        this.nodes = gridData.Nodes;
        this.edges = gridData.Edges;
        this.connections = gridData.Connections;
      
        this.tabledataNodes.data = this.nodes;
        this.tabledataEdges.data = this.edges;
        this.tabledataConnections.data = this.connections;

        this.tabledataNodes.paginator = this.paginatorNodes;
        this.tabledataEdges.paginator = this.paginatorEdges;
        this.tabledataConnections.paginator = this.paginatorConnections;

          console.log(gridData);
        },
        error => {
          console.error("API error:", error);
          this.errorHandlingService.reportError(error);
          this.errorNotificationService.displayError("Failed to retrieve grid data. Please try again later.");
        });
    }
  }

  CreateFile(){
    const token = this.authService.getToken();
    if (token) {
      const url = `https://localhost:7115/Grid/GenerateFile?numberOfNodes=300&numberOfEdges=30&numberOfConnectionsPerNode=3&filename=""`;
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
