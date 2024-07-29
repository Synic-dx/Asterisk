'use client';

import { NextPage } from "next";
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Grid,
  GridItem,
  Heading,
  Text,
  Button,
  Flex,
  useBreakpointValue,
  HStack,
  Spinner,
  Center,
  useToast,
} from "@chakra-ui/react";
import { Lightbulb } from "lucide-react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
} from "chart.js";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageWrapper from "@/components/FullScreenPage";
import {
  graderAccessMonthlyPrice,
  premiumMonthlyPrice,
  FREE_DAILY_QUESTION_LIMIT,
} from "@/constants";
import "@fontsource/roboto"; // Import Roboto font
import "@fontsource/karla"; // Import Karla font
import { useSession, signIn, SessionProvider } from "next-auth/react";
import axios from "axios";

// Initialize ChartJS
ChartJS.register(LineElement, BarElement, PointElement, CategoryScale, LinearScale, Title);

const tipsArray = [
  "The more you solve, the better our algorithm responds to your requirements",
  "Premium and Grader Access Members can choose all subjects",
  "Your percentile is generated using your relative accuracy across all subjects",
  "With premium you can refer to and analyze past mistakes as well as solve unlimited MCQs",
  "Our AI models use Unicode to display mathematical symbols, and Markdown to format text",
  "Don't be daunted by a low percentile! Our platform is relatively new and things will stabilize"
];

interface CumulativeStat {
  date: string;
  questionsAttempted: number;
  userCumulativePercentile: number;
}

interface Stats {
  totalDailyAttempts: number;
  userCumulativePercentile: number;
  cumulativeStats: CumulativeStat[];
}

