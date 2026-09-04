import { Head, Link, useForm } from '@inertiajs/react';
import {
    Check,
    Eye,
    EyeOff,
    FileText,
    LockKeyhole,
    Mail,
    ShieldCheck,
    Upload,
    User,
    X,
} from 'lucide-react';
import {
    FormEvent,
    useMemo,
    useRef,
    useState,
} from 'react';

type RegisterForm = {
    student_number: string;
    surname: string;
    firstname: string;
    middlename: string;
    ext: string;
    email: string;
    password: string;
    password_confirmation: string;
    profile_photo: File | null;
    form_5: File | null;
};

export default function Register() {
    const profilePhotoRef = useRef<HTMLInputElement>(null);
    const form5Ref = useRef<HTMLInputElement>(null);

    const [showPassword, setShowPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
    } = useForm<RegisterForm>({
        student_number: '',
        surname: '',
        firstname: '',
        middlename: '',
        ext: '',
        email: '',
        password: '',
        password_confirmation: '',
        profile_photo: null,
        form_5: null,
    });

    /*
    |--------------------------------------------------------------------------
    | Password requirements
    |--------------------------------------------------------------------------
    */

    const passwordRequirements = useMemo(() => {
        return {
            minimumLength:
                data.password.length >= 8,

            uppercase:
                /[A-Z]/.test(data.password),

            specialCharacter:
                /[^A-Za-z0-9]/.test(data.password),

            passwordsMatch:
                data.password.length > 0 &&
                data.password_confirmation.length > 0 &&
                data.password ===
                    data.password_confirmation,
        };
    }, [
        data.password,
        data.password_confirmation,
    ]);

    const passwordValid =
        passwordRequirements.minimumLength &&
        passwordRequirements.uppercase &&
        passwordRequirements.specialCharacter;

    /*
    |--------------------------------------------------------------------------
    | Submit
    |--------------------------------------------------------------------------
    */

    const submit = (event: FormEvent) => {
        event.preventDefault();

        if (!passwordValid) {
            return;
        }

        if (!passwordRequirements.passwordsMatch) {
            return;
        }

        post('/register', {
            forceFormData: true,

            onSuccess: () => {
                reset(
                    'password',
                    'password_confirmation'
                );
            },

            onError: (serverErrors) => {
                console.error(
                    'Registration errors:',
                    serverErrors
                );
            },

            onFinish: () => {
                console.log(
                    'Registration request finished'
                );
            },
        });
    };

    return (
        <>
            <Head title="Student Registration" />

            <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
                <div className="mx-auto w-full max-w-xl">
                    {/* Header */}
                    <div className="mb-7 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-950 text-white shadow-sm">
                            <ShieldCheck className="h-7 w-7" />
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            Create Student Account
                        </h1>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            Register your student information
                            before biometric verification.
                        </p>
                    </div>

                    <form
                        onSubmit={submit}
                        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
                    >
                        {/* Student Number */}
                        <FieldLabel
                            label="Student Number"
                            required
                        />

                        <div className="relative">
                            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                            <input
                                type="text"
                                value={data.student_number}
                                onChange={(e) =>
                                    setData(
                                        'student_number',
                                        e.target.value
                                    )
                                }
                                placeholder="e.g. 23-140012"
                                autoComplete="off"
                                className={inputClass(
                                    !!errors.student_number,
                                    true
                                )}
                            />
                        </div>

                        <p className="mt-1.5 text-xs text-slate-400">
                            Your college will be detected
                            automatically from your student
                            number.
                        </p>

                        <FieldError
                            message={errors.student_number}
                        />

                        {/* Name */}
                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            <div>
                                <FieldLabel
                                    label="Surname"
                                    required
                                />

                                <input
                                    type="text"
                                    value={data.surname}
                                    onChange={(e) =>
                                        setData(
                                            'surname',
                                            e.target.value
                                        )
                                    }
                                    placeholder="e.g. Gabion"
                                    className={inputClass(
                                        !!errors.surname
                                    )}
                                />

                                <FieldError
                                    message={errors.surname}
                                />
                            </div>

                            <div>
                                <FieldLabel
                                    label="First Name"
                                    required
                                />

                                <input
                                    type="text"
                                    value={data.firstname}
                                    onChange={(e) =>
                                        setData(
                                            'firstname',
                                            e.target.value
                                        )
                                    }
                                    placeholder="e.g. Raphael Louis"
                                    className={inputClass(
                                        !!errors.firstname
                                    )}
                                />

                                <FieldError
                                    message={errors.firstname}
                                />
                            </div>
                        </div>

                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <div>
                                <FieldLabel label="Middle Name" />

                                <input
                                    type="text"
                                    value={data.middlename}
                                    onChange={(e) =>
                                        setData(
                                            'middlename',
                                            e.target.value
                                        )
                                    }
                                    placeholder="e.g. Pedronan"
                                    className={inputClass(
                                        !!errors.middlename
                                    )}
                                />

                                <FieldError
                                    message={errors.middlename}
                                />
                            </div>

                            <div>
                                <FieldLabel label="Extension" />

                                <input
                                    type="text"
                                    value={data.ext}
                                    onChange={(e) =>
                                        setData(
                                            'ext',
                                            e.target.value
                                        )
                                    }
                                    placeholder="e.g. Jr., Sr., III"
                                    className={inputClass(
                                        !!errors.ext
                                    )}
                                />

                                <FieldError
                                    message={errors.ext}
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="mt-5">
                            <FieldLabel
                                label="Email Address"
                                required
                            />

                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData(
                                            'email',
                                            e.target.value
                                        )
                                    }
                                    placeholder="e.g. student@example.com"
                                    autoComplete="email"
                                    className={inputClass(
                                        !!errors.email,
                                        true
                                    )}
                                />
                            </div>

                            <FieldError
                                message={errors.email}
                            />
                        </div>

                        {/* Password */}
                        <div className="mt-5">
                            <FieldLabel
                                label="Password"
                                required
                            />

                            <div className="relative">
                                <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                <input
                                    type={
                                        showPassword
                                            ? 'text'
                                            : 'password'
                                    }
                                    value={data.password}
                                    onChange={(e) =>
                                        setData(
                                            'password',
                                            e.target.value
                                        )
                                    }
                                    placeholder="Create a secure password"
                                    autoComplete="new-password"
                                    className={`${inputClass(
                                        !!errors.password,
                                        true
                                    )} pr-11`}
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(
                                            (current) =>
                                                !current
                                        )
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                                    aria-label={
                                        showPassword
                                            ? 'Hide password'
                                            : 'Show password'
                                    }
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>

                            {/* Live password checklist */}
                            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                                <p className="mb-2 text-xs font-semibold text-slate-600">
                                    Your password must contain:
                                </p>

                                <div className="space-y-2">
                                    <Requirement
                                        valid={
                                            passwordRequirements.minimumLength
                                        }
                                    >
                                        At least 8 characters
                                    </Requirement>

                                    <Requirement
                                        valid={
                                            passwordRequirements.uppercase
                                        }
                                    >
                                        At least one uppercase
                                        letter (A-Z)
                                    </Requirement>

                                    <Requirement
                                        valid={
                                            passwordRequirements.specialCharacter
                                        }
                                    >
                                        At least one special
                                        character (!@#$...)
                                    </Requirement>
                                </div>
                            </div>

                            <FieldError
                                message={errors.password}
                            />
                        </div>

                        {/* Confirm Password */}
                        <div className="mt-5">
                            <FieldLabel
                                label="Confirm Password"
                                required
                            />

                            <div className="relative">
                                <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                <input
                                    type={
                                        showConfirmPassword
                                            ? 'text'
                                            : 'password'
                                    }
                                    value={
                                        data.password_confirmation
                                    }
                                    onChange={(e) =>
                                        setData(
                                            'password_confirmation',
                                            e.target.value
                                        )
                                    }
                                    placeholder="Re-enter your password"
                                    autoComplete="new-password"
                                    className={`${inputClass(
                                        false,
                                        true
                                    )} pr-11`}
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            (current) =>
                                                !current
                                        )
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>

                            {data.password_confirmation
                                .length > 0 && (
                                <div className="mt-2">
                                    <Requirement
                                        valid={
                                            passwordRequirements.passwordsMatch
                                        }
                                    >
                                        Passwords match
                                    </Requirement>
                                </div>
                            )}
                        </div>

                        {/* Reference Photo */}
                        <div className="mt-6">
                            <FieldLabel
                                label="Reference Photo"
                                required
                            />

                            <input
                                ref={profilePhotoRef}
                                type="file"
                                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                                className="hidden"
                                onChange={(e) =>
                                    setData(
                                        'profile_photo',
                                        e.target.files?.[0] ??
                                            null
                                    )
                                }
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    profilePhotoRef.current?.click()
                                }
                                className={`flex w-full items-center gap-3 rounded-xl border border-dashed p-4 text-left transition ${
                                    errors.profile_photo
                                        ? 'border-red-300 bg-red-50'
                                        : 'border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/40'
                                }`}
                            >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                                    {data.profile_photo ? (
                                        <Check className="h-5 w-5 text-emerald-600" />
                                    ) : (
                                        <Upload className="h-5 w-5 text-slate-500" />
                                    )}
                                </div>

                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-slate-700">
                                        {data.profile_photo
                                            ? data.profile_photo
                                                  .name
                                            : 'Upload your reference photo'}
                                    </p>

                                    <p className="mt-0.5 text-xs text-slate-400">
                                        JPG, JPEG or PNG • Max
                                        5MB
                                    </p>
                                </div>
                            </button>

                            <FieldError
                                message={
                                    errors.profile_photo
                                }
                            />
                        </div>

                        {/* Form 5 */}
                        <div className="mt-5">
                            <FieldLabel
                                label="Form 5 Document"
                                required
                            />

                            <input
                                ref={form5Ref}
                                type="file"
                                accept=".pdf,application/pdf"
                                className="hidden"
                                onChange={(e) =>
                                    setData(
                                        'form_5',
                                        e.target.files?.[0] ??
                                            null
                                    )
                                }
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    form5Ref.current?.click()
                                }
                                className={`flex w-full items-center gap-3 rounded-xl border border-dashed p-4 text-left transition ${
                                    errors.form_5
                                        ? 'border-red-300 bg-red-50'
                                        : 'border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/40'
                                }`}
                            >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                                    {data.form_5 ? (
                                        <Check className="h-5 w-5 text-emerald-600" />
                                    ) : (
                                        <FileText className="h-5 w-5 text-slate-500" />
                                    )}
                                </div>

                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-slate-700">
                                        {data.form_5
                                            ? data.form_5.name
                                            : 'Upload your Form 5'}
                                    </p>

                                    <p className="mt-0.5 text-xs text-slate-400">
                                        PDF only • Max 10MB
                                    </p>
                                </div>
                            </button>

                            <FieldError
                                message={errors.form_5}
                            />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={
                                processing ||
                                !passwordValid ||
                                !passwordRequirements.passwordsMatch
                            }
                            className="mt-7 flex h-12 w-full items-center justify-center rounded-xl bg-indigo-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-900 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing
                                ? 'Creating Account...'
                                : 'Create Student Account & Verify'}
                        </button>

                        {(Object.keys(errors).length >
                            0) && (
                            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                Registration failed. Please
                                review the highlighted fields.
                            </div>
                        )}

                        <p className="mt-6 text-center text-sm text-slate-500">
                            Already have an account?{' '}
                            <Link
                                href="/login"
                                className="font-semibold text-indigo-950 hover:underline"
                            >
                                Log in here
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </>
    );
}

