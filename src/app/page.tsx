"use client";
import PageWrapper from "@/components/FullScreenPage";
import { NextPage } from "next";
import { useRouter } from "next/navigation";
import {
  Box,
  Flex,
  Button,
  Image,
  Text,
  Heading,
  Grid,
} from "@chakra-ui/react";

const Home: NextPage = () => {
  const router = useRouter(); // Initialize useRouter
  const heroPic = "/images/bookStack.png";
  const algorithmPic = "/images/algorithm.png";
  const graderPic = "/images/studentsOnScreen.png";
  const supportPic = "/images/subjects.png";
  const cardSize = "150px"; // Define card size here
  const cardHeaderSize = "sm"; // Define card header size
  const cardTextSize = "sm"; // Define card text size

  const handleGetStartedClick = () => {
    router.push("/sign-up"); // Navigate to the /sign-up page
  };

  return (
    <PageWrapper>
      <main>
        {/* Hero Section */}
        <Box as="section" id="hero" py={{ base: 12, md: 10 }} px={{ base: 10, md: 0 }} w="100vw">
          <Flex
            direction={{ base: "column", md: "row" }}
            align="center"
            maxW="1200px"
            mx="auto"
          >
            <Box flex="1" pr={{ md: 6 }}>
              <Heading
                as="h1"
                size="2xl"
                color="#130529"
                fontFamily="Gothic A1, sans-serif"
                mb={6}
              >
                Unlimited IGCSE & A Level Questions
              </Heading>
              <Text color="#271144" fontFamily="'Karla', sans-serif" mb={6}>
                Access unlimited topically assorted Cambridge IGCSE &
                AS/A-Level MCQs, meticulously aligned with CAIE syllabuses. Our
                platform ensures each question mirrors the exact standards,
                providing a comprehensive and authentic study experience. Dive
                into a vast repository of questions designed to cover any topic
                or subtopic of your choice in detail.
              </Text>
              <Button
                bg="#271144"
                color="white"
                fontFamily="'Roboto', sans-serif"
                _hover={{ bg: "#130529" }}
                onClick={handleGetStartedClick} // Attach click handler
              >
                Get Started
              </Button>
            </Box>
            <Box
              flex="1"
              pt={{ base: 6, md: 0 }}
              display={{ base: "none", md: "block" }}
            >
              <Image src={heroPic} alt="Books Stack" draggable={false}/>
            </Box>
          </Flex>
        </Box>

        {/* Algorithm Section */}
        <Box
          as="section"
          id="algorithm"
          bg="#271144"
          py={{ base: 14, md: 12 }}
          px={{ base: 10, md: 8 }}
          w="100vw"
        >
          <Flex
            direction={{ base: "column", md: "row" }}
            align="center"
            maxW="1200px"
            mx="auto"
          >
            <Box flex="1" pr={{ md: 6 }}>
              <Image src={algorithmPic} alt="Smart Algorithm" draggable={false}/>
            </Box>
            <Box flex="1" pt={{ base: 6, md: 0 }}>
              <Heading
                as="h2"
                size="xl"
                color="white"
                fontFamily="Gothic A1, sans-serif"
                mb={6}
              >
                Smart Algorithm. Smart results.
              </Heading>
              <Text color="white" fontFamily="'Karla', sans-serif" mb={6}>
                Our advanced AI-driven platform precisely adjusts question
                difficulty based on real-time user performance analytics. Enjoy
                personalized question sets tailored to your unique learning
                needs, enhancing your study efficiency and targeting areas for
                improvement. Benefit from continuous performance tracking and
                adaptive learning paths to maximize your potential.
              </Text>
            </Box>
          </Flex>
        </Box>

        {/* Grader Section */}
        <Box as="section" id="grader" py={{ base: 14, md: 12 }} px={{ base: 10, md: 8 }} w="100vw">
          <Flex
            direction={{ base: "column", md: "row" }}
            align="center"
            maxW="1200px"
            mx="auto"
          >
            <Box flex="1" pr={{ md: 6 }}>
              <Heading
                as="h2"
                size="xl"
                color="#130529"
                fontFamily="Gothic A1, sans-serif"
                mb={6}
              >
                Ready for Hustle Mode? Try out our advanced AI auto-grader.
              </Heading>
              <Text color="#271144" fontFamily="'Karla', sans-serif" mb={6}>
                Our AI model, powered by GPT-4, is meticulously trained and
                fine-tuned to grade your essays and subjective questions with
                unparalleled precision. Being fed over 200 sample essays across
                7 unique subjects, our model has mastered the CIE Marking Scheme
                better than any examiner ever can!
              </Text>
            </Box>
            <Box flex="1" pt={{ base: 6, md: 0 }}>
              <Image src={graderPic} alt="Students on Screen" draggable={false}/>
            </Box>
          </Flex>
        </Box>

        {/* Support Section */}
        <Box
          as="section"
          id="support"
          bg="#271144"
          py={{ base: 14, md: 12 }}
          px={{ base: 10, md: 8 }}
          w="100vw"
        >
          <Flex
            direction={{ base: "column", md: "row" }}
            align="center"
            maxW="1200px"
            mx="auto"
          >
            <Box flex="1" pr={{ md: 6 }}>
              <Image src={supportPic} alt="Subjects" draggable={false}/>
            </Box>
            <Box flex="1" pt={{ base: 6, md: 0 }}>
              <Heading
                as="h2"
                size="xl"
                color="white"
                fontFamily="Gothic A1, sans-serif"
                mb={6}
              >
                Made by Students, For Students
              </Heading>
              <Text color="white" fontFamily="'Karla', sans-serif" mb={6}>
                We are dedicated to supporting our fellow IGCSE and A-Level
                students by offering a valuable resource hub to aid their
                learning journey. Our platform is accessible for free, ensuring
                that you don’t have to deal with exorbitant subscription fees or
                copyright restrictions. Any optional premium service charges are
                solely to cover our variable costs, with absolutely no markup.
              </Text>
            </Box>
          </Flex>
        </Box>

        {/* Subjects Section */}
        <Box
          as="section"
          id="subjects"
          py={{ base: 14, md: 12 }}
          px={{ base: 10, md: 8 }}
          w="100vw"
        >
          <Flex direction="column" align="center" maxW="1200px" mx="auto">
            <Heading
              as="h2"
              size="xl"
              color="#130529"
              fontFamily="Gothic A1, sans-serif"
              mb={'60px'}
              textAlign="center"
            >
              Subjects We Cover:
            </Heading>
            <Grid
              templateColumns={{ base: "1fr 1fr", md: "1fr 1fr" }}
              gap={14}
              w="100%"
              justifyContent="center"
            >
              <Box>
                <Heading
                  as="h3"
                  size={cardHeaderSize} // Use card header size here
                  color="#130529"
                  fontFamily="Gothic A1, sans-serif"
                  mb={6}
                  textAlign="center"
                >
                  IGCSE
                </Heading>
                <Grid
                  templateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }}
                  gap={3}
                  justifyContent="center"
                  alignItems="center"
                >
                  {[
                    {
                      subject: "Economics",
                      text: "Unlimited MCQs & Grader Support",
                    },
                    {
                      subject: "Mathematics",
                      text: "Unlimited MCQs",
                    },
                    { subject: "History", text: "Grader Support" },
                    { subject: "FL English", text: "Grader Support" },
                    { subject: "Chemistry", text: "Unlimited MCQs" },
                    { subject: "Physics", text: "Unlimited MCQs" },
                    { subject: "Biology", text: "Unlimited MCQs" },
                  ].map(({ subject, text }) => (
                    <Box
                      key={subject}
                      className="subject-card"
                      bg="white"
                      p={3} // Added padding
                      shadow="lg"
                      borderRadius="md"
                      w={cardSize} // Use card size here
                      h={cardSize} // Use card size here
                      display="flex"
                      flexDirection="column"
                      justifyContent="center" // Centering content vertically
                      alignItems="center" // Centering content horizontally
                      textAlign="center" // Centering text
                      position="relative"
                      overflow="hidden"
                    >
                      <Heading
                        size={cardHeaderSize} // Use card header size here
                        color="#271144"
                        fontFamily="'Karla', sans-serif"
                        mb={2}
                        className="card-header"
                      >
                        {subject}
                      </Heading>
                      <Text
                        size={cardTextSize}
                        color="#271144"
                        fontFamily="'Karla', sans-serif"
                        className="card-text"
                      >
                        {text}
                      </Text>
                    </Box>
                  ))}
                </Grid>
              </Box>

              <Box>
                <Heading
                  as="h3"
                  size={cardHeaderSize} // Use card header size here
                  color="#130529"
                  fontFamily="Gothic A1, sans-serif"
                  mb={6}
                  textAlign="center"
                >
                  AS/A Levels
                </Heading>
                <Grid
                  templateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }}
                  gap={3}
                  justifyContent="center"
                  alignItems="center"
                >
                  {[
                    {
                      subject: "Economics",
                      text: "Unlimited MCQs & Grader Support",
                    },
                    {
                      subject: "Mathematics",
                      text: "Unlimited MCQs for Mechanics, Statistics, P1 & P2&3",
                    },
                    { subject: "Business", text: "Grader Support" },
                    {
                      subject: "English General Paper",
                      text: "Grader Support",
                    },
                  ].map(({ subject, text }) => (
                    <Box
                      key={subject}
                      className="subject-card"
                      bg="white"
                      p={3} // Added padding
                      shadow="lg"
                      borderRadius="md"
                      w={cardSize} // Use card size here
                      h={cardSize} // Use card size here
                      display="flex"
                      flexDirection="column"
                      justifyContent="center" // Centering content vertically
                      alignItems="center" // Centering content horizontally
                      textAlign="center" // Centering text
                      position="relative"
                      overflow="hidden"
                    >
                      <Heading
                        size={cardHeaderSize} // Use card header size here
                        color="#271144"
                        fontFamily="'Karla', sans-serif"
                        mb={2}
                        className="card-header"
                      >
                        {subject}
                      </Heading>
                      <Text
                        size={cardTextSize}
                        color="#271144"
                        fontFamily="'Karla', sans-serif"
                        className="card-text"
                      >
                        {text}
                      </Text>
                    </Box>
                  ))}
                </Grid>
              </Box>
            </Grid>
          </Flex>
        </Box>
      </main>

      <style jsx global>{`
        .subject-card {
          position: relative;
          overflow: hidden;
          cursor: pointer;
        }

        .subject-card .card-text {
          opacity: 0;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          transition: opacity 0.3s, background-color 0.3s;
        }

        .subject-card .card-header {
          transition: opacity 0.1s;
        }

        .subject-card:hover {
          background-color: #271144;
        }

        .subject-card:hover .card-text {
          opacity: 1;
          color: white;
        }

        .subject-card:hover .card-header {
          opacity: 0; /* Hide the card header on hover */
          color: white;
        }
      `}</style>
    </PageWrapper>
  );
};

export default Home;
