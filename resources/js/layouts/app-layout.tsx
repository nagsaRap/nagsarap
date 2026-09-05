import { Link, router, usePage } from '@inertiajs/react';

import {
    CalendarCheck2,
    ChevronRight,
    History,
    LayoutDashboard,
    LogOut,
    Menu,
    Settings,
    ShieldCheck,
    UserRound,
    Wifi,
    X,
} from 'lucide-react';

import {
    ReactNode,
    useState,
} from 'react';

type AppLayoutProps = {
    children: ReactNode;
};

type AuthUser = {
    id: number;
    name: string;
    email: string;
    role?: string;
    student_id?: number | null;
};

type SharedProps = {
    auth?: {
        user?: AuthUser;
    };
};

const NAVY = '#121A3A';
const GOLD = '#D39A2C';

export default function AppLayout({
    children,
}: AppLayoutProps) {
    const page =
        usePage<SharedProps>();

    const user =
        page.props.auth?.user;

    const url =
        page.url;

    const [mobileMenuOpen, setMobileMenuOpen] =
        useState(false);

    const isActive = (
        path: string,
    ) =>
        url === path ||
        url.startsWith(`${path}/`);

    const logout = () => {
        router.post('/logout');
    };

    return (
        <div className="min-h-screen bg-[#F6F7FB] text-slate-900 dark:bg-[#050914] dark:text-white">

            {/* =========================================================
                DESKTOP SIDEBAR
            ========================================================= */}

            <aside className="fixed bottom-0 left-0 top-0 z-40 hidden w-[270px] flex-col border-r border-slate-200 bg-white lg:flex dark:border-slate-800 dark:bg-[#080D1A]">

                {/* BRAND */}

                <div className="flex h-[82px] items-center gap-3 border-b border-slate-100 px-6 dark:border-slate-800">

                    <div
                        className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-sm"
                        style={{
                            backgroundColor:
                                NAVY,
                        }}
                    >
                        <ShieldCheck className="h-6 w-6" />
                    </div>

                    <div className="min-w-0">
                        <h1 className="text-base font-extrabold tracking-wide text-[#121A3A] dark:text-white">
                            CCIS
                        </h1>

                        <p className="truncate text-[11px] font-medium text-slate-400">
                            Attendance System
                        </p>
                    </div>

                </div>

                {/* ONLINE STATUS */}

                <div className="mx-4 mt-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900/60 dark:bg-emerald-950/20">

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40">
                        <Wifi className="h-4 w-4" />
                    </div>

                    <div>
                        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                            Online mode
                        </p>

                        <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/60">
                            Ready for attendance
                        </p>
                    </div>

                </div>

                {/* NAV */}

                <nav className="flex-1 px-3 pt-6">

                    <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                        Student Menu
                    </p>

                    <NavItem
                        href="/dashboard"
                        label="Dashboard"
                        icon={
                            <LayoutDashboard className="h-[18px] w-[18px]" />
                        }
                        active={
                            isActive(
                                '/dashboard',
                            )
                        }
                    />

                    <NavItem
                        href="/dashboard#attendance"
                        label="Record Attendance"
                        icon={
                            <CalendarCheck2 className="h-[18px] w-[18px]" />
                        }
                        active={false}
                    />

                    <NavItem
                        href="/dashboard#history"
                        label="Attendance History"
                        icon={
                            <History className="h-[18px] w-[18px]" />
                        }
                        active={false}
                    />

                    <div className="my-5 border-t border-slate-100 dark:border-slate-800" />

                    <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                        Account
                    </p>

                    <NavItem
                        href="/profile"
                        label="Profile"
                        icon={
                            <UserRound className="h-[18px] w-[18px]" />
                        }
                        active={
                            isActive(
                                '/profile',
                            )
                        }
                    />

                    <NavItem
                        href="/settings"
                        label="Settings"
                        icon={
                            <Settings className="h-[18px] w-[18px]" />
                        }
                        active={
                            isActive(
                                '/settings',
                            )
                        }
                    />

                </nav>

                {/* USER */}

                <div className="border-t border-slate-100 p-4 dark:border-slate-800">

                    <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-900/60">

                        <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                            style={{
                                backgroundColor:
                                    NAVY,
                            }}
                        >
                            {getInitials(
                                user?.name,
                            )}
                        </div>

                        <div className="min-w-0 flex-1">

                            <p className="truncate text-xs font-semibold text-slate-700 dark:text-slate-200">
                                {user?.name ||
                                    'Student'}
                            </p>

                            <p className="truncate text-[10px] text-slate-400">
                                {user?.email ||
                                    ''}
                            </p>

                        </div>

                        <ChevronRight className="h-4 w-4 text-slate-400" />

                    </div>

                    <button
                        type="button"
                        onClick={logout}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
                    >
                        <LogOut className="h-4 w-4" />

                        Sign out
                    </button>

                </div>

            </aside>

            {/* =========================================================
                MOBILE HEADER
            ========================================================= */}

            <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:hidden dark:border-slate-800 dark:bg-[#080D1A]/95">

                <Link
                    href="/dashboard"
                    className="flex items-center gap-2.5"
                >
                    <div
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-white"
                        style={{
                            backgroundColor:
                                NAVY,
                        }}
                    >
                        <ShieldCheck className="h-5 w-5" />
                    </div>

                    <div>
                        <p className="text-sm font-extrabold text-[#121A3A] dark:text-white">
                            CCIS
                        </p>

                        <p className="text-[9px] text-slate-400">
                            Attendance System
                        </p>
                    </div>

                </Link>

                <button
                    type="button"
                    onClick={() =>
                        setMobileMenuOpen(
                            true,
                        )
                    }
                    className="rounded-xl border border-slate-200 p-2 text-slate-600 dark:border-slate-700 dark:text-slate-300"
                >
                    <Menu className="h-5 w-5" />
                </button>

            </header>

            {/* =========================================================
                MOBILE DRAWER
            ========================================================= */}

            {mobileMenuOpen && (
                <>
                    <button
                        type="button"
                        aria-label="Close menu"
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
                        onClick={() =>
                            setMobileMenuOpen(
                                false,
                            )
                        }
                    />

                    <aside className="fixed bottom-0 right-0 top-0 z-[60] w-[290px] bg-white p-5 shadow-2xl lg:hidden dark:bg-[#080D1A]">

                        <div className="mb-7 flex items-center justify-between">

                            <div>
                                <p className="font-bold text-[#121A3A] dark:text-white">
                                    Student Menu
                                </p>

                                <p className="text-xs text-slate-400">
                                    Online attendance
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setMobileMenuOpen(
                                        false,
                                    )
                                }
                                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <X className="h-5 w-5" />
                            </button>

                        </div>

                        <div className="space-y-1">

                            <MobileNav
                                href="/dashboard"
                                label="Dashboard"
                                icon={
                                    <LayoutDashboard className="h-5 w-5" />
                                }
                                onClick={() =>
                                    setMobileMenuOpen(
                                        false,
                                    )
                                }
                            />

                            <MobileNav
                                href="/dashboard#attendance"
                                label="Record Attendance"
                                icon={
                                    <CalendarCheck2 className="h-5 w-5" />
                                }
                                onClick={() =>
                                    setMobileMenuOpen(
                                        false,
                                    )
                                }
                            />

                            <MobileNav
                                href="/dashboard#history"
                                label="Attendance History"
                                icon={
                                    <History className="h-5 w-5" />
                                }
                                onClick={() =>
                                    setMobileMenuOpen(
                                        false,
                                    )
                                }
                            />

                            <MobileNav
                                href="/profile"
                                label="Profile"
                                icon={
                                    <UserRound className="h-5 w-5" />
                                }
                                onClick={() =>
                                    setMobileMenuOpen(
                                        false,
                                    )
                                }
                            />

                        </div>

                        <button
                            type="button"
                            onClick={logout}
                            className="absolute bottom-6 left-5 right-5 flex items-center justify-center gap-2 rounded-xl border border-red-200 py-3 text-sm font-semibold text-red-600 dark:border-red-900/60"
                        >
                            <LogOut className="h-4 w-4" />

                            Sign out
                        </button>

                    </aside>
                </>
            )}

            {/* =========================================================
                PAGE CONTENT
            ========================================================= */}

            <main className="min-h-screen pt-16 lg:ml-[270px] lg:pt-0">

                {children}

            </main>

            {/* =========================================================
                MOBILE BOTTOM NAV
            ========================================================= */}

            <nav className="fixed bottom-0 left-0 right-0 z-40 grid h-[68px] grid-cols-3 border-t border-slate-200 bg-white/95 px-2 backdrop-blur lg:hidden dark:border-slate-800 dark:bg-[#080D1A]/95">

                <BottomNav
                    href="/dashboard"
                    label="Home"
                    icon={
                        <LayoutDashboard className="h-5 w-5" />
                    }
                />

                <BottomNav
                    href="/dashboard#attendance"
                    label="Attend"
                    highlight
                    icon={
                        <CalendarCheck2 className="h-5 w-5" />
                    }
                />

                <BottomNav
                    href="/dashboard#history"
                    label="History"
                    icon={
                        <History className="h-5 w-5" />
                    }
                />

            </nav>

        </div>
    );
}