/*
|--------------------------------------------------------------------------
| Reusable components
|--------------------------------------------------------------------------
*/

function FieldLabel({
    label,
    required = false,
}: {
    label: string;
    required?: boolean;
}) {
    return (
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
            {label}

            {required && (
                <span className="ml-1 text-red-500">
                    *
                </span>
            )}
        </label>
    );
}

function FieldError({
    message,
}: {
    message?: string;
}) {
    if (!message) {
        return null;
    }

    return (
        <p className="mt-1.5 text-xs font-medium text-red-600">
            {message}
        </p>
    );
}

function Requirement({
    valid,
    children,
}: {
    valid: boolean;
    children: React.ReactNode;
}) {
    return (
        <div
            className={`flex items-center gap-2 text-xs ${
                valid
                    ? 'font-medium text-emerald-600'
                    : 'text-slate-500'
            }`}
        >
            <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                    valid
                        ? 'bg-emerald-100'
                        : 'bg-slate-200'
                }`}
            >
                {valid ? (
                    <Check className="h-3 w-3" />
                ) : (
                    <X className="h-3 w-3" />
                )}
            </span>

            {children}
        </div>
    );
}

function inputClass(
    hasError: boolean,
    hasLeftIcon = false
) {
    return [
        'h-11 w-full rounded-xl border bg-white text-sm text-slate-900',
        'outline-none transition',
        'placeholder:text-slate-400',
        'focus:ring-2',
        hasLeftIcon ? 'pl-10 pr-3' : 'px-3',
        hasError
            ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
            : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100',
    ].join(' ');
}