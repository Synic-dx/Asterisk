"use client";

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

// Initialize Chart.js
ChartJS.register(
  LineElement,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title
);

const tipsArray = [
  "The more you solve, the better our algorithm responds to your needs",
  "Premium and Grader Access Members can choose all subjects",
  "Your percentile is generated using your relative accuracy across all subjects",
  "With premium you can refer to and analyze past mistakes as well as solve unlimited MCQs",
  "Our AI models use Unicode to display mathematical symbols, and Markdown to format text",
];

const Dashboard: NextPage = () => {
  const [tip, setTip] = useState<string>("");
  const [stats, setStats] = useState<any>(null);
  const [dailyAttemptsData, setDailyAttemptsData] = useState<any>({
    labels: [],
    datasets: [
      {
        label: "Daily Attempts",
        data: [],
        backgroundColor: "#3182ce",
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
      },
    ],
  });
  const router = useRouter();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const headingSize = useBreakpointValue({ base: "md", md: "md" });

  useEffect(() => {
    // Select a random tip
    setTip(tipsArray[Math.floor(Math.random() * tipsArray.length)]);

    // Fetch stats and update chart data
    async function fetchStats() {
      const response = await fetch("/api/stats");
      const data = await response.json();

      setStats({
        totalDailyAttempts: data.totalDailyAttempts || 0,
        userCumulativePercentile:
          data.cumulativeStats[0]?.userCumulativePercentile || 0,
      });

      const dates = data.cumulativeStats.map((stat: any) => stat.date);
      const dailyAttempts = data.cumulativeStats.map(
        (stat: any) => stat.questionsAttempted
      );
      const percentiles = data.cumulativeStats.map(
        (stat: any) => stat.userCumulativePercentile
      );

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
    }

    fetchStats();
  }, []);

  // Determine feedback for questions solved today
  const getQuestionsSolvedFeedback = (questionsSolved: number) => {
    if (questionsSolved < 10) {
      return "Continue Practicing!";
    } else if (questionsSolved < 20) {
      return "You are doing well! Continue Practicing";
    } else if (questionsSolved === FREE_DAILY_QUESTION_LIMIT) {
      return "Amazing Effort! Keep pushing forward! Upgrade to premium to solve more";
    } else {
      return "Amazing Effort! Keep pushing forward!";
    }
  };

  // Determine feedback for current percentile
  const getPercentileFeedback = (percentile: number) => {
    if (percentile < 30) {
      return "Never give up!";
    } else if (percentile < 60) {
      return "You can definitely do better!";
    } else if (percentile < 80) {
      return "Good job you are on the way";
    } else {
      return "That's amazing!";
    }
  };

  return (
    <PageWrapper>
      <Box padding="4" w="95vw" fontFamily="Karla, sans-serif" color="grey.100">
        <Grid templateColumns={{ base: "1fr", md: "repeat(12, 1fr)" }} gap={4}>
          <GridItem colSpan={12}>
            <Card shadow="md">
              <CardBody>
                <Flex alignItems="center" justifyContent="center" gap={2}>
                  <Lightbulb />
                  <Text
                    marginLeft="2"
                    color="#130529"
                    fontFamily="Roboto, sans-serif"
                  >
                    {tip}
                  </Text>
                </Flex>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem colSpan={{ base: 12, md: 4 }} rowSpan={2}>
            <Card height="100%" shadow="md" paddingBottom="8">
              <CardHeader>
                <Heading size={headingSize} color="#130529">
                  Questions Solved Today
                </Heading>
              </CardHeader>
              <CardBody>
                <Text color="#130529" mb={5}>
                  You solved{" "}
                  <Text as="span" fontWeight={"extrabold"} fontSize={"xl"}>
                    {stats?.totalDailyAttempts || 0}
                  </Text>{" "}
                  sums today.{" "}
                  {getQuestionsSolvedFeedback(stats?.totalDailyAttempts || 0)}
                </Text>
                <Flex position="absolute" bottom="4" left="4">
                  <Button
                    bg="#271144"
                    color="white"
                    _hover={{ opacity: 0.6 }}
                    onClick={() => router.push("/practice")}
                    mr={4}
                    disabled={
                      stats?.totalDailyAttempts === FREE_DAILY_QUESTION_LIMIT
                    }
                  >
                    Practice
                  </Button>
                  <Button
                    bg="#271144"
                    color="white"
                    _hover={{ opacity: 0.6 }}
                    onClick={() => router.push("/personalise")}
                    mr={4}
                  >
                    Personalise
                  </Button>
                </Flex>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem colSpan={{ base: 12, md: 4 }} rowSpan={2}>
            <Card height="100%" shadow="md" paddingBottom="8">
              <CardHeader>
                <Heading size={headingSize} color="#130529">
                  Your Current Percentile
                </Heading>
              </CardHeader>
              <CardBody>
                <Text color="#130529" mb={5}>
                  You are solving with greater accuracy than{" "}
                  <Text as="span" fontWeight={"extrabold"} fontSize={"xl"}>
                    {stats?.userCumulativePercentile || 0}%
                  </Text>{" "}
                  of our users.{" "}
                  {getPercentileFeedback(stats?.userCumulativePercentile || 0)}
                </Text>
                <Flex position="absolute" bottom="4" left="4">
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
          {!isMobile && (
            <>
              <GridItem colSpan={4}>
                <Card height="100%" shadow="md">
                  <CardHeader>
                    <Heading size={headingSize} color="#130529">
                      Get Grader Access
                    </Heading>
                  </CardHeader>
                  <CardBody>
                    <Button
                      bg="#271144"
                      color="white"
                      _hover={{ opacity: 0.6 }}
                      onClick={() => router.push("/grader")}
                      size="sm"
                    >
                      Get grader access for ${graderAccessMonthlyPrice} only!
                    </Button>
                  </CardBody>
                </Card>
              </GridItem>
              <GridItem colSpan={4}>
                <Card height="100%" shadow="md">
                  <CardHeader>
                    <Heading size={headingSize} color="#130529">
                      Upgrade to Premium
                    </Heading>
                  </CardHeader>
                  <CardBody>
                    <Button
                      bg="#271144"
                      color="white"
                      _hover={{ opacity: 0.6 }}
                      onClick={() => router.push("/premium")}
                      size="sm"
                    >
                      Get premium access for ${premiumMonthlyPrice} only!
                    </Button>
                  </CardBody>
                </Card>
              </GridItem>
            </>
          )}
          <GridItem colSpan={{ base: 12, md: 6 }}>
            <Card height="100%" shadow="md">
              <CardHeader>
                <Heading size={headingSize} color="#130529">
                  Daily Attempts
                </Heading>
              </CardHeader>
              <CardBody>
                <Box width="100%" height="300px">
                  <Bar data={dailyAttemptsData} />
                </Box>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem colSpan={{ base: 12, md: 6 }}>
            <Card height="100%" shadow="md">
              <CardHeader>
                <Heading size={headingSize} color="#130529">
                  User Percentile
                </Heading>
              </CardHeader>
              <CardBody>
                <Box width="100%" height="300px">
                  <Line data={percentileData} />
                </Box>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </Box>
    </PageWrapper>
  );
};

export default Dashboard;
