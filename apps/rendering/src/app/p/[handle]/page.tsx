import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getPortfolioData } from '../../../lib/db';
import { MinimalTemplate } from '../../../components/templates/MinimalTemplate';
import { AcademicTemplate } from '../../../components/templates/AcademicTemplate';
import { CreativeTemplate } from '../../../components/templates/CreativeTemplate';

interface PageProps {
  params: Promise<{ handle: string }>;
}

/**
 * Dynamic SEO metadata for path-based portfolio URLs (/p/kavin).
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const data = await getPortfolioData(handle);

  if (!data) {
    return {
      title: 'Portfolio Not Found | BEXO',
      description: 'The requested BEXO portfolio does not exist or is not published yet.',
    };
  }

  const title = `${data.user.name || handle} | BEXO Portfolio`;
  const description =
    data.profile.headline ||
    data.profile.bio ||
    `Professional portfolio of ${data.user.name || handle} on the BEXO network.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
      username: handle,
    },
    robots: data.portfolio.is_indexable ? 'index, follow' : 'noindex, nofollow',
  };
}

/**
 * Path-based public portfolio page: /p/[handle]
 * Mirrors the subdomain route but accessible without DNS configuration.
 */
export default async function PathPortfolioPage({ params }: PageProps) {
  const { handle } = await params;
  const data = await getPortfolioData(handle);

  if (!data) {
    notFound();
  }

  const templateId = data.portfolio.selected_template_id || 'minimal';

  switch (templateId.toLowerCase()) {
    case 'academic':
      return <AcademicTemplate data={data} />;
    case 'creative':
      return <CreativeTemplate data={data} />;
    case 'minimal':
    default:
      return <MinimalTemplate data={data} />;
  }
}
