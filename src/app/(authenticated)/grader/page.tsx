'use client'
import { useEffect, useState } from "react";
import { Center, Text, Button, Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Input, Textarea, Flex, Spinner } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { NextPage } from "next";
import axios from "axios";

// Styling Constants
const headingSize = "lg";
const headingFont = "Gothic A1, Roboto, sans-serif";
const textSize = "md";
const textFont = "Karla, sans-serif";
const headingColor = "#130529";
const textColor = "#271144";

const Grader: NextPage = () => {
  const { data: session, status } = useSession();
  const [hasGraderAccess, setHasGraderAccess] = useState<boolean | null>(null);
  const [subjectCode, setSubjectCode] = useState<string>("");
  const [subjectName, setSubjectName] = useState<string>("");
  const [questionType, setQuestionType] = useState<string>("");
  const [totalMarks, setTotalMarks] = useState<string>("");
  const [essayResponse, setEssayResponse] = useState<string>("");

  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      // Fetch grader access only when authenticated
      const checkAccess = async () => {
        try {
          const response = await axios.get("/api/check-grader-access");
          setHasGraderAccess(response.data.hasGraderAccess);
        } catch (error) {
          console.error("Error checking grader access", error);
          setHasGraderAccess(false);
        }
      };
      checkAccess();
    }
  }, [status]);

  // Show spinner while loading session
  if (status === "loading") {
    return (
      <Flex
        direction="column"
        align="center"
        justify="center"
        h="100vh"
        w="100vw"
        bg="white"
      >
        <Spinner size="xl" color="#271144" />
      </Flex>
    );
  }

  // Show upgrade option if no grader access
  if (!hasGraderAccess) {
    return (
      <Center mt={8} textAlign="center">
        <Text mb={4} fontFamily={textFont} fontSize={textSize} color={textColor}>
          Oops, you don't seem to have grader access yet...
        </Text>
        <Button
          bg="#271144"
          color="white"
          _hover={{ bg: "white", color: "#271144", opacity: 0.6 }}
          onClick={() => router.push("/upgrade")}
        >
          Upgrade Now!
        </Button>
      </Center>
    );
  }

  return (
    <Box p={4}>
      <Heading size={headingSize} fontFamily={headingFont} color={headingColor}>
        Grader
      </Heading>

      <Table variant="simple" mt={4}>
        <Thead>
          <Tr>
            <Th>Subject Code</Th>
            <Th>Subject Name</Th>
            <Th>Question Type</Th>
            <Th>Total Marks</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td>
              <Input
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value)}
                placeholder="Enter Subject Code"
                fontFamily={textFont}
                fontSize={textSize}
              />
            </Td>
            <Td>
              <Input
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="Enter Subject Name"
                fontFamily={textFont}
                fontSize={textSize}
              />
            </Td>
            <Td>
              <Input
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value)}
                placeholder="Enter Question Type"
                fontFamily={textFont}
                fontSize={textSize}
              />
            </Td>
            <Td>
              <Input
                value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value)}
                placeholder="Enter Total Marks"
                fontFamily={textFont}
                fontSize={textSize}
              />
            </Td>
          </Tr>
        </Tbody>
      </Table>

      <Box mt={4}>
        <Heading size={headingSize} fontFamily={headingFont} color={headingColor} mb={2}>
          Essay Question
        </Heading>
        <Input
          value="Explain the impact of climate change on global economics."
          isReadOnly
          bg="#f0f0f0"
          fontFamily={textFont}
          fontSize={textSize}
        />
      </Box>

      <Box mt={4}>
        <Heading size={headingSize} fontFamily={headingFont} color={headingColor} mb={2}>
          Essay Response
        </Heading>
        <Textarea
          value={essayResponse}
          onChange={(e) => setEssayResponse(e.target.value)}
          placeholder="Write your response here..."
          rows={10}
          resize="vertical"
          bg="#f0f0f0"
          fontFamily={textFont}
          fontSize={textSize}
        />
      </Box>

      <Button
        mt={4}
        bg="#271144"
        color="white"
        _hover={{ bg: "white", color: "#271144", opacity: 0.6 }}
      >
        Grade
      </Button>
    </Box>
  );
};

export default Grader;
