import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FarmCreateDto } from '../../dtos/farm'
import { Globals } from '../../global/globals';


@Injectable({
  providedIn: 'root',
})

export class FarmService {

  private farmsBaseUri: string;

  constructor(private httpClient: HttpClient, private globals: Globals) {
    this.farmsBaseUri = this.globals.backendUri + '/farms';
  }


  addNewFarm(farm : FarmCreateDto) {
    return this.httpClient.post(`${this.farmsBaseUri}`, farm);
  }
}
