import {ComponentRef, Directive, OnDestroy, OnInit} from '@angular/core';
import {NavigationStart, Router} from '@angular/router';
import {DialogService, DynamicDialogComponent, DynamicDialogRef} from 'primeng/dynamicdialog';
import {Subscription} from 'rxjs';

@Directive({
  standalone: true,
  selector: '[onCloseOnNavigation]'
})
export class OnCloseOnNavigationDirective implements OnInit, OnDestroy {
  private subscription!: Subscription;

  constructor(
    private router: Router,
    private dialogService: DialogService
  ) {
  }

  ngOnInit(): void {
    this.subscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        const dialogs: Map<DynamicDialogRef, ComponentRef<DynamicDialogComponent>> = this.dialogService.dialogComponentRefMap;
        dialogs.forEach((dialog: ComponentRef<DynamicDialogComponent>) => {
          dialog.destroy();
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
