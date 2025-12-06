import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Farm } from '../../models/Farm';
import { Globals } from '../../global/globals';


@Injectable({
  providedIn: 'root',
})

export class FarmService {

  private signUpBaseUri: string;

  constructor(private httpClient: HttpClient, private globals: Globals) {
    this.signUpBaseUri = this.globals.backendUri + '/farms';
  }


  addNewFarm(farm : Farm) {
    return this.httpClient.post(`${this.signUpBaseUri}/create`, farm);
  }

}
