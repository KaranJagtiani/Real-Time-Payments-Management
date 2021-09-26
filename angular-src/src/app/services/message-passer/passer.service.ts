import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class DataService {

  private messageSource = new BehaviorSubject('');
  currentMessage = this.messageSource.asObservable();

  constructor() { }

  changeMessage(classSelected: any) {
    this.messageSource.next(classSelected);
  }

}