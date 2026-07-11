import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getPortfolioDataByUserId } from '../../../../lib/db';
import { MinimalTemplate } from '../../../../components/templates/MinimalTemplate';
import { AcademicTemplate } from '../../../../components/templates/AcademicTemplate';
import { CreativeTemplate } from '../../../../components/templates/CreativeTemplate';

interface PageProps {
  params: Promise<{ userId: string; templateId: string }>;
}

/**
 * Metadata for preview pages — not indexed by search engines.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { userId, templateId } = await params;
  const data = await getPortfolioDataByUserId(userId, templateId);

  if (!data) {
    return {
      title: 'Preview Unavailable | BEXO',
      robots: 'noindex, nofollow',
    };
  }

  return {
    title: `Preview — ${data.user.name || 'Your Portfolio'} | BEXO`,
    description: `Live preview using the "${templateId}" template.`,
    robots: 'noindex, nofollow',
  };
}

/**
 * Live preview route for the web app's template picker (Step 8).
 *
 * URL: /preview/[userId]/[templateId]
 *
 * - Does NOT require is_published — renders draft data.
 * - templateId overrides the stored selection so the user can try
 *   different templates before committing.
 * - Fully stateless — no session, no cookies required.
 */
export default async function PreviewPage({ params }: PageProps) {
  const { userId, templateId } = await params;
  const data = await getPortfolioDataByUserId(userId, templateId);

  if (!data) {
    notFound();
  }

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
