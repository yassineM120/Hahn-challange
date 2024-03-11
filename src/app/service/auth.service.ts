import { Injectable } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { StorageService } from './storage.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private token: string | null = null;

  constructor(
    private storageService: StorageService,private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  setToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      this.token = token;
      this.storageService.setItem('HahnLoginToken', token); 
    }
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId) && !this.token) {
      this.token = this.storageService.getItem('HahnLoginToken'); 
    }
    return this.token;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }


  canActivate(route: any): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return true;
    }

    const isLoggedIn = this.isLoggedIn();
    console.log("token : "+isLoggedIn)
    if (!isLoggedIn) {
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }

  storeCargoId(cargoId: number) {
    if (isPlatformBrowser(this.platformId)) {
      this.storageService.setItem(`cargoId-${cargoId}`, cargoId.toString());
    }
  }
}
