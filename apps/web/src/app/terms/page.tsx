// 사업자/연락처 등 확정 정보는 legalInfo.ts(SSOT)에서 주입한다.
import type { Metadata } from 'next'
import { LegalDocument } from '@/app/_components/legal/LegalDocument'
import { LegalSection } from '@/app/_components/legal/LegalSection'
import { LEGAL_INFO } from '@/app/_utils/legalInfo'

export const metadata: Metadata = {
  title: '이용약관 | PROSEED',
  description: 'Proseed 서비스 이용약관',
}

export default function TermsPage() {
  return (
    <LegalDocument title="이용약관" effectiveDate={LEGAL_INFO.effectiveDate}>
      <LegalSection heading="제1조 (목적)">
        <p>
          이 약관은 {LEGAL_INFO.company}(이하 &lsquo;회사&rsquo;)가 제공하는{' '}
          {LEGAL_INFO.serviceName} 서비스(이하 &lsquo;서비스&rsquo;)의 이용과 관련하여 회사와 이용자
          간의 권리·의무 및 책임 사항을 규정함을 목적으로 합니다.
        </p>
      </LegalSection>

      <LegalSection heading="제2조 (정의)">
        <ul className="flex flex-col gap-2 pl-4">
          <li className="list-disc">
            &lsquo;서비스&rsquo;란 회사가 제공하는 프로젝트 공유·피드백 등 일체의 기능을 말합니다.
          </li>
          <li className="list-disc">
            &lsquo;이용자&rsquo;란 이 약관에 따라 서비스를 이용하는 회원을 말합니다.
          </li>
          <li className="list-disc">
            &lsquo;게시물&rsquo;이란 이용자가 서비스에 등록한 프로젝트, 피드백, 텍스트, 이미지 등
            일체의 콘텐츠를 말합니다.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="제3조 (약관의 효력 및 변경)">
        <p>
          이 약관은 서비스 화면에 게시함으로써 효력이 발생합니다. 회사는 관련 법령을 위반하지 않는
          범위에서 약관을 변경할 수 있으며, 변경 시 시행 최소 7일 전에 공지합니다.
        </p>
      </LegalSection>

      <LegalSection heading="제4조 (회원가입 및 자격)">
        <p>
          서비스는 만 {LEGAL_INFO.minAge}세 이상인 자에 한하여 가입할 수 있습니다. 이용자는 소셜
          로그인(Google, Kakao, Naver)을 통해 회원으로 가입할 수 있습니다.
        </p>
      </LegalSection>

      <LegalSection heading="제5조 (회원의 의무 및 금지행위)">
        <p>이용자는 다음 행위를 하여서는 안 됩니다.</p>
        <ul className="flex flex-col gap-2 pl-4">
          <li className="list-disc">타인의 정보를 도용하거나 허위 정보를 등록하는 행위</li>
          <li className="list-disc">타인의 저작권 등 권리를 침해하는 행위</li>
          <li className="list-disc">
            서비스 운영을 방해하거나 법령·공서양속에 반하는 게시물을 등록하는 행위
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="제6조 (서비스 내용)">
        <p>회사는 프로젝트 공유 및 피드백 기능을 제공합니다.</p>
      </LegalSection>

      <LegalSection heading="제7조 (게시물의 저작권 및 책임)">
        <p>
          이용자가 등록한 게시물의 저작권은 해당 이용자에게 귀속됩니다. 이용자는 회사가 서비스 운영·
          홍보를 위해 필요한 범위에서 게시물을 노출·이용하는 것에 동의합니다. 게시물로 인해 발생하는
          법적 책임은 게시한 이용자에게 있습니다.
        </p>
      </LegalSection>

      <LegalSection heading="제8조 (서비스의 중단)">
        <p>
          회사는 시스템 점검·교체·고장, 통신 두절 등 부득이한 사유가 있는 경우 서비스 제공을 일시적
          으로 중단할 수 있으며, 이 경우 사전 또는 사후에 공지합니다.
        </p>
      </LegalSection>

      <LegalSection heading="제9조 (면책)">
        <p>
          회사는 천재지변, 이용자의 귀책사유로 인한 서비스 이용 장애에 대하여 책임을 지지 않습니다.
          회사는 이용자 간 또는 이용자와 제3자 간에 발생한 분쟁에 개입하지 않으며 그에 대한 책임을
          지지 않습니다.
        </p>
      </LegalSection>

      <LegalSection heading="제10조 (준거법 및 관할)">
        <p>
          이 약관은 대한민국 법령에 따라 규율되며, 서비스 이용과 관련하여 회사와 이용자 간에 발생한
          분쟁에 대해서는 민사소송법상의 관할 법원을 관할 법원으로 합니다.
        </p>
      </LegalSection>

      <LegalSection heading="제11조 (사업자 정보 및 문의)">
        <ul className="flex flex-col gap-2 pl-4">
          <li className="list-disc">상호: {LEGAL_INFO.company}</li>
          <li className="list-disc">사업장 주소: {LEGAL_INFO.address}</li>
          <li className="list-disc">문의 이메일: {LEGAL_INFO.csEmail}</li>
        </ul>
      </LegalSection>
    </LegalDocument>
  )
}
