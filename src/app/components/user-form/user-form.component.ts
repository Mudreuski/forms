import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  EventEmitter,
  forwardRef,
  Input,
  OnInit,
  Output
} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {NgForOf} from '@angular/common';
import {AvailableCountries} from '../../shared/enum/country';
import {ShowErrorDirective} from '../../shared/directives/show-error.directive';
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-custom-input',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ShowErrorDirective,
    NgForOf
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UserFormComponent),
      multi: true
    }
  ]
})
export class UserFormComponent implements ControlValueAccessor, OnInit {
  @Input() formGroup!: FormGroup;
  @Output() onRemove = new EventEmitter<void>();

  protected countries = AvailableCountries;

  constructor(private cdr: ChangeDetectorRef, private destroyRef: DestroyRef) {}

  ngOnInit() {
    this.formGroup.statusChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.cdr.markForCheck();
      });
  }

  protected removeForm(): void {
    this.onRemove.emit();
  }

  public onChange: any = () => {};
  public onTouch: any = () => {};

  public writeValue(value: any): void {
    if (value) this.formGroup.setValue(value, { emitEvent: false });
  }

  public registerOnChange(fn: any): void {
    this.onChange = fn;
    this.formGroup.valueChanges.subscribe(fn);
  }

  public registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  public setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) this.formGroup.disable();
    else this.formGroup.enable();
  }
}
