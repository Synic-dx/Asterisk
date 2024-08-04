"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Center,
  Select,
  VStack,
  Heading,
  Text,
  Flex,
  Spinner,
  Skeleton,
  RadioGroup,
  Radio,
  Stack,
  useBreakpointValue,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { Level, Topics, Topic } from "../../../models/subject.model";

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
  const toast = useToast();
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [selectedLevel, setSelectedLevel] = useState("bothLevels");
  const [asLevel, setAsLevel] = useState(false);
  const [bothLevels, setBothLevels] = useState(true);
  const [aLevel, setALevel] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedSubtopics, setSelectedSubtopics] = useState<string[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subtopics, setSubtopics] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); // Add a loading state
  const [isSubmitting, setIsSubmitting] = useState(false); // Add a submitting state

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
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching selected subjects:", error);
          setLoading(false); // Set loading to false in case of an error
        });
    } else if (status === "unauthenticated") {
      router.push("/sign-in"); // Redirect to login if not authenticated
    }
  }, [status, router]);

  useEffect(() => {
    if (selectedSubject?.levels) {
      let levels: Level[] = selectedSubject.levels;

      // Filter levels based on selection
      if (asLevel) {
        levels = levels.filter((level) => level.levelName === "AS Level");
      } else if (aLevel) {
        levels = levels.filter((level) => level.levelName === "A Level");
      } else if (bothLevels) {
        // Include both AS and A Levels
        levels = selectedSubject.levels;
      }

      // Flatten the topics into a single array of topics
      const newTopics: Topics = levels.flatMap((level) => level.topics);
      // Remove duplicates by creating a Map and converting back to array
      const uniqueTopics = Array.from(
        new Map(newTopics.map((topic) => [topic.topicName, topic])).values()
      );
      setTopics(uniqueTopics);
      setSubtopics([]); // Clear subtopics when changing subjects

      // Clear selected topics and subtopics when subject changes
      setSelectedTopics([]);
      setSelectedSubtopics([]);
    }
  }, [selectedSubject, asLevel, aLevel, bothLevels]);

  useEffect(() => {
    if (selectedSubject?.levels) {
      // Reset radio group to bothLevels
      setAsLevel(false);
      setBothLevels(true);
      setALevel(false);
      setSelectedLevel("bothLevels");
    }
  }, [selectedSubject]);

  // Effect to update subtopics based on selected topics
  useEffect(() => {
    const allSubtopics = selectedTopics.flatMap((topicName) => {
      const foundTopic = topics.find((t) => t.topicName === topicName);
      return foundTopic ? foundTopic.subtopics : [];
    });
    // Remove duplicates by creating a Set and converting back to array
    const uniqueSubtopics = Array.from(new Set(allSubtopics));
    setSubtopics(uniqueSubtopics);
  }, [selectedTopics, topics]);

  const handleSolve = async () => {
    if (!selectedSubject) return;

    setIsSubmitting(true); // Set submitting state to true

    try {
      console.log(
        selectedSubject.subjectCode,
        asLevel,
        aLevel,
        selectedTopics,
        selectedSubtopics
      );
      const response = await axios.get("/api/serve-question", {
        params: {
          subjectCode: selectedSubject.subjectCode,
          onlyASLevel: asLevel,
          onlyALevel: aLevel,
          topics: selectedTopics, // Pass the selected topics
          subtopics: selectedSubtopics, // Pass the selected subtopics
        },
      });

      if (response.status === 200) {
        console.log("Question data:", response.data);
      }
    } catch (error: any) {
      console.error("Error fetching question:", error);

      // Show toast notification for error
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "An unexpected error occurred.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false); // Set submitting state to false after operation
    }
  };

  const handleLevelChange = (value: string) => {
    setSelectedLevel(value);
    setAsLevel(value === "asLevel");
    setBothLevels(value === "bothLevels");
    setALevel(value === "aLevel");
  };

  const isIGCSE = selectedSubject?.subjectName.startsWith("IGCSE");
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

  if (!session) {
    return (
      <Flex
        direction="column"
        align="center"
        justify="center"
        h="100vh"
        w="100vw"
        bg="white"
      >
        <Text color="#271144" fontFamily="Karla, sans-serif">
          You must be logged in to view this page.
        </Text>
      </Flex>
    );
  }

  return (
    <Flex
      direction={["column", "column", "row"]}
      p={5}
      gap={5}
      w={"100%"}
      position="relative"
      minHeight={"80vh"}
    >
      <Box
        flex="2"
        p={8}
        boxShadow="lg"
        borderRadius="md"
        w={["100%", "100%", "60%"]}
        maxH="83vh"
        overflowY="auto"
      >
        <Heading fontSize="xl" mb={5} color="#130529">
          Your Subjects
        </Heading>
        {loading ? (
          Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} height="50px" mb={2} borderRadius={6} />
          ))
        ) : selectedSubjects && selectedSubjects.length > 0 ? (
          <VStack spacing={1} align="stretch">
            {selectedSubjects.map((subject: any) => (
              <Box
                key={subject.subjectCode}
                p={4}
                mb={2}
                bg={
                  selectedSubject?.subjectCode === subject.subjectCode
                    ? "#271144"
                    : "white"
                }
                color={
                  selectedSubject?.subjectCode === subject.subjectCode
                    ? "white"
                    : "#271144"
                }
                borderWidth="1px"
                borderRadius="md"
                onClick={() => setSelectedSubject(subject)}
                fontFamily="Karla, sans-serif"
                _hover={{
                  bg:
                    selectedSubject?.subjectCode === subject.subjectCode
                      ? "rgba(39, 17, 67, 0.9)"
                      : "#f7fafc",
                }}
                cursor="pointer"
              >
                <Text fontSize="lg" fontWeight="bold">
                  {subject.subjectName}
                </Text>
                <Text
                  fontSize="sm"
                  color={
                    selectedSubject?.subjectCode === subject.subjectCode
                      ? "white"
                      : "gray.600"
                  }
                >
                  {subject.subjectCode}
                </Text>
              </Box>
            ))}
          </VStack>
        ) : (
          <Center mt={8} textAlign="center">
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
          </Center>
        )}
      </Box>
      {selectedSubjects.length > 0 && selectedSubject ? (
        <Box
          flex="1"
          p={8}
          boxShadow="lg"
          borderRadius="md"
          w={["100%", "100%", "40%"]}
          maxH="fit-content"
        >
          <VStack spacing={6} align="stretch">
            <Heading
              size="lg"
              fontFamily={headingFont}
              color={headingColor}
              mb={4}
            >
              {selectedSubject
                ? selectedSubject.subjectName
                : "Select a Subject"}
            </Heading>
            {!isIGCSE && (
              <>
                <Text
                  fontSize={textSize}
                  color={textColor}
                  fontFamily={textFont}
                >
                  Select Levels
                </Text>
                <RadioGroup value={selectedLevel} onChange={handleLevelChange}>
                  <Stack spacing={4} direction="row">
                    <Radio value="bothLevels">Both Levels</Radio>
                    <Radio value="asLevel">AS Level</Radio>
                    <Radio value="aLevel">A Level</Radio>
                  </Stack>
                </RadioGroup>
              </>
            )}
            {topics.length > 0 && (
              <>
                <Text
                  fontSize={textSize}
                  color={textColor}
                  fontFamily={textFont}
                >
                  Select Topics
                </Text>
                <Select
                  placeholder="All Topics"
                  value={selectedTopics}
                  onChange={(e) =>
                    setSelectedTopics(
                      Array.from(
                        e.target.selectedOptions,
                        (option) => option.value
                      )
                    )
                  }
                  size="md"
                  fontFamily={textFont}
                  color={textColor}
                >
                  {topics.map((topic) => (
                    <option key={topic.topicName} value={topic.topicName}>
                      {topic.topicName}
                    </option>
                  ))}
                </Select>
              </>
            )}
            {subtopics.length > 0 && (
              <>
                <Text
                  fontSize={textSize}
                  color={textColor}
                  fontFamily={textFont}
                >
                  Select Subtopics
                </Text>
                <Select
                  placeholder="All Subtopics"
                  value={selectedSubtopics}
                  onChange={(e) =>
                    setSelectedSubtopics(
                      Array.from(
                        e.target.selectedOptions,
                        (option) => option.value
                      )
                    )
                  }
                  size="md"
                  fontFamily={textFont}
                  color={textColor}
                >
                  {subtopics.map((subtopic) => (
                    <option key={subtopic} value={subtopic}>
                      {subtopic}
                    </option>
                  ))}
                </Select>
              </>
            )}
            <Button
              bg="#271144"
              color="white"
              _hover={{ bg: "#271144", color: "white", opacity: 0.6 }}
              onClick={handleSolve}
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" mr={3} />
                  Generating...
                </>
              ) : (
                "Begin Solving"
              )}
            </Button>
          </VStack>
        </Box>
      ) : (
        <Flex
          direction="column"
          align="center"
          justify="center"
          flex="1"
          bg="white"
          p={5}
          boxShadow="lg"
          borderRadius="md"
        >
          <Text fontSize="xl" mb={4} fontFamily={textFont} color={textColor}>
            Select a subject to customise
          </Text>
        </Flex>
      )}
    </Flex>
  );
};

export default Practice;
