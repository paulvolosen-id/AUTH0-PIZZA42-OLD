import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { map } from 'rxjs/operators';

interface IApiResponse {
  message: string;
}

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {

  API_URL = 'http://localhost:3010/api';
  message: string;

  constructor(public auth: AuthService, private http: HttpClient) {}

  ngOnInit() {
  }

  public browse(): void {
    this.message = '';
    this.http.get(`${this.API_URL}/public`)
      .subscribe(
        data => this.message = (data as IApiResponse).message,
        error => this.message = error
      );
  }

  public secureOrder(): void {
    this.message = '';
    this.http.get(`${this.API_URL}/private`, {
      headers: new HttpHeaders()
        .set('Authorization', `Bearer ${localStorage.getItem('access_token')}`)
    })
      .subscribe(
        data => this.message = (data as IApiResponse).message,
        error => this.message = error
      );
  }
}
