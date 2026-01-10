import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { Farm } from '../../models/Farm';
import { HttpClient } from '@angular/common/http';
import { FarmCheckResponse, FarmCreateDto } from '../../dtos/farm';
import { tap } from 'rxjs/operators';
import { Globals } from '../../global/globals';
import { FieldStatus } from '../../models/FieldStatus';
import { FieldDetailsDto } from '../../dtos/field';

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

  // Set the selected farm and notify all subscribers
  selectFarm(farm: Farm) {
    this.selectedFarmSubject.next(farm);  // Update selected farm in the service
    console.log('Selected Farm:', farm);  // Log farm information each time it’s selected
  }

  getSelectedFarm(): Farm | null {
    return this.selectedFarmSubject.value;
  }

  clearSelectedFarm() { //TODO: Maybe delete this (it is not used)
    this.selectedFarmSubject.next(null);
  }

  // Method to get farms in memory (direct access to BehaviorSubject)
  getFarmsInMemory(): Farm[] {
    return this.farmsSubject.value;  // Return the current value of farms from memory
  }

  // Add a new farm and update the list of farms
  addNewFarm(farm: FarmCreateDto): Observable<Farm> {
    farm.fields= [
        { id: 1, status: FieldStatus.empty },
        { id: 2, status: FieldStatus.empty },
        { id: 3, status: FieldStatus.empty },
        { id: 4, status: FieldStatus.empty },
        { id: 5, status: FieldStatus.empty },
        { id: 6, status: FieldStatus.empty }
    ];

    return this.httpClient.post<Farm>(this.farmsBaseUri, farm).pipe(
      tap((newFarm) => {
        const currentFarms = this.farmsSubject.value;
        this.farmsSubject.next([...currentFarms, newFarm]);  // Add the new farm to the farms list
        this.selectFarm(newFarm);
      })
    );
  }

  // Fetch farms from the backend
  loadFarms(): Observable<Farm[]> {
    return this.httpClient.get<Farm[]>(this.farmsBaseUri).pipe(
      tap((farms) => {
        this.farmsSubject.next(farms);  // Update farms list
        if (farms.length && !this.selectedFarmSubject.value) {
          this.selectFarm(farms[0]);  // Select the first farm by default when farms are loaded
        }
      })
    );
  }

  checkHasFarms(): Observable<FarmCheckResponse> {
    return this.httpClient.get<FarmCheckResponse>(`${this.farmsBaseUri}/check`);
  }

  // Update the selected field in the backend
  updateField(field: FieldDetailsDto): Observable<Farm> {
    const selectedFarm = this.selectedFarmSubject.value;

    if (!selectedFarm) {
      return throwError(() => new Error('No farm selected'));
    }

    return this.httpClient.put<Farm>(
      `${this.farmsBaseUri}/${selectedFarm.id}/fields`,
      field
    ).pipe(
      tap(updatedFarm => {
        // Update selected farm
        this.selectedFarmSubject.next(updatedFarm);

        // Update farms list
        const farms = this.farmsSubject.value.map(f =>
          f.id === updatedFarm.id ? updatedFarm : f
        );
        this.farmsSubject.next(farms);
      })
    );
  }

  //TODO: Add delete farm?
}
