import { NextResponse, type NextRequest } from 'next/server'

// better-auth 기본 세션 쿠키 이름. https(보안 연결)에서는 "__Secure-" 접두사가 붙는다.
// (better-auth/cookies의 getSessionCookie는 Edge 런타임에서 번들링 에러가 나서 직접 쿠키를 확인한다)
const SESSION_COOKIE_NAMES = ['better-auth.session_token', '__Secure-better-auth.session_token']

// 로그인해야만 접근 가능한 경로. 헤더 클릭 시의 로그인 모달과 별개로,
// URL 직접 입력으로 로그인 체크를 우회하는 것을 막기 위한 라우트 레벨 가드.
function isProtectedPath(pathname: string): boolean {
  if (pathname === '/myproject' || pathname.startsWith('/myproject/')) return true
  if (pathname === '/mypage' || pathname.startsWith('/mypage/')) return true
  if (/^\/projects\/[^/]+\/(register|editmyproject|growthrecord)(\/|$)/.test(pathname)) {
    return true
  }
  return false
}

export function proxy(request: NextRequest) {
  if (!isProtectedPath(request.nextUrl.pathname)) {
    return NextResponse.next()
  }

  // 세션 쿠키 존재 여부만 확인(가벼운 프리즌스 체크) — 실제 유효성은 각 API 요청에서 검증됨
  const hasSessionCookie = SESSION_COOKIE_NAMES.some((name) => request.cookies.has(name))
  if (hasSessionCookie) {
    return NextResponse.next()
  }

  const url = request.nextUrl.clone()
  url.pathname = '/'
  url.search = ''
  url.searchParams.set('requireLogin', '1')
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/myproject/:path*', '/mypage/:path*', '/projects/:path*'],
}
