import {Component, EventEmitter, HostListener, input, Input, InputSignal, OnInit, Output} from '@angular/core';
import {NgClass} from '@angular/common';
import {StepItemInterno} from '@models/step-item.interface';

@Component({
  selector: 'steps',
  imports: [
    NgClass
  ],
  templateUrl: './steps.component.html',
  styleUrl: './steps.component.scss'
})
export class StepsComponent implements OnInit {
  @Input() steps: StepItemInterno[] = [];

  currentStepIndex: InputSignal<number> = input(1);

  @Output() stepClick = new EventEmitter<number>();

  private readonly MOBILE_BREAKPOINT = 768;

  isMobileView: boolean = false;

  constructor() {
    this.checkScreenSize();
  }

  ngOnInit() {
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    this.isMobileView = window.innerWidth < this.MOBILE_BREAKPOINT;
  }

  handleStepClick(index: number): void {
    this.stepClick.emit(index);
  }

  getStepClass(index: number): string {
    if (index === this.currentStepIndex()) {
      return 'stepper-step-active';
    } else if (index < this.currentStepIndex()) {
      return 'stepper-step-done';
    } else {
      return 'stepper-step-pending';
    }
  }
}
