import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {filter} from 'rxjs/operators';

import {Alert, AlertType} from '@models/alert.model';

@Injectable({ providedIn: 'root' })
export class AlertService {
  private readonly subject = new Subject<Alert>();
  private readonly defaultId = 'default-alert';
  text = 'Ha ocurrido un error';

  // enable subscribing to alerts observable
  onAlert(id = this.defaultId): Observable<Alert> {
    return this.subject.asObservable().pipe(filter(x => x && x.id === id));
  }

  exito(message = this.text, title = '¡Éxito!') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.alert(new Alert({ type: AlertType.Success, message, title: title }));
  }

  exitoCargaArchivo() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.alert(new Alert({ type: AlertType.Success, message: 'Carga del archivo exitosa', title: '¡Éxito!' }));
  }

  error(message = this.text, title = '¡Error!') {
    message = message ?? this.text;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.alert(new Alert({ type: AlertType.Error,message, title: title  }));
  }

  alerta(message?: string) {
    message = message ?? this.text;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.alert(new Alert({ type: AlertType.Warning, message, title: '¡Alerta!' }));
  }

  informacion(message?: string) {
    message = message ?? this.text;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.alert(new Alert({ type: AlertType.Info, message, title: '¡Información!' }));
  }

  // main alert method
  alert(alert: Alert) {
    alert.id = alert.id || this.defaultId;
    this.subject.next(alert);
  }

  // clear alerts
  clear(id = this.defaultId) {
    this.subject.next(new Alert({ id }));
  }

}
