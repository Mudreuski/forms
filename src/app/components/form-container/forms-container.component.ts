import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {AsyncPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {BehaviorSubject, Observable, take} from 'rxjs';
import {birthdayValidator, countryValidator, usernameValidator} from '../../shared/validators/user-form.validator';
import {UserFormComponent} from '../user-form/user-form.component';
import {UserFormService} from './services/user-form.service';
import {parseFromModelToDto, Users} from './parsers/users-form.parser';

interface UserFormGroup {
  country: FormControl<string | null>;
  username: FormControl<string | null>;
  birthday: FormControl<string | null>;
}

interface FormItem {
  group: FormGroup<UserFormGroup>;
}

interface UsersFormModel {
  items: FormArray<FormGroup<FormItem>>;
}

@Component({
  standalone: true,
  selector: 'app-forms-container',
  templateUrl: './forms-container.component.html',
  styleUrls: ['./forms-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    UserFormComponent,
    FormsModule,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    AsyncPipe,
    NgClass
  ],
})
export class FormsContainerComponent {
  protected form: FormGroup<UsersFormModel>;

  protected isSubmitting = false;
  protected timer = 0;
  private timerInterval: any;

  private invalidGroupsCountSubject = new BehaviorSubject<number>(0);
  protected invalidGroupsCount$: Observable<number> = this.invalidGroupsCountSubject.asObservable();

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private userFormService: UserFormService,
    private destroyRef: DestroyRef
  ) {
    this.form = this.fb.group<UsersFormModel>({
      items: this.fb.array<FormGroup<FormItem>>([]),
    });

    this.items.statusChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updateInvalidGroupsCount());

    this.addItem();
  }

  protected get items(): FormArray<FormGroup<FormItem>> {
    return this.form.get('items') as FormArray<FormGroup<FormItem>>;
  }

  protected getFormGroup(index: number): FormGroup<UserFormGroup> {
    return this.items.at(index).get('group') as FormGroup<UserFormGroup>;
  }

  protected createItem(): FormGroup<FormItem> {
    return this.fb.group<FormItem>({
      group: this.fb.group<UserFormGroup>({
        country: this.fb.control<string | null>('', [Validators.required, countryValidator()]),
        username: this.fb.control<string | null>('', Validators.required, usernameValidator(this.userFormService)),
        birthday: this.fb.control<string | null>('', [Validators.required, birthdayValidator()])
      })
    });
  }

  protected addItem(): void {
    this.items.push(this.createItem());
    this.cdr.markForCheck();
  }

  protected deleteItem(index: number): void {
    this.items.removeAt(index);
    this.cdr.markForCheck();
  }

  protected onSubmit(): void {
    if (this.isSubmitting) this.cancelSubmission();
    else this.startSubmission();
  }

  private startSubmission(): void {
    if (this.form.valid) {
      this.isSubmitting = true;
      this.timer = 5;
      this.items.disable();
      this.cdr.markForCheck();

      this.timerInterval = setInterval(() => {
        this.timer--;
        this.cdr.markForCheck();

        if (this.timer === 0) {
          clearInterval(this.timerInterval);
          this.submitForms();
        }
      }, 1000);
    }
  }

  private cancelSubmission(): void {
    clearInterval(this.timerInterval);
    this.isSubmitting = false;
    this.timer = 0;
    this.items.enable();
    this.cdr.markForCheck();
  }

  private submitForms(): void {
      this.userFormService
        .submitForm(parseFromModelToDto(this.form.value as Users))
        .pipe(
          take(1),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe(() => {
          this.items.clear();
          this.addItem();
          this.isSubmitting = false;
          this.items.enable();
          this.cdr.markForCheck();
        });
  }

  private updateInvalidGroupsCount(): void {
    const invalidCount = this.items.controls.filter((group) => !group.valid).length;
    this.invalidGroupsCountSubject.next(invalidCount);
  }
}
