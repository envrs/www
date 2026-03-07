import { NextRequest, NextResponse } from 'next/server';
import {
  exchangeGitHubCode,
  getGitHubUser,
  upsertUser,
  getUserOrganizations,
} from '@/lib/auth/github-oauth';
import { getSupabaseServiceClient } from '@/lib/supabase/server';
import { getEnv } from '@/lib/env';

/**
 * GitHub OAuth callback handler
 * Exchanges authorization code for user session
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      return NextResponse.json(
        { error: 'Missing authorization code' },
        { status: 400 }
      );
    }

    console.log('[v0] GitHub OAuth callback received');

    // Exchange code for access token
    const accessToken = await exchangeGitHubCode(code);

    // Get GitHub user info
    const githubUser = await getGitHubUser(accessToken);

    // Store user in database
    const user = await upsertUser(githubUser, accessToken);

    // Fetch and store user's organizations
    const orgs = await getUserOrganizations(accessToken);
    const supabase = await getSupabaseServiceClient();

    for (const org of orgs) {
      await supabase.from('organizations').upsert(
        {
          github_id: org.id,
          github_login: org.login,
          name: org.name,
          avatar_url: org.avatar_url,
          user_id: user.id,
        },
        { onConflict: 'github_id' }
      );
    }

    console.log(`[v0] User authenticated: ${githubUser.login}`);

    // Create session cookie and redirect
    const env = getEnv();
    const response = NextResponse.redirect(
      `${env.NEXTAUTH_URL}/dashboard`,
      { status: 302 }
    );

    // Store session token in secure HTTP-only cookie
    response.cookies.set({
      name: 'session_token',
      value: accessToken,
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error) {
    console.error('[v0] GitHub OAuth error:', error);

    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/auth/signin?error=oauth_failed`,
      { status: 302 }
    );
  }
}
