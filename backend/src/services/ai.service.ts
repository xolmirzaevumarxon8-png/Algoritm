// AI Service Integration Skeleton
// Expects an LLM API Key (e.g., OPENAI_API_KEY) in .env

export class AIService {
  
  /**
   * Generates a 10-question multiple choice quiz based on a topic
   */
  static async generateQuiz(topic: string, difficulty: string = 'intermediate'): Promise<any> {
    console.log(`[AI] Generating ${difficulty} quiz for: ${topic}`);
    // MOCK RESPONSE
    return [
      { question: `What is the core concept of ${topic}?`, options: ['A', 'B', 'C', 'D'], answer: 'A' }
    ];
  }

  /**
   * Generates a lesson plan for teachers
   */
  static async generateLessonPlan(courseName: string, durationMinutes: number): Promise<string> {
    console.log(`[AI] Generating lesson plan for ${courseName} (${durationMinutes} mins)`);
    return `### Lesson Plan for ${courseName}\n\n1. Introduction (10m)\n2. Core Concepts (30m)\n3. Practice (10m)\n4. Q&A (10m)`;
  }

  /**
   * Student Programming Helper (Explains code snippets)
   */
  static async explainCode(codeSnippet: string): Promise<string> {
    console.log(`[AI] Explaining code snippet`);
    return `This code defines a function that...`;
  }
}
