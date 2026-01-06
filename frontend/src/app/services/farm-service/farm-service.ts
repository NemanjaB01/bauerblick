import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { Farm } from '../../models/Farm';
import { HttpClient } from '@angular/common/http';
import {FarmCheckResponse, FarmCreateDto} from '../../dtos/farm';
import { tap } from 'rxjs/operators';
import { Globals } from '../../global/globals';
import { FieldUpdateDto } from '../../dtos/field';

@Injectable({
  providedIn: 'root',
})
export class FarmService {
  private farmsBaseUri: string;

  // Subject to store and share farm data across components
  private farmsSubject = new BehaviorSubject<Farm[]>([]);
  farms$ = this.farmsSubject.asObservable();  // Observable for subscribing components

  private selectedFarmSubject = new BehaviorSubject<Farm | null>(null);  // Subject to track the selected farm
  selectedFarm$ = this.selectedFarmSubject.asObservable();  // Observable for selected farm

  constructor(private httpClient: HttpClient, private globals: Globals) {
    this.farmsBaseUri = this.globals.backendUri + '/farms';
  }

  // Fetch farms from the backend
  loadFarms(): Observable<Farm[]> {
    return this.httpClient.get<Farm[]>(this.farmsBaseUri).pipe(
      tap((farms) => {
        this.farmsSubject.next(farms);  // Update farms list
        if (farms.length) {
          this.selectFarm(farms[0]);  // Select the first farm by default when farms are loaded
        }
      })
    );
  }

  // Set the selected farm and notify all subscribers
  selectFarm(farm: Farm) {
    this.selectedFarmSubject.next(farm);  // Update selected farm in the service
    console.log('Selected Farm:', farm);  // Log farm information each time it’s selected
  }

  getSelectedFarm(): Farm | null {
    return this.selectedFarmSubject.value;
  }

  // Add a new farm and update the list of farms
  addNewFarm(farm: FarmCreateDto): Observable<Farm> {
    farm.fields= [
        { id: 1, status: 'empty'},
        { id: 2, status: 'empty'},
        { id: 3, status: 'empty'},
        { id: 4, status: 'empty'},
        { id: 5, status: 'empty'},
        { id: 6, status: 'empty'}
    ];

    return this.httpClient.post<Farm>(this.farmsBaseUri, farm).pipe(
      tap((newFarm) => {
        const currentFarms = this.farmsSubject.value;
        this.farmsSubject.next([...currentFarms, newFarm]);  // Add the new farm to the farms list
      })
    );
  }

  updateField(field: FieldUpdateDto) {
    const selectedFarm = this.selectedFarmSubject.value;

    if (!selectedFarm) {
      return throwError(() => new Error('No farm selected'));
    }

    console.log("Updating field...", field);

    return this.httpClient.put(
      `${this.farmsBaseUri}/${selectedFarm.id}/fields`,
      field
    );
  }

  // Method to get farms in memory (direct access to BehaviorSubject)
  getFarmsInMemory(): Farm[] {
    return this.farmsSubject.value;  // Return the current value of farms from memory
  }

  clearSelectedFarm() {
    this.selectedFarmSubject.next(null);
  }

  checkHasFarms(): Observable<FarmCheckResponse> {
    return this.httpClient.get<FarmCheckResponse>(`${this.farmsBaseUri}/check`);
  }
}
