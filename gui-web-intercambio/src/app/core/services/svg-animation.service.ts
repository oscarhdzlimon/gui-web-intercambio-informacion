import {Injectable, signal} from '@angular/core';

@Injectable({providedIn: 'root'})
export class SvgAnimationService {
  private readonly _isLoading = signal(false);
  private readonly _isInteractable = signal(false);

  public readonly isLoading = this._isLoading.asReadonly();
  public readonly isInteractable = this._isInteractable.asReadonly();

  show(): void {
    if (this._isLoading()) return;
    this._isLoading.set(true);
    this._isInteractable.set(true);
    this.hide();
  }

  hide(): void {
    setTimeout(() => {
      this._isLoading.set(false);
      this._isInteractable.set(false);
    }, 5000);
  }

}