const Dashboard: NextPage = () => {
  const { data: session, status } = useSession();
  const [tip, setTip] = useState<string>("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [dailyAttemptsData, setDailyAttemptsData] = useState<any>({
    labels: [],
    datasets: [
      {
        label: "Daily Attempts",
        data: [],
        backgroundColor: "#3182ce",
        yAxisID: 'y',
      },
    ],
  });
  const [percentileData, setPercentileData] = useState<any>({
    labels: [],
    datasets: [
      {
        label: "User Percentile",
        data: [],
        borderColor: "#ff6347",
        backgroundColor: "rgba(255, 99, 71, 0.1)",
        fill: true,
        yAxisID: 'y',
      },
    ],
  });
  const router = useRouter();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const headingSize = useBreakpointValue({ base: "md", md: "md" });
  const subTextColor = "271144";
  const toast = useToast();

  useEffect(() => {
    // Set a random tip
    setTip(tipsArray[Math.floor(Math.random() * tipsArray.length)]);

    const fetchStats = async () => {
      if (!session?.user?.userName) return;

      try {
        const response = await axios.get(`/api/get-stats?userName=${session.user.userName}`);
        const data: Stats = response.data;

        // Reverse the order of data points
        const dates = data.cumulativeStats.map((stat) => stat.date).reverse();
        const dailyAttempts = data.cumulativeStats.map((stat) => stat.questionsAttempted).reverse();
        const percentiles = data.cumulativeStats.map((stat) => stat.userCumulativePercentile).reverse();

        setStats({
          totalDailyAttempts: data.totalDailyAttempts || 0,
          userCumulativePercentile: data.userCumulativePercentile || 0,
          cumulativeStats: data.cumulativeStats,
        });

        setDailyAttemptsData({
          labels: dates,
          datasets: [
            {
              label: "Daily Attempts",
              data: dailyAttempts,
              backgroundColor: "#3182ce",
            },
          ],
        });

        setPercentileData({
          labels: dates,
          datasets: [
            {
              label: "User Percentile",
              data: percentiles,
              borderColor: "#ff6347",
              backgroundColor: "rgba(255, 99, 71, 0.1)",
              fill: true,
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        toast({
          title: "Error",
          description: "Failed to load statistics. Please try again later.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    if (status === "authenticated") {
      fetchStats();
    }
  }, [status, session?.user?.userName, toast]);

  const getQuestionsSolvedFeedback = (questionsSolved: number) => {
    if (questionsSolved < 10) {
      return "Continue Practicing!";
    } else if (questionsSolved < 20) {
      return "You are doing well! Continue Practicing";
    } else if (questionsSolved === FREE_DAILY_QUESTION_LIMIT && (!session?.user?.premiumAccess?.valid || new Date(session.user.premiumAccess.premiumAccessValidTill) < new Date())) {
      return "Amazing Effort! Keep pushing forward! Upgrade to premium to solve more";
    } else {
      return "Amazing Effort! Keep pushing forward!";
    }
  };

  const getPercentileFeedback = (percentile: number) => {
    if (percentile < 25) {
      return "Don't give up! Keep practicing to improve your percentile.";
    } else if (percentile < 50) {
      return "Good job! Keep practicing to climb higher.";
    } else if (percentile < 75) {
      return "Great work! You're doing well. Aim for the top.";
    } else {
      return "Excellent! You're in the top percentile. Keep up the great work!";
    }
  };

  return (
    <SessionProvider>
      <PageWrapper>
        <Box padding="4" w="95vw" fontFamily="Karla, sans-serif">
          <HStack>
            <Heading as={'h1'} mb={10} ml={5} mt={5} color={'#130529'}>Welcome {session?.user?.userName}!</Heading>
          </HStack>
          <Grid templateColumns={{ base: "1fr", md: "repeat(12, 1fr)" }} gap={4}>
            <GridItem colSpan={12}>
              <Card shadow="md">
                <CardBody>
                  <Flex alignItems="center" justifyContent="center" gap={2}>
                    <Lightbulb />
                    <Text marginLeft="2" color="#130529" fontFamily="Roboto, sans-serif">
                      {tip}
                    </Text>
                  </Flex>
                </CardBody>
              </Card>
            </GridItem>
            <GridItem colSpan={{ base: 12, md: 3 }}>
              <Card height="100%" minH="200px" shadow="md">
                <CardHeader>
                  <Heading size={headingSize} color="#130529">
                    Questions Solved Today
                  </Heading>
                </CardHeader>
                <CardBody>
                  <Text color={subTextColor} mb={5}>
                    You solved{" "}
                    <Text as="span" fontWeight={"extrabold"} fontSize={"xl"}>
                      {stats?.totalDailyAttempts || 0}
                    </Text>{" "}
                    sums today.{" "}
                    {getQuestionsSolvedFeedback(stats?.totalDailyAttempts || 0)}
                  </Text>
                  <Flex>
                    <Button
                      bg="#271144"
                      color="white"
                      _hover={{ opacity: 0.6 }}
                      onClick={() => router.push("/practice")}
                      mr={4}
                      disabled={stats?.totalDailyAttempts === FREE_DAILY_QUESTION_LIMIT}
                    >
                      Practice
                    </Button>
                    <Button
                      bg="#271144"
                      color="white"
                      _hover={{ opacity: 0.6 }}
                      onClick={() => router.push("/personalise")}
                    >
                      Personalise
                    </Button>
                  </Flex>
                </CardBody>
              </Card>
            </GridItem>
            <GridItem colSpan={{ base: 12, md: 3 }}>
              <Card height="100%" minH="200px" shadow="md">
                <CardHeader>
                  <Heading size={headingSize} color="#130529">
                    Your Current Percentile
                  </Heading>
                </CardHeader>
                <CardBody>
                  <Text color={subTextColor} mb={5}>
                    You are solving with greater accuracy than{" "}
                    <Text as="span" fontWeight={"extrabold"} fontSize={"xl"}>
                      {stats?.userCumulativePercentile || 0}%
                    </Text>{" "}
                    of our users.{" "}
                    {getPercentileFeedback(stats?.userCumulativePercentile || 0)}
                  </Text>
                  <Flex>
                    <Button
                      bg="#271144"
                      color="white"
                      _hover={{ opacity: 0.6 }}
                      onClick={() => router.push("/analyse")}
                    >
                      Analyse
                    </Button>
                  </Flex>
                </CardBody>
              </Card>
            </GridItem>
            <GridItem colSpan={{ base: 12, md: 3 }}>
              <Card height="100%" minH="200px" shadow="md">
                <CardHeader>
                  <Heading size={headingSize} color="#130529">
                    Premium
                  </Heading>
                </CardHeader>
                <CardBody>
                  <Text color={subTextColor} mb={5}>
                    Upgrade to premium for unlimited practice and detailed
                    analytics.
                  </Text>
                  <Flex>
                    <Button
                      bg="#271144"
                      color="white"
                      _hover={{ opacity: 0.6 }}
                      onClick={() => router.push("/upgrade")}
                    >
                      Upgrade
                    </Button>
                  </Flex>
                </CardBody>
              </Card>
            </GridItem>
            <GridItem colSpan={{ base: 12, md: session?.user?.premiumAccess?.valid ? 6 : 3 }}>
              <Card height="100%" minH="200px" shadow="md">
                <CardHeader>
                  <Heading size={headingSize} color="#130529">
                    Essay Grader
                  </Heading>
                </CardHeader>
                <CardBody>
                  <Text color={subTextColor} mb={5}>
                    Get your essays graded by our powerful AI model.
                  </Text>
                  <Flex>
                    <Button
                      bg="#271144"
                      color="white"
                      _hover={{ opacity: 0.6 }}
                      onClick={() => router.push("/grader")}
                    >
                      Learn More
                    </Button>
                  </Flex>
                </CardBody>
              </Card>
            </GridItem>
          </Grid>
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4} mt={4}>
            <GridItem>
              <Card height="100%" shadow="md">
                <CardHeader>
                  <Heading size={headingSize} color="#130529">
                    Your Daily Attempts
                  </Heading>
                </CardHeader>
                <CardBody>
                  <Bar data={dailyAttemptsData} options={{ scales: { y: { min: 0, max: 50 } } }} />
                </CardBody>
              </Card>
            </GridItem>
            <GridItem>
              <Card height="100%" shadow="md">
                <CardHeader>
                  <Heading size={headingSize} color="#130529">
                    Your Cumulative Percentile
                  </Heading>
                </CardHeader>
                <CardBody>
                  <Line data={percentileData} options={{ scales: { y: { min: 0, max: 100 } } }} />
                </CardBody>
              </Card>
            </GridItem>
          </Grid>
        </Box>
      </PageWrapper>
    </SessionProvider>
  );
};

export default Dashboard;
