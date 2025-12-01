import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {NavigationStart, Router} from '@angular/router';
import {Subject} from 'rxjs';
import {filter, takeUntil} from 'rxjs/operators';
import {Alert} from '@models/alert.model';
import {AlertService} from '@services/alert.service';

/* Simplificado de referencia a los tipos de alerta */
enum AlertType {
  Success = 0,
  Error = 1,
  Info = 2,
  Warning = 3,
}

@Component({
  selector: 'alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
})
export class AlertComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  @Input() public readonly id: string = 'default-alert';
  @Input() public readonly fade: boolean = true;
  @Input() public autoCloseTime = 6000;  // Tiempo en ms para auto cerrar

  public alerts: Alert[] = [];

  constructor(
    private readonly router: Router,
    private readonly alertService: AlertService
  ) {
  }

  ngOnInit() {
    this.subscribeToAlerts();
    this.subscribeToRouteChanges();
  }

  ngOnDestroy() {
    // Completar todos los observables para evitar fugas de memoria
    this.destroy$.next();
    this.destroy$.complete();
  }

  private subscribeToAlerts(): void {
    this.alertService
      .onAlert(this.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((alert) => {
        // Limpiar alertas cuando se recibe una alerta vacía
        if (!alert.message) {
          // Filtrar alertas sin 'keepAfterRouteChange'
          this.alerts = this.alerts.filter((x) => x.keepAfterRouteChange);

          // Quitar la bandera 'keepAfterRouteChange' en el resto
          for (const remainingAlert of this.alerts) {
            remainingAlert.keepAfterRouteChange = false;
          }
          return;
        }

        // Añadir alerta al array
        this.alerts.push(alert);

        // Auto cerrar alerta si es requerido
        if (alert.autoClose) {
          setTimeout(() => this.removeAlert(alert), this.autoCloseTime);
        }
      });
  }

  private subscribeToRouteChanges(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationStart),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.alertService.clear(this.id);
      });
  }

  public removeAlert(alert: Alert): void {
    if (!this.alerts.includes(alert)) {
      return;
    }

    if (this.fade) {
      // Marcar para desvanecer
      const alertToFade = this.alerts.find((x) => x === alert);
      if (alertToFade) {
        alertToFade.fade = true;
      }
      // Eliminar después del tiempo de desvanecimiento
      setTimeout(() => {
        this.alerts = this.alerts.filter((x) => x !== alert);
      }, 250);
    } else {
      // Eliminar directamente
      this.alerts = this.alerts.filter((x) => x !== alert);
    }
  }

  public close(alert: Alert): void {
    this.alerts = this.alerts.filter(x => x !== alert);
  }

  public cssClass(alert: Alert): string {
    if (!alert) {
      return '';
    }

    const alertTypeClasses: Record<AlertType, string> = {
      [AlertType.Success]: 'alert-success',
      [AlertType.Error]: 'alert-danger',
      [AlertType.Info]: 'alert-info',
      [AlertType.Warning]: 'alert-warning',
    };

    const typeClass = alertTypeClasses[alert.type as AlertType] || '';

    return `alert ${typeClass}`;
  }

  public cssIcon(alert: Alert): string {
    if (!alert) {
      return '';
    }

    const alertTypeIcons: Record<AlertType, string> = {
      [AlertType.Success]: '#check-circle-fill',
      [AlertType.Error]: '#exclamation-circle-fill',
      [AlertType.Info]: '#info-fill',
      [AlertType.Warning]: '#exclamation-triangle-fill',
    };

    return alertTypeIcons[alert.type as AlertType] || '';
  }
}
