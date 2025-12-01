import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {SvgAnimationService} from '@services/svg-animation.service';

@Component({
  selector: 'svg-animation',
  imports: [],
  templateUrl: './svg-animation.component.html',
  styleUrl: './svg-animation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SvgAnimationComponent {
  public loader: SvgAnimationService = inject(SvgAnimationService);

}
