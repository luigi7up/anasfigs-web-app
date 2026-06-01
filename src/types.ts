export interface FigLocation {
  id: string;
  lat: number;
  lng: number;
  name: string;
  note: string;
  addedBy: string;
  createdAt: string;
}

export interface User {
  name: string;
  joinedAt: string;
}
