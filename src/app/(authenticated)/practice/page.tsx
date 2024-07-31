"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Checkbox,
  Select,
  VStack,
  Heading,
  Text,
  Flex,
  useBreakpointValue,
  Spinner,
} from "@chakra-ui/react";
import PageWrapper from "../../../components/FullScreenPage"; // Adjust the import path as needed
import axios from "axios";

// Define the styles
const headingSize = "lg";
const headingFont = "Gothic A1, Roboto, sans-serif";
const textSize = "md";
const textFont = "Karla, sans-serif";
const headingColor = "#130529";
const textColor = "#271144";

const Practice = () => {
  const { data: session, status } = useSession(); // Destructure data from useSession
  const router = useRouter();
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [onlyASLevel, setOnlyASLevel] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedSubtopics, setSelectedSubtopics] = useState<string[]>([]);
  const [topics, setTopics] = useState<{ name: string; subtopics: string[] }[]>(
    []
  );
  const [subtopics, setSubtopics] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); // Add a loading state

  const isDesktop = useBreakpointValue({ base: false, md: true });

  useEffect(() => {
    if (status === "loading") {
      return; // If session is loading, don't proceed
    }
    if (status === "authenticated") {
      // Fetch selected subjects from the API
      axios
        .get("/api/get-selected-subjects")
        .then((response) => {
          setSelectedSubjects(response.data.previouslySelectedSubjects);
          setLoading(false); // Set loading to false once data is fetched
        })
        .catch((error) => {
          console.error("Error fetching selected subjects:", error);
          setLoading(false); // Set loading to false in case of an error
        });
    } else if (status === "unauthenticated") {
      router.push("/login"); // Redirect to login if not authenticated
    }
  }, [status, router]);

  useEffect(() => {
    if (selectedSubject?.topics) {
      setTopics(selectedSubject.topics);
    }
  }, [selectedSubject]);

  useEffect(() => {
    // Collect subtopics for the selected topics
    const allSubtopics = selectedTopics.flatMap((topicName) => {
      const foundTopic = topics.find((t) => t.name === topicName);
      return foundTopic ? foundTopic.subtopics : [];
    });
    setSubtopics(allSubtopics);
  }, [selectedTopics, topics]);

  const handleSolve = async () => {
    if (!selectedSubject) return;

    try {
      const response = await axios.get("/api/serve-question", {
        params: {
          subjectCode: selectedSubject.subjectCode,
          onlyASLevel,
          topics: selectedTopics, // Pass the selected topics
          subtopics: selectedSubtopics, // Pass the selected subtopics
        },
      });
      console.log("Question data:", response.data);
    } catch (error) {
      console.error("Error fetching question:", error);
    }
  };

  if (loading) {
    return (
      <Box
        minHeight="80vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <PageWrapper minHeight="80vh">
      <Flex direction={isDesktop ? "row" : "column"} gap={8}>
        <Box
          flex="2"
          p={8}
          boxShadow="lg"
          borderRadius="md"
          w={["100%", "100%", "60%"]}
          maxH="83vh"
          overflowY="scroll"
        >
          <Heading
            size={headingSize}
            fontFamily={headingFont}
            color={headingColor}
            mb={4}
          >
            Your Subjects
          </Heading>
          {selectedSubjects && selectedSubjects.length > 0 ? (
            <VStack spacing={4} align="stretch">
              {selectedSubjects.map((subject: any) => (
                <Button
                  key={subject.subjectCode}
                  onClick={() => setSelectedSubject(subject)}
                  variant={
                    selectedSubject?.subjectCode === subject.subjectCode
                      ? "solid"
                      : "outline"
                  }
                >
                  <Text
                    fontFamily={textFont}
                    fontSize={textSize}
                    color={textColor}
                  >
                    {subject.subjectName}
                  </Text>
                </Button>
              ))}
            </VStack>
          ) : (
            <Box mt={8} textAlign="center">
              <Text
                mb={4}
                fontFamily={textFont}
                fontSize={textSize}
                color={textColor}
              >
                You haven&apos;t selected any subjects yet.
              </Text>
              <Button
                bg="#271144"
                color="white"
                _hover={{ bg: "white", color: "#271144", opacity: 0.6 }}
                onClick={() => router.push("/personalise")}
              >
                Go to Personalise
              </Button>
            </Box>
          )}
        </Box>
        {selectedSubject && (
          <Box
            flex="1"
            mt={isDesktop ? 0 : 8}
            p={8}
            boxShadow="lg"
            borderRadius="md"
            w={["100%", "100%", "40%"]}
            maxH="fit-content"
          >
            <Heading
              size="lg"
              fontFamily={headingFont}
              color={headingColor}
              mb={2}
            >
              {selectedSubject.subjectName}
            </Heading>
            <Checkbox
              isChecked={onlyASLevel}
              onChange={(e) => setOnlyASLevel(e.target.checked)}
              colorScheme="purple"
            >
              <Text fontFamily={textFont} fontSize={textSize} color={textColor}>
                Serve only AS Level?
              </Text>
            </Checkbox>
            <Select
              placeholder="Select Topics"
              mt={4}
              value={selectedTopics}
              onChange={(e) =>
                setSelectedTopics(
                  Array.from(e.target.selectedOptions, (option) => option.value)
                )
              }
              multiple
            >
              {topics.map((t) => (
                <option key={t.name} value={t.name}>
                  {t.name}
                </option>
              ))}
            </Select>
            <Select
              placeholder="Select Subtopics"
              mt={4}
              value={selectedSubtopics}
              onChange={(e) =>
                setSelectedSubtopics(
                  Array.from(e.target.selectedOptions, (option) => option.value)
                )
              }
              multiple
            >
              {subtopics.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </Select>
            <Button
              mt={4}
              bg="#271144"
              color="white"
              _hover={{ bg: "white", color: "#271144", opacity: 0.6 }}
              onClick={handleSolve}
            >
              Solve
            </Button>
          </Box>
        )}
      </Flex>
    </PageWrapper>
  );
};

export default Practice;
