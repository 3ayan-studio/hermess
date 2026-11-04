import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-svg-icon',
  standalone: true,
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      [attr.fill]="fill()"
      [attr.stroke]="stroke()"
      [attr.stroke-width]="strokeWidth()"
      aria-hidden="true"
      role="presentation"
      focusable="false"
      class="inline-block transition-colors"
      [class]="customClass()"
    >
      <use [attr.href]="'assets/icons/hermes-symbols.svg#' + name()"></use>
    </svg>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SvgIconComponent {
  readonly name = input.required<string>();
  readonly size = input<string>('16px');
  readonly fill = input<string>('none');
  readonly stroke = input<string>('currentColor');
  readonly strokeWidth = input<string>();
  readonly customClass = input<string>('');
}
