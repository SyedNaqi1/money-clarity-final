import "./globals.css";

export const metadata = {
  title: "Money Clarity",
  description: "Simple money management for small businesses.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
