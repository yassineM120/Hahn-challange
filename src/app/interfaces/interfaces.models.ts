export interface Node {
    Id: number;
    Name: string;
  }
  
  export interface Edge {
    Id: number;
    Cost: number;
    Time: string; 
  }
  
  export interface Connection {
    Id: number;
    EdgeId: number;
    FirstNodeId: number;
    SecondNodeId: number;
  }
  
  export interface GridData {
    Nodes: Node[];
    Edges: Edge[];
    Connections: Connection[];
  }


  export interface CargoTransporter {
    id: number;
    positionNodeId: number;
    inTransit: boolean;
    capacity: number;
    load: number;
    loadedOrders: any[];
  }
  
  
  
  export interface loadOrder {
    id: number;
    originNodeId: number;
    targetNodeId: number;
    load: number;
    value: number;
    deliveryDateUtc: string;
    expirationDateUtc: string;
  }
  
  export interface Order {
    id: number;
    originNodeId: number;
    targetNodeId: number;
    load: number;
    value: number;
    deliveryDateUtc: string;
    expirationDateUtc: string;
  }
  
  export interface AcceptedOrders {
    id: number;
    originNodeId: number;
    targetNodeId: number;
    load: number;
    value: number;
    deliveryDateUtc: string;
    expirationDateUtc: string;
  }
  
  export interface IsPossibleOrder {
    originNodeId: number;
    targetNodeId: number;
    isPossible : boolean;
  }
