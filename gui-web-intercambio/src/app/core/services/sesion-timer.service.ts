// session-timer.service.ts

import { Injectable, OnDestroy } from '@angular/core';
import { ConfirmationService, Confirmation } from 'primeng/api'; // <--- Importar
import { Router } from '@angular/router';
import { BehaviorSubject, interval, Subscription } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class SessionTimerService implements OnDestroy {

  constructor(
    private router: Router,
    private confirmationService: ConfirmationService,
    private authService: AuthService
  ) {

          // Inicia el temporizador automáticamente al cargar la aplicación
      // si existe una sesión activa (verificación de 'access_token').
      if (localStorage.getItem('access_token')) {
          this.startTimer();
      }
  }





  // Constantes de tiempo
  private readonly SESSION_DURATION_MS = 20 * 60 * 1000; // 20 minutos
  private readonly WARNING_TIME_MS = 60 * 1000;         // 1 minuto (60 segundos)

  // Suscripciones
  private timerSubscription: Subscription | undefined;
  private countdownSubscription: Subscription | undefined;

  // Sujetos para notificar al componente de la UI (usando BehaviorSubject para tener un valor inicial)
  public isDialogVisible$ = new BehaviorSubject<boolean>(false);
  public secondsLeft$ = new BehaviorSubject<number>(0);



  /**
   * 1. Inicia/Reinicia el temporizador de la sesión.
   * Calcula el tiempo restante basándose en el 'login_time' almacenado.
   */
  public startTimer(): void {
    this.stopTimer();

    const loginTimeStr = localStorage.getItem('login_time');
    const token = localStorage.getItem('access_token');

    if (!loginTimeStr || !token) {
        this.logout();
        return;
    }

    const loginTime = parseInt(loginTimeStr, 10);
    const timeElapsed = Date.now() - loginTime;
    const timeRemaining = this.SESSION_DURATION_MS - timeElapsed;

    // Si ya expiró
    if (timeRemaining <= 0) {
        this.logout();
        return;
    }

    // Configura el temporizador con el tiempo restante calculado
    this.setExpirationTimer(timeRemaining);
  }

  /**
   * 2. Configura el temporizador para la expiración o la advertencia.
   */
  private setExpirationTimer(totalTimeRemaining: number): void {

    // Si queda menos de 1 minuto, muestra la advertencia inmediatamente
    if (totalTimeRemaining <= this.WARNING_TIME_MS) {
        this.showTimeoutWarning(totalTimeRemaining / 1000);
    } else {
        // Configura el temporizador para que se dispare cuando solo quede 1 minuto
        const timeUntilWarning = totalTimeRemaining - this.WARNING_TIME_MS;

        this.timerSubscription = interval(timeUntilWarning)
            .pipe(take(1))
            .subscribe(() => {
                this.showTimeoutWarning(this.WARNING_TIME_MS / 1000);
            });
    }
  }

  /**
   * 3. Muestra el diálogo de advertencia e inicia la cuenta regresiva.
   */
  private showTimeoutWarning(initialSeconds: number): void {
    this.secondsLeft$.next(Math.ceil(initialSeconds));
    this.isDialogVisible$.next(true); // Mostrar el modal

    let seconds = Math.ceil(initialSeconds);

    this.countdownSubscription = interval(1000)
      .pipe(
        take(seconds + 1), // Tarda N+1 segundos
        tap(() => {
          seconds--;
          if (seconds >= 0) {
            this.secondsLeft$.next(seconds);
          }
        })
      )
      .subscribe({
        complete: () => {
          // El contador llegó a cero y el usuario no hizo clic en "Continuar"
          this.logout();
        }
      });


  // **Usa el ConfirmationService para mostrar el modal**
    const confirmation = {
      message: '¿Estimado aspirante, su sesión está a punto de expirar. ¿Desea continuar con su sesión?',
      icon: 'pi pi-exclamation-circle',
      acceptButtonProps: {
        label: 'Sí',
      },
      rejectButtonProps: {
        label: 'No',
        severity: 'danger'
      },
      accept: () => this.extendSession(),
      reject: () => {}
    };

    this.confirmationService.confirm(confirmation);
  }

  /**
   * 4. Extiende la sesión (al hacer clic en "Continuar").
   */
  public extendSession(): void {
    // 1. Detiene la cuenta regresiva del modal
    this.stopCountdown();

    // 2. Actualiza el 'login_time' a la hora actual para simular la extensión de sesión
    const newLoginTime = Date.now();
    localStorage.setItem('login_time', newLoginTime.toString());

    // 3. Oculta el diálogo
    this.isDialogVisible$.next(false);

    // 4. Reinicia el temporizador principal (que ahora usará el nuevo 'login_time')
    this.startTimer();
  }

  /**
   * 5. Cierre de sesión y limpieza.
   */
  public logout(): void {
    this.stopTimer();
    // Limpia las credenciales del cliente
    localStorage.removeItem('auth_token');
    localStorage.removeItem('login_time');

    // Oculta el diálogo si estaba visible
    this.isDialogVisible$.next(false);
    this.confirmationService.close();
    this.authService.cerrarSesion();
    console.log('Sesión finalizada por expiración o logout manual.');
  }

  /**
   * 6. Detiene todos los temporizadores.
   */
  public stopTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = undefined;
    }
    this.stopCountdown();
  }

  private stopCountdown(): void {
      if (this.countdownSubscription) {
          this.countdownSubscription.unsubscribe();
          this.countdownSubscription = undefined;
      }
  }



  ngOnDestroy(): void {
    this.stopTimer();
  }
}
