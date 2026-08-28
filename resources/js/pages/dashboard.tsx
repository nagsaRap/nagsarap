import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { User, Mail, Hash, CheckCircle2, GraduationCap, Layers, Calendar } from 'lucide-react';

type StudentData = {
    student_id: number;
    student_number: string;
    surname: string;
    firstname: string;
    middlename?: string;
    ext?: string;
    email: string;
    degree?: string;
    year_section?: string;
    semester?: string;
    academic_year?: string;
    verification_status: string;
    created_at: string;
    face_photo_url?: string | null; // <--- ADDED PHOTO URL PROP
};

type Props = {
    student?: StudentData | null;
};

export default function Dashboard({ student }: Props) {
    const fullName = student
        ? `${student.firstname} ${student.middlename ? student.middlename + ' ' : ''}${student.surname}${student.ext ? ' ' + student.ext : ''}`
        : 'Student';

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                
                {/* PROFILE HEADER WITH FACE PHOTO */}
                <div className="flex flex-col gap-4 rounded-xl border border-sidebar-border/70 bg-card p-6 shadow-sm dark:border-sidebar-border sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-primary/20 bg-muted shadow-inner">
                            {student?.face_photo_url ? (
                                <img
                                    src={student.face_photo_url}
                                    alt={fullName}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                                    <User className="h-8 w-8" />
                                </div>
                            )}
                        </div>

                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-foreground">
                                Welcome, {fullName}!
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                {student?.student_number ?? 'N/A'} • {student?.degree ?? 'No Program Selected'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                            <CheckCircle2 className="h-4 w-4" /> Account Verified
                        </span>
                    </div>
                </div>

                {/* WELCOME BANNER & STUDENT DETAILS GRID */}
                <div className="grid auto-rows-min gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    
                    {/* Student Number Card */}
                    <div className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-sidebar-border/70 bg-card p-5 shadow-sm dark:border-sidebar-border">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Student Number
                            </span>
                            <div className="rounded-lg bg-primary/10 p-2 text-primary">
                                <Hash className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-xl font-extrabold tracking-tight text-foreground">
                                {student?.student_number ?? 'N/A'}
                            </h3>
                            <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
                                <Mail className="h-3.5 w-3.5 shrink-0" />
                                {student?.email ?? 'N/A'}
                            </p>
                        </div>
                    </div>

                    {/* Degree Program Card */}
                    <div className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-sidebar-border/70 bg-card p-5 shadow-sm dark:border-sidebar-border">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Degree Program
                            </span>
                            <div className="rounded-lg bg-primary/10 p-2 text-primary">
                                <GraduationCap className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="line-clamp-1 text-base font-extrabold tracking-tight text-foreground" title={student?.degree ?? 'N/A'}>
                                {student?.degree ?? 'N/A'}
                            </h3>
                            <p className="mt-1 truncate text-xs text-muted-foreground">
                                {student ? `${student.surname}, ${student.firstname} ${student.middlename ?? ''}` : 'N/A'}
                            </p>
                        </div>
                    </div>

                    {/* Year & Section Card */}
                    <div className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-sidebar-border/70 bg-card p-5 shadow-sm dark:border-sidebar-border">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Year & Section
                            </span>
                            <div className="rounded-lg bg-primary/10 p-2 text-primary">
                                <Layers className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-xl font-extrabold tracking-tight text-foreground">
                                {student?.year_section ?? 'N/A'}
                            </h3>
                            <p className="mt-1 text-xs text-muted-foreground">Class Classification</p>
                        </div>
                    </div>

                    {/* Semester & Term Status Card */}
                    <div className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-sidebar-border/70 bg-card p-5 shadow-sm dark:border-sidebar-border">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Academic Term
                            </span>
                            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
                                <Calendar className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-base font-bold tracking-tight text-foreground">
                                {student?.semester ? `${student.semester} Sem (${student.academic_year})` : 'N/A'}
                            </h3>
                            <div className="mt-2">
                                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                                    <CheckCircle2 className="h-3 w-3" /> Form 5 Verified
                                </span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* MAIN CONTENT AREA */}
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border md:min-h-min">
                    <h2 className="text-lg font-bold text-foreground">Attendance Records</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Your subject schedules and attendance history will appear here.</p>
                </div>

            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};