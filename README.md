# AI 학생 공부계획 웹앱

Vercel에 즉시 배포 가능한 AI 학습 플래너 프로젝트입니다.

## 파일 구조
- `index.html`: 프론트엔드 UI (화이트/블루 톤, 입력창, 2분할 출력창, 수정 모달)
- `api/generate.js`: Gemini API 호출 Vercel Serverless Function
- `vercel.json`: Vercel 배포 설정 파일

## Vercel 배포 방법
1. 본 압축 파일의 해제 후 GitHub 리포지토리에 푸시합니다.
2. [Vercel](https://vercel.com)에서 해당 리포지토리를 가져옵니다(Import).
3. **Environment Variables**에 아래 키를 등록합니다:
   - `GEMINI_API_KEY`: Google AI Studio에서 발급받은 Gemini API 키
4. Deploy 버튼을 눌러 배포를 완료합니다.
