import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../_models/user';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private userSubject: BehaviorSubject<User | null>;
    public user: Observable<User | null>;

    constructor() {
        this.userSubject = new BehaviorSubject<User | null>(null);
        this.user = this.userSubject.asObservable();
    }

    public get userValue() {
        return this.userSubject.value;
    }

    public isAdmin(): boolean {
        return this.userValue?.role === 'Admin';
    }
}