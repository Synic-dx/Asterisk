'use client';

import { NextPage } from 'next';
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
} from '@chakra-ui/react';
import { Lightbulb } from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, BarElement, PointElement, CategoryScale, LinearScale, Title } from 'chart.js';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageWrapper from '@/components/FullScreenPage';

// Initialize Chart.js
ChartJS.register(LineElement, BarElement, PointElement, CategoryScale, LinearScale, Title);

const Dashboard: NextPage = () => {
  const [tip, setTip] = useState<string>('');
  const [stats, setStats] = useState<any>(null);
  const [dailyAttemptsData, setDailyAttemptsData] = useState<any>({
    labels: [],
    datasets: [
      {
        label: 'Daily Attempts',
        data: [],
        backgroundColor: '#3182ce',
      },
    ],
  });
  const [percentileData, setPercentileData] = useState<any>({
    labels: [],
    datasets: [
      {
        label: 'User Percentile',
        data: [],
        borderColor: '#ff6347',
        backgroundColor: 'rgba(255, 99, 71, 0.1)',
        fill: true,
      },
    ],
  });
  const router = useRouter();

  useEffect(() => {
    // Placeholder for random tip
    setTip('This is a placeholder tip.');

    // Fetch stats and update chart data
    async function fetchStats() {
      const response = await fetch('/api/stats');
      const data = await response.json();
      
      setStats({
        totalDailyAttempts: data.totalDailyAttempts,
        userCumulativePercentile: data.cumulativeStats[0]?.userCumulativePercentile || 0,
      });

      const dates = data.cumulativeStats.map((stat: any) => stat.date);
      const dailyAttempts = data.cumulativeStats.map((stat: any) => stat.questionsAttempted);
      const percentiles = data.cumulativeStats.map((stat: any) => stat.userCumulativePercentile);

      setDailyAttemptsData({
        labels: dates,
        datasets: [
          {
            label: 'Daily Attempts',
            data: dailyAttempts,
            backgroundColor: '#3182ce',
          },
        ],
      });

      setPercentileData({
        labels: dates,
        datasets: [
          {
            label: 'User Percentile',
            data: percentiles,
            borderColor: '#ff6347',
            backgroundColor: 'rgba(255, 99, 71, 0.1)',
            fill: true,
          },
        ],
      });
    }

    fetchStats();
  }, []);

  return (
    <PageWrapper>
      <Box padding="4" w="95vw">
        <Grid templateColumns="repeat(12, 1fr)" gap={4}>
          <GridItem colSpan={12}>
            <Card shadow="md">
              <CardBody>
                <Flex alignItems="center" justifyContent="center">
                  <Lightbulb />
                  <Text marginLeft="2" color="#130529">{tip}</Text>
                </Flex>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem colSpan={4} rowSpan={2}>
            <Card height="100%" shadow="lg">
              <CardHeader>
                <Heading size="md" color="#130529">Questions Today</Heading>
              </CardHeader>
              <CardBody>
                <Text color="#130529">{stats?.totalDailyAttempts}</Text>
                <Flex position="absolute" bottom="4" left="4">
                  <Button
                    bg="#271144"
                    color="white"
                    _hover={{ opacity: 0.6 }}
                    onClick={() => router.push('/practice')}
                    mr={4}
                  >
                    Practice
                  </Button>
                  <Button
                    bg="#271144"
                    color="white"
                    _hover={{ opacity: 0.6 }}
                    onClick={() => router.push('/personalise')}
                    mr={4}
                  >
                    Personalise
                  </Button>
                </Flex>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem colSpan={4} rowSpan={2}>
            <Card height="100%" shadow="lg">
              <CardHeader>
                <Heading size="md" color="#130529">Current Percentile</Heading>
              </CardHeader>
              <CardBody>
                <Text fontWeight="bold" color="#130529">{stats?.userCumulativePercentile}</Text>
                <Flex position="absolute" bottom="4" left="4">
                  <Button
                    bg="#271144"
                    color="white"
                    _hover={{ opacity: 0.6 }}
                    onClick={() => router.push('/analyse')}
                  >
                    Analyse
                  </Button>
                </Flex>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem colSpan={4}>
            <Card height="100%" shadow="lg">
              <CardHeader>
                <Heading size="md" color="#130529">Premium CTA</Heading>
              </CardHeader>
              <CardBody>
                <Button
                  bg="#271144"
                  color="white"
                  _hover={{ opacity: 0.6 }}
                  onClick={() => router.push('/premium')}
                >
                  Go Premium
                </Button>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem colSpan={4}>
            <Card height="100%" shadow="lg">
              <CardHeader>
                <Heading size="md" color="#130529">Grader CTA</Heading>
              </CardHeader>
              <CardBody>
                <Button
                  bg="#271144"
                  color="white"
                  _hover={{ opacity: 0.6 }}
                  onClick={() => router.push('/grader')}
                >
                  Use Grader
                </Button>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem colSpan={6}>
            <Card shadow="lg">
              <CardHeader>
                <Heading size="md" color="#130529">Daily Attempts</Heading>
              </CardHeader>
              <CardBody height="400px" overflow="hidden">
                <Bar
                  data={dailyAttemptsData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        min: 0,
                      },
                    },
                  }}
                />
              </CardBody>
            </Card>
          </GridItem>
          <GridItem colSpan={6}>
            <Card shadow="lg">
              <CardHeader>
                <Heading size="md" color="#130529">User Percentile</Heading>
              </CardHeader>
              <CardBody height="400px" overflow="hidden">
                <Line
                  data={percentileData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        min: 0,
                      },
                    },
                  }}
                />
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </Box>
    </PageWrapper>
  );
};

export default Dashboard;
