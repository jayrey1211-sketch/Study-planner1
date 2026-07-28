export default async function handler(req, res) {
  // POST 요청만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY 환경변수가 설정되지 않았습니다.' });
  }

  try {
    const { status, goal, duration, academy, subjects, scope, customRequest } = req.body;

    // AI에게 전달할 프롬프트 구성
    const prompt = `
당신은 대한민국 최고의 학습 컨설팅 전문가입니다. 아래 학생의 정보를 바탕으로 맞춤형 학습 계획을 수립해 주세요.

[학생 정보]
- 현재 신분: ${status}
- 공부 목표: ${goal}
- 공부 기간: ${duration}
- 학원 스케줄: ${academy || '없음'}
- 공부 과목: ${subjects}
- 공부 범위: ${scope}
${customRequest ? `- 수정/추가 요청사항: ${customRequest}` : ''}

[작성 가이드라인]
1. 학원 스케줄을 피해서 자습 가능한 시간에 과목별 최적 배분을 해주세요.
2. 타임테이블 항목은 요일(월~일)별 추천 공부 스케줄(시간대, 과목, 내용) 형태로 작성해주세요.
3. 상세 설명에는 효과적인 공부법, 인터넷 강의 및 유튜브 추천 검색 키워드, 검증된 문제집 활용 팁, 주기별 복습 전략을 포함해주세요.

[응답 형식 - 반드시 JSON 구조로 응답]
{
  "timetable": [
    {"day": "월요일", "tasks": ["18:00~19:30 수학 2단원 개념정리", "20:00~21:30 영어 단어 및 암기"]},
    {"day": "화요일", "tasks": ["17:00~19:00 국어 지문 독해", "19:30~21:00 한국사 기출문제"]},
    {"day": "수요일", "tasks": ["19:30~21:30 수학 유형 문제 풀이"]},
    {"day": "목요일", "tasks": ["17:00~19:00 영어 구문 독해", "19:30~21:00 국어 문학 정리"]},
    {"day": "금요일", "tasks": ["19:30~21:30 주간 오답노트 작성 및 복습"]},
    {"day": "토요일", "tasks": ["10:00~12:00 전 과목 미진한 부분 보완", "14:00~17:00 모의고사/실전 문제 풀이"]},
    {"day": "일요일", "tasks": ["14:00~16:00 한국사 총정리", "오후 휴식 및 차주 계획 수립"]}
  ],
  "description": "### 📘 맞춤형 학습 전략 및 팁\\n\\n1. **과목별 학습 포인트**\\n- **수학:** 학원 수업 전후 30분 복습을 통해 개념을 완벽 숙지하세요.\\n- **국어:** EBS 및 유튜브의 핵심 요약 강의를 적극 활용하세요.\\n\\n2. **추천 참고자료 및 검색어**\\n- 유튜브 검색어: '${goal} ${subjects} 30분 총정리'\\n- 메가스터디/EBS 무료 특강 파이널 시리즈 활용 추천\\n\\n3. **복습 알고리즘 (에빙하우스 망각곡선 활용)**\\n- 당일 학습 후 10분 간이 복습, 3일 뒤 오답노트 회독을 권장합니다."
}
`;

    // Gemini API 호출 (gemini-3.1-flash-lite 모델 사용)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errData = await response.text();
      throw new Error(`Gemini API Error: ${errData}`);
    }

    const data = await response.json();
    const resultText = data.candidates[0].content.parts[0].text;
    const parsedData = JSON.parse(resultText);

    return res.status(200).json(parsedData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: '계획 생성 중 오류가 발생했습니다: ' + error.message });
  }
}
