/**
 * ============================================
 * SIGEA Frontend - Register Component
 * ============================================
 */

import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthService } from '../../../core/services/auth.service';
import { Role } from '../../../core/models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="register-container">
      <mat-card class="register-card">
        <div class="logo-section">
          <mat-icon class="logo-icon">school</mat-icon>
          <h1>SIGEA</h1>
          <p>Criar nova conta</p>
        </div>

        <mat-card-content>
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nome completo</mat-label>
              <input matInput formControlName="nome" placeholder="Seu nome">
              <mat-icon matSuffix>person</mat-icon>
              @if (registerForm.get('nome')?.hasError('required') && registerForm.get('nome')?.touched) {
                <mat-error>Nome é obrigatório</mat-error>
              }
              @if (registerForm.get('nome')?.hasError('minlength')) {
                <mat-error>Nome deve ter pelo menos 3 caracteres</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" placeholder="seu@email.com">
              <mat-icon matSuffix>email</mat-icon>
              @if (registerForm.get('email')?.hasError('required') && registerForm.get('email')?.touched) {
                <mat-error>Email é obrigatório</mat-error>
              }
              @if (registerForm.get('email')?.hasError('email')) {
                <mat-error>Email inválido</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Senha</mat-label>
              <input
                matInput
                [type]="hidePassword() ? 'password' : 'text'"
                formControlName="senha"
                placeholder="Mínimo 6 caracteres"
              >
              <button
                type="button"
                mat-icon-button
                matSuffix
                (click)="hidePassword.set(!hidePassword())"
              >
                <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (registerForm.get('senha')?.hasError('required') && registerForm.get('senha')?.touched) {
                <mat-error>Senha é obrigatória</mat-error>
              }
              @if (registerForm.get('senha')?.hasError('minlength')) {
                <mat-error>Senha deve ter pelo menos 6 caracteres</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Tipo de usuário</mat-label>
              <mat-select formControlName="role">
                @for (role of roles; track role.value) {
                  <mat-option [value]="role.value">{{ role.label }}</mat-option>
                }
              </mat-select>
              <mat-icon matSuffix>badge</mat-icon>
            </mat-form-field>

            <button
              mat-flat-button
              color="primary"
              type="submit"
              class="full-width register-btn"
              [disabled]="loading()"
            >
              @if (loading()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                <ng-container><mat-icon>person_add</mat-icon> Criar conta</ng-container>
              }
            </button>
          </form>
        </mat-card-content>

        <mat-card-footer>
          <p class="login-link">
            Já tem uma conta?
            <a routerLink="/login">Entrar</a>
          </p>
        </mat-card-footer>
      </mat-card>
    </div>
  `,
  styles: [`
    .register-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 50%, #0d47a1 100%);
      padding: 20px;
    }

    .register-card {
      width: 100%;
      max-width: 420px;
      padding: 32px;
      border-radius: 16px;
    }

    .logo-section {
      text-align: center;
      margin-bottom: 24px;
    }

    .logo-icon {
      font-size: 56px;
      width: 56px;
      height: 56px;
      color: #1976d2;
    }

    .logo-section h1 {
      font-size: 28px;
      font-weight: 700;
      color: #1976d2;
      margin: 8px 0 4px;
      letter-spacing: 2px;
    }

    .logo-section p {
      color: #666;
      font-size: 14px;
      margin: 0;
    }

    .full-width {
      width: 100%;
    }

    mat-form-field {
      margin-bottom: 4px;
    }

    .register-btn {
      height: 48px;
      font-size: 16px;
      margin-top: 8px;

      mat-icon {
        margin-right: 8px;
      }

      mat-spinner {
        margin: 0 auto;
      }
    }

    mat-card-footer {
      text-align: center;
      padding-top: 16px;
      border-top: 1px solid #eee;
      margin-top: 16px;
    }

    .login-link {
      color: #666;
      margin: 0;

      a {
        color: #1976d2;
        text-decoration: none;
        font-weight: 500;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = signal(false);
  hidePassword = signal(true);

  roles: { value: Role; label: string }[] = [
    { value: 'PROFESSOR', label: 'Professor' },
    { value: 'COORDENADOR', label: 'Coordenador' },
    { value: 'ADMIN', label: 'Administrador' },
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      role: ['PROFESSOR']
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.snackBar.open('Conta criada com sucesso!', 'OK', { duration: 3000 });
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading.set(false);
        const message = err.error?.message || 'Erro ao criar conta. Tente novamente.';
        this.snackBar.open(message, 'OK', { duration: 5000 });
      }
    });
  }
}
