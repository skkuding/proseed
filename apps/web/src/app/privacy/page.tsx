// ⚠️ 법률 전문가 검토 전 초안 (#73). 게시 전 변호사 검토 + legalInfo.ts의 미정값 확정 필수.
import type { Metadata } from 'next'
import { LegalDocument } from '@/app/_components/legal/LegalDocument'
import { LegalSection } from '@/app/_components/legal/LegalSection'
import { LEGAL_INFO } from '@/app/_utils/legalInfo'

export const metadata: Metadata = {
  title: '개인정보처리방침 | PROSEED',
  description: 'Proseed 개인정보처리방침',
}

export default function PrivacyPage() {
  return (
    <LegalDocument title="개인정보처리방침" effectiveDate={LEGAL_INFO.effectiveDate}>
      <p className="text-body3_r_16 leading-relaxed text-CoolNeutral-30">
        {LEGAL_INFO.company}(이하 &lsquo;회사&rsquo;)는 「개인정보 보호법」에 따라 이용자의
        개인정보를 보호하고 관련 고충을 신속히 처리하기 위하여 다음과 같이 개인정보처리방침을
        수립·공개합니다.
      </p>

      <LegalSection heading="제1조 (수집하는 개인정보 항목)">
        <p>회사는 회원가입 및 서비스 제공을 위해 아래와 같이 개인정보를 수집합니다.</p>
        <ul className="flex flex-col gap-2 pl-4">
          <li className="list-disc">
            <span className="font-semibold text-CoolNeutral-20">필수:</span> 이메일 주소
          </li>
          <li className="list-disc">
            <span className="font-semibold text-CoolNeutral-20">선택:</span> 프로필 사진, 직무,
            자기소개, 생년
          </li>
          <li className="list-disc">
            <span className="font-semibold text-CoolNeutral-20">자동 수집:</span> 닉네임(자동 부여),
            세션 정보, 쿠키, 접속 로그(접속 일시·IP 주소·브라우저 정보)
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="제2조 (개인정보의 수집·이용 목적)">
        <p>회사는 수집한 개인정보를 다음 목적으로만 이용합니다.</p>
        <ul className="flex flex-col gap-2 pl-4">
          <li className="list-disc">회원 가입 및 본인 식별, 계정 관리</li>
          <li className="list-disc">프로젝트 공유·피드백 등 핵심 서비스 제공</li>
          <li className="list-disc">문의 응대 및 공지 전달</li>
          <li className="list-disc">서비스 이용 통계 분석 및 품질 개선</li>
        </ul>
      </LegalSection>

      <LegalSection heading="제3조 (개인정보의 보유·이용 기간 및 파기)">
        <p>
          회사는 원칙적으로 회원 탈퇴 시 지체 없이 개인정보를 파기합니다. 다만 관계 법령에 따라
          보존이 필요한 경우 해당 기간 동안 보관합니다.
        </p>
        <p>
          파기 절차: 파기 사유가 발생한 개인정보는 내부 방침 및 관계 법령에 따라 지체 없이
          파기합니다. 전자적 파일 형태는 복구·재생이 불가능한 방법으로 삭제하며, 출력물은 분쇄하거나
          소각합니다.
        </p>
      </LegalSection>

      <LegalSection heading="제4조 (개인정보의 제3자 제공)">
        <p>
          회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만 소셜 로그인을 통해
          가입하는 경우, 아래 소셜 로그인 제공자와 인증에 필요한 최소한의 정보를 주고받습니다.
        </p>
        <ul className="flex flex-col gap-2 pl-4">
          <li className="list-disc">Google (Google 계정 로그인)</li>
          <li className="list-disc">Kakao (카카오 계정 로그인)</li>
          <li className="list-disc">Naver (네이버 계정 로그인)</li>
        </ul>
      </LegalSection>

      <LegalSection heading="제5조 (개인정보 처리의 위탁)">
        <p>회사는 안정적인 서비스 운영을 위해 아래와 같이 개인정보 처리를 위탁합니다.</p>
        <ul className="flex flex-col gap-2 pl-4">
          <li className="list-disc">
            Amazon Web Services (AWS) — 서비스 인프라 및 데이터 저장·처리
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="제6조 (정보주체의 권리와 행사 방법)">
        <p>
          이용자는 언제든지 자신의 개인정보에 대해 열람, 정정, 삭제, 처리정지를 요구할 수 있습니다.
          권리 행사는 아래 개인정보 보호책임자에게 서면·이메일로 요청할 수 있으며, 회사는 지체 없이
          조치합니다.
        </p>
      </LegalSection>

      <LegalSection heading="제7조 (만 14세 미만 아동의 가입 제한)">
        <p>
          회사는 만 {LEGAL_INFO.minAge}세 이상인 이용자에 한하여 가입을 허용합니다. 만{' '}
          {LEGAL_INFO.minAge}세 미만 아동의 개인정보는 수집하지 않습니다.
        </p>
      </LegalSection>

      <LegalSection heading="제8조 (개인정보 보호책임자)">
        <p>
          회사는 개인정보 처리에 관한 업무를 총괄하고 관련 문의·불만을 처리하기 위하여 아래와 같이
          개인정보 보호책임자를 지정합니다.
        </p>
        <ul className="flex flex-col gap-2 pl-4">
          <li className="list-disc">개인정보 보호책임자: {LEGAL_INFO.privacyOfficerName}</li>
          <li className="list-disc">연락처: {LEGAL_INFO.privacyOfficerContact}</li>
          <li className="list-disc">문의 이메일: {LEGAL_INFO.csEmail}</li>
        </ul>
      </LegalSection>

      <LegalSection heading="제9조 (사업자 정보)">
        <ul className="flex flex-col gap-2 pl-4">
          <li className="list-disc">상호: {LEGAL_INFO.company}</li>
          <li className="list-disc">사업장 주소: {LEGAL_INFO.address}</li>
        </ul>
      </LegalSection>

      <LegalSection heading="제10조 (처리방침의 변경)">
        <p>
          이 개인정보처리방침은 시행일부터 적용되며, 법령·정책 또는 서비스 변경에 따라 내용이 추가·
          삭제·수정되는 경우 변경 사항을 시행 최소 7일 전에 공지합니다.
        </p>
      </LegalSection>
    </LegalDocument>
  )
}
