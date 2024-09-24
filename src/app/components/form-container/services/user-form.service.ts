import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {CheckUserResponseData, SubmitFormResponseData} from '../../../shared/interface/responses';
import {User} from '../parsers/users-form.parser';

@Injectable({ providedIn: 'root' })
export class UserFormService {
  constructor(private http: HttpClient) {}

  public checkUsername(username: string): Observable<CheckUserResponseData> {
    return this.http.post<CheckUserResponseData>('/api/checkUsername', { username });
  }

  public submitForm(data: Array<User>): Observable<SubmitFormResponseData> {
    return this.http.post<SubmitFormResponseData>('/api/submitForm', data);
  }
}
