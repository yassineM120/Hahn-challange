import { Injectable } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  setItem(key: string, value: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(key, value);
    } else {
      console.warn('localStorage is not available on this platform.');
      localStorage?.setItem(key, value);
    }
  }

  getItem(key: string): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(key);
    } else {
      console.warn('localStorage is not available on this platform.');
      return localStorage?.getItem(key); 
    }
  }

  removeItem(key: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(key);
    } else {
    }
  }

  getCargoIds(): number[] {
    if (isPlatformBrowser(this.platformId)) {
      const keys = Object.keys(localStorage);
      const cargoIds: number[] = [];
      for (const key of keys) {
        if (key.startsWith('cargoId-')) {
          const cargoIdString = localStorage.getItem(key);
          if (cargoIdString) {
            cargoIds.push(parseInt(cargoIdString, 10));
          }
        }
      }
      return cargoIds;
    }
    return [];
  }
}
