# Aqara Partner Invite - TODO

## DB & Backend
- [x] DB 스키마: survey_responses 테이블 (사업체명, 담당자명, 연락처, 이메일, 관심제품, 예상판매량, 기타문의, 타임스탬프)
- [x] DB 스키마: survey_responses 마이그레이션 SQL 실행
- [x] server/db.ts: 설문 응답 저장 쿼리 함수
- [x] server/routers.ts: 설문 제출 publicProcedure
- [x] server/routers.ts: 관리자 응답 조회 protectedProcedure
- [x] server/routers.ts: CSV 다운로드 (프론트엔드 클라이언트 사이드)

## Frontend - Landing Page
- [x] index.css: 아카라 브랜드 컬러(검정/골드) 테마 설정
- [x] client/index.html: Google Fonts (Noto Sans KR / Noto Serif KR) 추가
- [x] 랜딩 페이지 히어로 섹션 (로고, 헤드라인, CTA)
- [x] 행사 개요 섹션 (일시, 장소, 네이버 지도 링크)
- [x] 프로그램 일정 섹션
- [x] 참석 혜택 섹션
- [x] 제품 소개 섹션 (K100/L100/U100 이미지)
- [x] 사전 설문 폼 섹션 (12개 질문, 5개 섹션)
- [x] 설문 제출 완료 확인 페이지 (SurveySuccess)

## Frontend - Admin Dashboard
- [x] 관리자 로그인 보호 라우트
- [x] 설문 응답 목록 테이블
- [x] CSV 다운로드 버튼

## Invite Card
- [x] 초대장 카드 이미지 생성 (AI)
- [x] 초대장 공유 페이지 (/invite)
- [x] 링크 복사 / 카카오톡 공유 기능

## Assets
- [x] 아카라 로고 CDN 업로드
- [x] 도어락 K100 이미지 CDN 업로드
- [x] 도어락 L100 이미지 CDN 업로드
- [x] 도어락 U100 이미지 CDN 업로드
- [x] 초대장 카드 이미지 CDN 업로드

## QA
- [x] 모바일 반응형 확인
- [x] TypeScript 오류 없음
- [x] Vitest 테스트 작성 (7개 테스트 통과)
