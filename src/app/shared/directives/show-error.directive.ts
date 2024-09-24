import {Directive, Input, ElementRef, Renderer2} from '@angular/core';
import {AbstractControl} from '@angular/forms';

@Directive({
  standalone: true,
  selector: '[appShowError]'
})
export class ShowErrorDirective {
  @Input('appShowError') control!: AbstractControl | null;
  @Input() errorKey!: string;
  @Input() errorMessage!: string;

  private readonly errorElement: HTMLElement;

  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.errorElement = this.renderer.createElement('div');
    this.renderer.addClass(this.errorElement, 'error-message');
  }

  ngOnInit() {
    if (this.control) {
      this.control.statusChanges.subscribe(() => this.updateView());
      this.updateView();
    }
  }

  private updateView() {
    if (this.control && this.control.invalid && this.control.hasError(this.errorKey)) {
      this.showErrorMessage();
      this.markParentElement();
    } else {
      this.hideErrorMessage();
      this.unmarkParentElement();
    }
  }

  private showErrorMessage() {
    this.errorElement.textContent = this.errorMessage;
    this.renderer.appendChild(this.el.nativeElement.parentNode, this.errorElement);
  }

  private hideErrorMessage() {
    if (this.el.nativeElement.parentNode.contains(this.errorElement)) {
      this.renderer.removeChild(this.el.nativeElement.parentNode, this.errorElement);
    }
  }

  private markParentElement() {
    this.renderer.addClass(this.el.nativeElement.parentNode, 'has-error');
  }

  private unmarkParentElement() {
    this.renderer.removeClass(this.el.nativeElement.parentNode, 'has-error');
  }
}
