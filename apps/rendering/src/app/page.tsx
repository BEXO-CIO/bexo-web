import { redirect } from 'next/navigation';

/**
 * Root page — the rendering app serves portfolios at /p/[handle] or via
 * subdomains. The bare root redirects to the main BEXO marketing site.
 */
export default function RootPage() {
  redirect('https://mybexo.com');
}
