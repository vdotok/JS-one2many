import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { StorageService } from '../services/storage.service';

@Injectable()
export class AuthService {

  constructor(private http: HttpClient) { }

  login(data): Observable<any> {
    return this.http.post('Login', data);
  }

  signup(data): Observable<any> {
    return this.http.post('SignUp', data);
  }

  logout(): void {
    StorageService.clearLocalStorge();
  }

  getToken(): string {
    return StorageService.getAuthToken()
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  islogin(): boolean {
    return !!this.getToken();
  }

}
