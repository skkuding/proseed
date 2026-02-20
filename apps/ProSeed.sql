CREATE TABLE "성장기록" (
	"아이디"	BIGINT		NOT NULL,
	"프로젝트 아이디"	BIGINT		NOT NULL,
	"버전"	String		NULL,
	"카테고리"	ENUM		NULL,
	"업데이트 목표"	String		NULL,
	"생성시간"	TIMESTAMP		NULL,
	"수정시간"	TIMESTAMP		NULL,
	"업데이트 결과물"	List<String>		NULL
);

CREATE TABLE "프로젝트 역할" (
	"아이디"	BIGINT		NOT NULL,
	"유저 아이디"	BIGINT		NOT NULL,
	"프로젝트 아이디"	BIGINT		NOT NULL,
	"역할"	ENUM		NULL
);

CREATE TABLE "사용자" (
	"아이디"	BIGINT		NOT NULL,
	"OAuth 제공 아이디"	String		NULL,
	"로그인 방식(KAKAO, NAVER 등)"	ENUM		NULL,
	"이름"	String		NULL,
	"전화번호"	String		NULL,
	"이메일 주소"	String		NULL,
	"생성시간"	TIMESTAMP		NULL,
	"소유한 티켓 개수"	INT		NULL
);

CREATE TABLE "피드백 질문" (
	"아이디"	BIGINT		NOT NULL,
	"프로젝트 아이디"	BIGINT		NOT NULL,
	"카테고리"	ENUM		NULL,
	"제목"	String		NULL,
	"세부 설명"	String		NULL,
	"순서"	Int		NULL,
	"필수 여부"	Boolean		NULL
);

CREATE TABLE "성장기록 내용" (
	"아이디"	BIGINT		NOT NULL,
	"성장기록 아이디"	BIGINT		NOT NULL,
	"프로젝트 아이디"	BIGINT		NOT NULL,
	"제목"	String		NULL,
	"본문"	String		NULL,
	"기본질문 여부"	Boolean		NULL
);

CREATE TABLE "프로젝트" (
	"아이디"	BIGINT		NOT NULL,
	"제목"	String		NULL,
	"한 줄 설명"	String		NULL,
	"설명 내용"	String		NULL,
	"카테고리"	ENUM		NULL,
	"상태"	String		NULL,
	"연락 가능한 경로"	String		NULL,
	"프로젝트 링크"	String		NULL
);

CREATE TABLE "피드백" (
	"아이디"	BIGINT		NOT NULL,
	"질문 아이디"	BIGINT		NOT NULL,
	"프로젝트 아이디"	BIGINT		NOT NULL,
	"작성 유저 아이디"	BIGINT		NOT NULL,
	"본문"	String		NULL
);

ALTER TABLE "성장기록" ADD CONSTRAINT "PK_성장기록" PRIMARY KEY (
	"아이디",
	"프로젝트 아이디"
);

ALTER TABLE "프로젝트 역할" ADD CONSTRAINT "PK_프로젝트 역할" PRIMARY KEY (
	"아이디",
	"유저 아이디",
	"프로젝트 아이디"
);

ALTER TABLE "사용자" ADD CONSTRAINT "PK_사용자" PRIMARY KEY (
	"아이디"
);

ALTER TABLE "피드백 질문" ADD CONSTRAINT "PK_피드백 질문" PRIMARY KEY (
	"아이디",
	"프로젝트 아이디"
);

ALTER TABLE "성장기록 내용" ADD CONSTRAINT "PK_성장기록 내용" PRIMARY KEY (
	"아이디",
	"성장기록 아이디",
	"프로젝트 아이디"
);

ALTER TABLE "프로젝트" ADD CONSTRAINT "PK_프로젝트" PRIMARY KEY (
	"아이디"
);

ALTER TABLE "피드백" ADD CONSTRAINT "PK_피드백" PRIMARY KEY (
	"아이디",
	"질문 아이디",
	"프로젝트 아이디",
	"작성 유저 아이디"
);

ALTER TABLE "성장기록" ADD CONSTRAINT "FK_프로젝트_TO_성장기록_1" FOREIGN KEY (
	"프로젝트 아이디"
)
REFERENCES "프로젝트" (
	"아이디"
);

ALTER TABLE "프로젝트 역할" ADD CONSTRAINT "FK_사용자_TO_프로젝트 역할_1" FOREIGN KEY (
	"유저 아이디"
)
REFERENCES "사용자" (
	"아이디"
);

ALTER TABLE "프로젝트 역할" ADD CONSTRAINT "FK_프로젝트_TO_프로젝트 역할_1" FOREIGN KEY (
	"프로젝트 아이디"
)
REFERENCES "프로젝트" (
	"아이디"
);

ALTER TABLE "피드백 질문" ADD CONSTRAINT "FK_프로젝트_TO_피드백 질문_1" FOREIGN KEY (
	"프로젝트 아이디"
)
REFERENCES "프로젝트" (
	"아이디"
);

ALTER TABLE "성장기록 내용" ADD CONSTRAINT "FK_성장기록_TO_성장기록 내용_1" FOREIGN KEY (
	"성장기록 아이디"
)
REFERENCES "성장기록" (
	"아이디"
);

ALTER TABLE "성장기록 내용" ADD CONSTRAINT "FK_성장기록_TO_성장기록 내용_2" FOREIGN KEY (
	"프로젝트 아이디"
)
REFERENCES "성장기록" (
	"프로젝트 아이디"
);

ALTER TABLE "피드백" ADD CONSTRAINT "FK_피드백 질문_TO_피드백_1" FOREIGN KEY (
	"질문 아이디"
)
REFERENCES "피드백 질문" (
	"아이디"
);

ALTER TABLE "피드백" ADD CONSTRAINT "FK_피드백 질문_TO_피드백_2" FOREIGN KEY (
	"프로젝트 아이디"
)
REFERENCES "피드백 질문" (
	"프로젝트 아이디"
);

ALTER TABLE "피드백" ADD CONSTRAINT "FK_사용자_TO_피드백_1" FOREIGN KEY (
	"작성 유저 아이디"
)
REFERENCES "사용자" (
	"아이디"
);