function NavItem({
    href,
    label,
    icon,
    active,
}: {
    href: string;
    label: string;
    icon: ReactNode;
    active: boolean;
}) {
    return (
        <Link
            href={href}
            className={`mb-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                active
                    ? 'bg-[#121A3A] text-white shadow-sm dark:bg-[#D39A2C] dark:text-[#121A3A]'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-[#121A3A] dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
            }`}
        >
            {icon}

            <span>
                {label}
            </span>
        </Link>
    );
}

function MobileNav({
    href,
    label,
    icon,
    onClick,
}: {
    href: string;
    label: string;
    icon: ReactNode;
    onClick: () => void;
}) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
            {icon}

            {label}
        </Link>
    );
}

function BottomNav({
    href,
    label,
    icon,
    highlight = false,
}: {
    href: string;
    label: string;
    icon: ReactNode;
    highlight?: boolean;
}) {
    return (
        <Link
            href={href}
            className="flex flex-col items-center justify-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400"
        >
            {highlight ? (
                <div
                    className="-mt-5 flex h-11 w-11 items-center justify-center rounded-full text-white shadow-lg"
                    style={{
                        backgroundColor:
                            GOLD,
                    }}
                >
                    {icon}
                </div>
            ) : (
                icon
            )}

            {label}
        </Link>
    );
}

function getInitials(
    name?: string,
) {
    if (!name) {
        return 'ST';
    }

    const parts =
        name.trim().split(/\s+/);

    if (parts.length === 1) {
        return parts[0]
            .substring(0, 2)
            .toUpperCase();
    }

    return (
        parts[0][0] +
        parts[parts.length - 1][0]
    ).toUpperCase();
}