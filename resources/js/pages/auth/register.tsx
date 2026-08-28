import { useForm, Head, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { validateFaceImage } from '@/lib/faceValidation';
import {
    Cpu,
    Mail,
    User,
    Hash,
    Upload,
    FileText,
    CheckCircle2,
    AlertCircle,
    Loader2,
} from 'lucide-react';
import { useState, FormEvent } from 'react';

type Props = {
    teamInvitation?: {
        code?: string;
    } | null;
};

const inputClass =
    'w-full rounded-lg border border-gray-300 bg-white text-black placeholder:text-gray-400 caret-[#1B1F5C] shadow-sm transition-colors focus-visible:border-[#F5A623] focus-visible:ring-1 focus-visible:ring-[#F5A623] focus-visible:outline-none';

const iconClass =
    'pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400';

export default function Register({}: Props) {
    const [facePhotoName, setFacePhotoName] = useState<string>('');
    const [form5Name, setForm5Name] = useState<string>('');
    const [isValidatingFace, setIsValidatingFace] = useState<boolean>(false);
    const [faceValidationError, setFaceValidationError] = useState<string | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        student_number: '',
        surname: '',
        firstname: '',
        middlename: '',
        ext: '',
        email: '',
        password: '',
        password_confirmation: '',
        face_photo: null as File | null,
        face_embedding: '' as string, // <--- Stores stringified keypoints JSON
        form_5: null as File | null,
    });

    const formatStudentNumber = (value: string) => {
        let numbers = value.replace(/\D/g, '');
        numbers = numbers.slice(0, 8);

        if (numbers.length > 2) {
            numbers = numbers.slice(0, 2) + '-' + numbers.slice(2);
        }

        return numbers;
    };

    const handleFacePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsValidatingFace(true);
        setFaceValidationError(null);

        // Pre-validate photo quality & extract facial keypoint embeddings
        const validation = await validateFaceImage(file);
        setIsValidatingFace(false);

        if (!validation.isValid) {
            setFaceValidationError(validation.message || 'Invalid face photo.');
            setFacePhotoName('');
            setData((prevData) => ({
                ...prevData,
                face_photo: null,
                face_embedding: '',
            }));
            e.target.value = ''; // Reset input element
            return;
        }

        // Passed face validation check: Save photo & stringified facial embedding
        setFaceValidationError(null);
        setFacePhotoName(file.name);
        
        setData((prevData) => ({
            ...prevData,
            face_photo: file,
            face_embedding: JSON.stringify(validation.embedding),
        }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (isValidatingFace) return;

        post('/register', {
            forceFormData: true,
            onSuccess: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="min-h-screen w-full bg-[#F5F6FA] font-sans">
            <Head title="Register" />

            <div className="flex min-h-screen flex-col lg:flex-row">
                {/* LEFT PANEL */}
                <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-[#1B1F5C] p-8 text-center text-white lg:p-16">
                    <div
                        className="pointer-events-none absolute inset-0 opacity-15"
                        style={{
                            backgroundImage: `
                                radial-gradient(#F5A623 1.5px, transparent 1.5px),
                                linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px),
                                linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)
                            `,
                            backgroundSize: '28px 28px, 28px 28px, 28px 28px',
                        }}
                    />
                    <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full border border-[#F5A623]/20" />
                    <div className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full border border-[#F5A623]/20" />

                    <div className="relative z-10">
                        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#F5A623] bg-white shadow-[0_0_25px_rgba(245,166,35,0.3)]">
                            <Cpu className="h-12 w-12 text-[#1B1F5C]" />
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-wider text-[#F5A623]">CCIS</h1>
                        <h2 className="mt-1 text-xl font-bold tracking-wide">Attendance System</h2>
                        <p className="mx-auto mt-4 max-w-xs text-sm leading-relaxed text-white/70">
                            Create your student account and experience smarter attendance tracking.
                        </p>
                        <div className="mx-auto mt-8 h-1 w-16 rounded-full bg-[#F5A623]" />
                    </div>
                </div>

                {/* RIGHT PANEL */}
                <div className="flex flex-1 items-center justify-center bg-[#F5F6FA] p-6 lg:p-12">
                    <div className="w-full max-w-lg rounded-2xl border border-gray-100 bg-white p-8 shadow-xl lg:p-9">
                        <div className="mb-7 text-center">
                            <h3 className="text-2xl font-bold text-[#1B1F5C]">Create Student Account</h3>
                            <p className="mt-2 text-xs text-gray-500">Register for the CCIS Attendance System</p>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            {/* STUDENT NUMBER */}
                            <div className="grid gap-2">
                                <Label htmlFor="student_number" className="text-xs font-semibold text-gray-700">
                                    Student Number <span className="ml-1 text-[#F5A623]">*</span>
                                </Label>
                                <div className="relative">
                                    <Hash className={iconClass} />
                                    <Input
                                        id="student_number"
                                        type="text"
                                        name="student_number"
                                        value={data.student_number}
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="off"
                                        inputMode="numeric"
                                        maxLength={9}
                                        placeholder="e.g. 23-140040"
                                        pattern="[0-9]{2}-[0-9]{6}"
                                        onChange={(e) => {
                                            const formatted = formatStudentNumber(e.target.value);
                                            setData('student_number', formatted);
                                        }}
                                        className={`${inputClass} pl-9`}
                                    />
                                </div>
                                <p className="text-[11px] text-gray-400">Format: YY-NNNNNN (e.g. 23-140040)</p>
                                <InputError message={errors.student_number} />
                            </div>

                            {/* SURNAME + FIRST NAME */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {/* SURNAME */}
                                <div className="grid gap-2">
                                    <Label htmlFor="surname" className="text-xs font-semibold text-gray-700">
                                        Surname <span className="ml-1 text-[#F5A623]">*</span>
                                    </Label>
                                    <div className="relative">
                                        <User className={iconClass} />
                                        <Input
                                            id="surname"
                                            type="text"
                                            name="surname"
                                            value={data.surname}
                                            required
                                            tabIndex={2}
                                            autoComplete="family-name"
                                            placeholder="Surname"
                                            onChange={(e) => setData('surname', e.target.value)}
                                            className={`${inputClass} pl-9`}
                                        />
                                    </div>
                                    <InputError message={errors.surname} />
                                </div>

                                {/* FIRST NAME */}
                                <div className="grid gap-2">
                                    <Label htmlFor="firstname" className="text-xs font-semibold text-gray-700">
                                        First Name <span className="ml-1 text-[#F5A623]">*</span>
                                    </Label>
                                    <div className="relative">
                                        <User className={iconClass} />
                                        <Input
                                            id="firstname"
                                            type="text"
                                            name="firstname"
                                            value={data.firstname}
                                            required
                                            tabIndex={3}
                                            autoComplete="given-name"
                                            placeholder="First name"
                                            onChange={(e) => setData('firstname', e.target.value)}
                                            className={`${inputClass} pl-9`}
                                        />
                                    </div>
                                    <InputError message={errors.firstname} />
                                </div>
                            </div>

                            {/* MIDDLE NAME + EXTENSION */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div className="grid gap-2 sm:col-span-2">
                                    <Label htmlFor="middlename" className="text-xs font-semibold text-gray-700">
                                        Middle Name
                                    </Label>
                                    <Input
                                        id="middlename"
                                        type="text"
                                        name="middlename"
                                        value={data.middlename}
                                        tabIndex={4}
                                        autoComplete="additional-name"
                                        placeholder="Middle name"
                                        onChange={(e) => setData('middlename', e.target.value)}
                                        className={inputClass}
                                    />
                                    <InputError message={errors.middlename} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="ext" className="text-xs font-semibold text-gray-700">
                                        Extension
                                    </Label>
                                    <Input
                                        id="ext"
                                        type="text"
                                        name="ext"
                                        value={data.ext}
                                        tabIndex={5}
                                        placeholder="Jr., Sr."
                                        onChange={(e) => setData('ext', e.target.value)}
                                        className={inputClass}
                                    />
                                    <InputError message={errors.ext} />
                                </div>
                            </div>

                            {/* EMAIL */}
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-xs font-semibold text-gray-700">
                                    Email Address <span className="ml-1 text-[#F5A623]">*</span>
                                </Label>
                                <div className="relative">
                                    <Mail className={iconClass} />
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        required
                                        tabIndex={6}
                                        autoComplete="email"
                                        placeholder="Enter your email address"
                                        onChange={(e) => setData('email', e.target.value)}
                                        className={`${inputClass} pl-9`}
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            {/* PASSWORD */}
                            <div className="grid gap-2">
                                <Label htmlFor="password" className="text-xs font-semibold text-gray-700">
                                    Password <span className="ml-1 text-[#F5A623]">*</span>
                                </Label>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    value={data.password}
                                    required
                                    tabIndex={7}
                                    autoComplete="new-password"
                                    placeholder="Create a password"
                                    onChange={(e) => setData('password', e.target.value)}
                                    className={inputClass}
                                />
                                <InputError message={errors.password} />
                            </div>

                            {/* CONFIRM PASSWORD */}
                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation" className="text-xs font-semibold text-gray-700">
                                    Confirm Password <span className="ml-1 text-[#F5A623]">*</span>
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    required
                                    tabIndex={8}
                                    autoComplete="new-password"
                                    placeholder="Confirm your password"
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    className={inputClass}
                                />
                                <InputError message={errors.password_confirmation} />
                            </div>

                            {/* FACE PHOTO */}
                            <div className="grid gap-2">
                                <Label htmlFor="face_photo" className="text-xs font-semibold text-gray-700">
                                    Reference Photo (Face Liveness) <span className="ml-1 text-[#F5A623]">*</span>
                                </Label>
                                <label
                                    htmlFor="face_photo"
                                    className="group flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-gray-300 bg-white px-4 py-3 transition-all hover:border-[#F5A623] hover:bg-[#FFFBF3]"
                                >
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1B1F5C]/10 transition-colors group-hover:bg-[#F5A623]/20">
                                        {isValidatingFace ? (
                                            <Loader2 className="h-4 w-4 animate-spin text-[#1B1F5C]" />
                                        ) : facePhotoName && data.face_embedding ? (
                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <Upload className="h-4 w-4 text-[#1B1F5C]" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-700 group-hover:text-[#1B1F5C]">
                                            {isValidatingFace
                                                ? 'Analyzing photo clarity & extracting keypoints...'
                                                : facePhotoName || 'Upload reference face photo'}
                                        </p>
                                        <p className="mt-0.5 text-xs text-gray-400">JPG, JPEG, or PNG (Sharp & unblurred, Max 5MB)</p>
                                    </div>
                                    <Input
                                        id="face_photo"
                                        type="file"
                                        name="face_photo"
                                        accept="image/jpeg,image/png,image/jpg"
                                        required
                                        tabIndex={9}
                                        disabled={isValidatingFace}
                                        className="hidden"
                                        onChange={handleFacePhotoChange}
                                    />
                                </label>

                                {/* INSTANT BLUR / FACE VALIDATION ERROR ALERT */}
                                {faceValidationError && (
                                    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs font-medium text-red-600">
                                        <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                                        <span>{faceValidationError}</span>
                                    </div>
                                )}

                                {data.face_embedding && !faceValidationError && (
                                    <p className="text-[11px] font-semibold text-emerald-600">
                                        ✓ Facial keypoints successfully extracted for liveness matching!
                                    </p>
                                )}

                                <InputError message={errors.face_photo} />
                                <InputError message={errors.face_embedding} />
                            </div>

                            {/* FORM 5 DOCUMENT */}
                            <div className="grid gap-2">
                                <Label htmlFor="form_5" className="text-xs font-semibold text-gray-700">
                                    Form 5 Document <span className="ml-1 text-[#F5A623]">*</span>
                                </Label>
                                <label
                                    htmlFor="form_5"
                                    className="group flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-gray-300 bg-white px-4 py-3 transition-all hover:border-[#F5A623] hover:bg-[#FFFBF3]"
                                >
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1B1F5C]/10 transition-colors group-hover:bg-[#F5A623]/20">
                                        {form5Name ? (
                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <FileText className="h-4 w-4 text-[#1B1F5C]" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-700 group-hover:text-[#1B1F5C]">
                                            {form5Name || 'Upload Form 5'}
                                        </p>
                                        <p className="mt-0.5 text-xs text-gray-400">PDF only (Max 10MB)</p>
                                    </div>
                                    <Input
                                        id="form_5"
                                        type="file"
                                        name="form_5"
                                        accept="application/pdf,.pdf"
                                        required
                                        tabIndex={10}
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setData('form_5', file);
                                                setForm5Name(file.name);
                                            }
                                        }}
                                    />
                                </label>
                                <InputError message={errors.form_5} />
                            </div>

                            {/* SUBMIT BUTTON */}
                            <Button
                                type="submit"
                                disabled={processing || isValidatingFace || !data.face_embedding}
                                tabIndex={11}
                                data-test="register-button"
                                className="mt-3 w-full rounded-lg bg-[#1B1F5C] py-2.5 font-medium text-white shadow-md transition-all hover:border-b-2 hover:border-[#F5A623] hover:bg-[#131644] focus-visible:ring-2 focus-visible:ring-[#F5A623] focus-visible:ring-offset-2 disabled:opacity-50"
                            >
                                {(processing || isValidatingFace) && <Spinner className="mr-2" />}
                                Create Student Account & Verify
                            </Button>

                            {/* LOGIN LINK */}
                            <div className="mt-3 text-center text-xs text-gray-500">
                                Already have an account?{' '}
                                <Link
                                    href="/login"
                                    className="font-bold text-[#1B1F5C] transition-colors hover:text-[#F5A623]"
                                >
                                    Log in here
                                </Link>
                            </div>
                        </form>

                        {/* BACK HOME */}
                        <div className="mt-6 text-center">
                            <Link
                                href="/"
                                className="text-xs text-gray-400 transition-colors hover:text-[#1B1F5C]"
                            >
                                ← Back to Home
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

Register.layout = {
    title: 'Create an Account',
    description: 'Register for the CCIS Attendance System',
};