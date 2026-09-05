<?php

namespace App\Providers;

use App\Actions\Fortify\CreateNewUser;
use App\Actions\Fortify\ResetUserPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Laravel\Fortify\Contracts\RegisterResponse;
use Laravel\Fortify\Features;
use Laravel\Fortify\Fortify;

class FortifyServiceProvider extends ServiceProvider
{
    /**
     * Register application services.
     */
    public function register(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Custom post-registration response
        |--------------------------------------------------------------------------
        |
        | By default Fortify normally redirects a newly registered user to
        | the configured home/dashboard route.
        |
        | For the CCIS Attendance System we need:
        |
        | Registration
        |      ↓
        | Create Student + User
        |      ↓
        | Automatically authenticated by Fortify
        |      ↓
        | /register/verify-face
        |      ↓
        | MediaPipe liveness
        |      ↓
        | InsightFace verification
        |      ↓
        | dashboard
        |
        */

        $this->app->singleton(
            RegisterResponse::class,
            function () {
                return new class implements RegisterResponse
                {
                    public function toResponse($request)
                    {
                        return redirect()
                            ->route('register.verify-face');
                    }
                };
            }
        );
    }

    /**
     * Bootstrap application services.
     */
    public function boot(): void
    {
        $this->configureActions();
        $this->configureViews();
        $this->configureRateLimiting();
    }

    /**
     * Configure Fortify actions.
     */
    private function configureActions(): void
    {
        Fortify::resetUserPasswordsUsing(
            ResetUserPassword::class
        );

        Fortify::createUsersUsing(
            CreateNewUser::class
        );
    }

    /**
     * Configure Fortify views.
     */
    private function configureViews(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Login
        |--------------------------------------------------------------------------
        */

        Fortify::loginView(
            fn (Request $request) =>
                Inertia::render('auth/login', [
                    'canResetPassword' =>
                        Features::enabled(
                            Features::resetPasswords()
                        ),

                    'status' =>
                        $request
                            ->session()
                            ->get('status'),
                ])
        );

        /*
        |--------------------------------------------------------------------------
        | Reset password
        |--------------------------------------------------------------------------
        */

        Fortify::resetPasswordView(
            fn (Request $request) =>
                Inertia::render(
                    'auth/reset-password',
                    [
                        'email' =>
                            $request->email,

                        'token' =>
                            $request
                                ->route('token'),

                        'passwordRules' =>
                            Password::defaults()
                                ->toPasswordRulesString(),
                    ]
                )
        );

        /*
        |--------------------------------------------------------------------------
        | Forgot password
        |--------------------------------------------------------------------------
        */

        Fortify::requestPasswordResetLinkView(
            fn (Request $request) =>
                Inertia::render(
                    'auth/forgot-password',
                    [
                        'status' =>
                            $request
                                ->session()
                                ->get('status'),
                    ]
                )
        );

        /*
        |--------------------------------------------------------------------------
        | Email verification
        |--------------------------------------------------------------------------
        */

        Fortify::verifyEmailView(
            fn (Request $request) =>
                Inertia::render(
                    'auth/verify-email',
                    [
                        'status' =>
                            $request
                                ->session()
                                ->get('status'),
                    ]
                )
        );

        /*
        |--------------------------------------------------------------------------
        | Registration
        |--------------------------------------------------------------------------
        */

        Fortify::registerView(
            fn () =>
                Inertia::render(
                    'auth/register',
                    [
                        'passwordRules' =>
                            Password::defaults()
                                ->toPasswordRulesString(),
                    ]
                )
        );

        /*
        |--------------------------------------------------------------------------
        | Two-factor challenge
        |--------------------------------------------------------------------------
        */

        Fortify::twoFactorChallengeView(
            fn () =>
                Inertia::render(
                    'auth/two-factor-challenge'
                )
        );

        /*
        |--------------------------------------------------------------------------
        | Confirm password
        |--------------------------------------------------------------------------
        */

        Fortify::confirmPasswordView(
            fn () =>
                Inertia::render(
                    'auth/confirm-password'
                )
        );
    }

    /**
     * Configure Fortify rate limiting.
     */
    private function configureRateLimiting(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Two-factor rate limiting
        |--------------------------------------------------------------------------
        */

        RateLimiter::for(
            'two-factor',
            function (Request $request) {
                return Limit::perMinute(5)
                    ->by(
                        $request
                            ->session()
                            ->get('login.id')
                    );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Login rate limiting
        |--------------------------------------------------------------------------
        */

        RateLimiter::for(
            'login',
            function (Request $request) {
                $throttleKey =
                    Str::transliterate(
                        Str::lower(
                            $request->input(
                                Fortify::username()
                            )
                        ).
                        '|'.
                        $request->ip()
                    );

                return Limit::perMinute(5)
                    ->by($throttleKey);
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Passkey rate limiting
        |--------------------------------------------------------------------------
        */

        RateLimiter::for(
            'passkeys',
            function (Request $request) {
                return Limit::perMinute(10)
                    ->by(
                        (
                            $request->input(
                                'credential.id'
                            )
                            ?:
                            $request
                                ->session()
                                ->getId()
                        ).
                        '|'.
                        $request->ip()
                    );
            }
        );
    }
}