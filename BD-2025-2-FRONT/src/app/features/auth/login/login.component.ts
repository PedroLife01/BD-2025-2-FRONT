/**
 * ============================================
 * SIGEA Frontend - Login Component
 * ============================================
 */

import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <div class="logo-section">
          <mat-icon class="logo-icon">school</mat-icon>
          <h1>SIGEA</h1>
          <p>Sistema de Gestão Escolar Acadêmica</p>
        </div>

        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" placeholder="seu@email.com">
              <mat-icon matSuffix>email</mat-icon>
              @if (loginForm.get('email')?.hasError('required') && loginForm.get('email')?.touched) {
                <mat-error>Email é obrigatório</mat-error>
              }
              @if (loginForm.get('email')?.hasError('email')) {
                <mat-error>Email inválido</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Senha</mat-label>
              <input
                matInput
                [type]="hidePassword() ? 'password' : 'text'"
                formControlName="senha"
                placeholder="••••••"
              >
              <button
                type="button"
                mat-icon-button
                matSuffix
                (click)="hidePassword.set(!hidePassword())"
              >
                <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (loginForm.get('senha')?.hasError('required') && loginForm.get('senha')?.touched) {
                <mat-error>Senha é obrigatória</mat-error>
              }
            </mat-form-field>

            <button
              mat-flat-button
              color="primary"
              type="submit"
              class="full-width login-btn"
              [disabled]="loading()"
            >
              @if (loading()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                <ng-container><mat-icon>login</mat-icon> Entrar</ng-container>
              }
            </button>
          </form>
        </mat-card-content>

        <mat-card-footer>
          <p class="register-link">
            Não tem uma conta?
            <a routerLink="/register">Criar conta</a>
          </p>
        </mat-card-footer>
      </mat-card>

      <div class="demo-credentials">
        <h4>Credenciais de Demonstração</h4>
        <div class="credentials">
          <code>admin&#64;sigea.com / 123456</code>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 50%, #0d47a1 100%);
      padding: 20px;
    }

    .login-card {
      width: 100%;
      max-width: 400px;
      padding: 32px;
      border-radius: 16px;
    }

    .logo-section {
      text-align: center;
      margin-bottom: 32px;
    }

    .logo-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #1976d2;
    }

    .logo-section h1 {
      font-size: 32px;
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
      margin-bottom: 8px;
    }

    .login-btn {
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
      margin-top: 24px;
    }

    .register-link {
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

    .demo-credentials {
      margin-top: 24px;
      background: rgba(255, 255, 255, 0.1);
      padding: 16px 24px;
      border-radius: 12px;
      text-align: center;
      color: white;

      h4 {
        margin: 0 0 8px;
        font-weight: 500;
        font-size: 14px;
      }

      .credentials {
        code {
          background: rgba(255, 255, 255, 0.2);
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
        }
      }
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = signal(false);
  hidePassword = signal(true);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.snackBar.open('Login realizado com sucesso!', 'OK', { duration: 3000 });
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading.set(false);
        const message = err.error?.message || 'Erro ao realizar login. Verifique suas credenciais.';
        this.snackBar.open(message, 'OK', { duration: 5000 });
      }
    });
  }
}
