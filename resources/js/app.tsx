import { createInertiaApp } from '@inertiajs/react';

import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

import { initializeTheme } from '@/hooks/use-appearance';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const appName =
    import.meta.env.VITE_APP_NAME ||
    'CCIS Attendance System';

createInertiaApp({
    title: (title) =>
        title
            ? `${title} - ${appName}`
            : appName,

    layout: (name) => {
        switch (true) {
            // Landing page
            case name === 'welcome':
                return null;

            // Login / register / verify face
            case name.startsWith('auth/'):
                return null;

            // Student dashboard has its own full-page UI
            case name === 'dashboard':
                return null;

            // Settings may still use starter layout
            case name.startsWith('settings/'):
                return [
                    AppLayout,
                    SettingsLayout,
                ];

            // Admin / organizer can continue using layout
            default:
                return AppLayout;
        }
    },

    strictMode: true,

    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}

                <Toaster />
            </TooltipProvider>
        );
    },

    progress: {
        color: '#D39A2C',
    },
});

initializeTheme();