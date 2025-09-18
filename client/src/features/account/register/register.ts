import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { RegisterCreds, User } from '../../../types/user';
import { AccountService } from '../../../core/services/account-service';
import { JsonPipe, NgClass } from '@angular/common';
import { TextInput } from '../../../shared/text-input/text-input';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [FormsModule, ReactiveFormsModule, TextInput],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  accountService = inject(AccountService);

  cancelRegister = output<boolean>();

  private formBuilder = inject(FormBuilder);
  protected creds = {} as RegisterCreds;
  protected credentialsForm: FormGroup;
  protected profileForm: FormGroup;
  protected router = inject(Router);
  protected currentStep = signal(1);
  validationErrors = signal<string[]>([]);

  constructor() {
    this.credentialsForm = this.formBuilder.group({
      email: ['sam@test.com', [Validators.required, Validators.email]],
      displayName: ['sam', [Validators.required]],
      password: ['1111', [Validators.required, Validators.minLength(4), Validators.maxLength(8)]],
      confirmPassword: ['1111', [Validators.required, this.matchValues('password')]],
    });

    this.profileForm = this.formBuilder.group({
      gender: ['male', Validators.required],
      dateOfBirth: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
    });

    this.credentialsForm.controls['password'].valueChanges.subscribe(() => {
      this.credentialsForm.controls['confirmPassword'].updateValueAndValidity();
    });
  }

  register() {
    if (this.profileForm.valid && this.credentialsForm.valid) {
      const formData = { ...this.credentialsForm.value, ...this.profileForm.value };

      this.accountService.register(formData).subscribe({
        next: () => {
          this.router.navigateByUrl('/members')
        },
        error: (error) => {
          console.log(error)
          this.validationErrors.set(error);
        }
      });
    }
  }

  nextStep() {
    if (this.credentialsForm.valid) {
      this.currentStep.update((prevStep) => prevStep + 1);
    }
  }

  prevStep() {
    if (this.credentialsForm.valid) {
      this.currentStep.update((prevStep) => prevStep - 1);
    }
  }

  getMaxDate() {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 18);
    return today.toISOString().split('T')[0];
  }

  matchValues(matchTo: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const parent = control.parent;
      if (parent == null) return null;
      const matchedValue = parent.get(matchTo)?.value;
      return control.value === matchedValue ? null : { passwordMismatch: true };
    };
  }

  cancel() {
    this.cancelRegister.emit(false);
  }
}
