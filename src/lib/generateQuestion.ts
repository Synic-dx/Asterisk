import axios from "axios";

export async function generateQuestion({
  subjectCode,
  subjectName,
  level,
  topic,
  subtopic,
  difficultyRating,
}: {
  subjectCode: string;
  subjectName: string;
  level: string;
  topic: string;
  subtopic: string;
  difficultyRating: number;
}) {
  try {
    const apiUrl = `http://${process.env.NEXT_PUBLIC_BASE_URL}/api/generate-mcq`;

    const response = await axios.post(
      apiUrl,
      {
        subjectCode,
        subjectName,
        level,
        topic,
        subtopic,
        difficultyRating,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error generating question:", error);
    return null;
  }
}
