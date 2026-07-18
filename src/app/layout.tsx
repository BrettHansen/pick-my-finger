import type { Metadata } from 'next';
import { Geist, Geist_Mono, Black_Ops_One } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

const blackOpsOne = Black_Ops_One({
    variable: '--font-display',
    weight: '400',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'Pick My Finger',
    description: 'Random finger picker app for mobile browser',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
            <body className={`${geistSans.variable} ${geistMono.variable} ${blackOpsOne.variable} antialiased`}>{children}</body>
        </html>
    );
}
