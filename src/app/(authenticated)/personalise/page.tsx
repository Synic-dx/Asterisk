"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Flex,
  Box,
  Heading,
  Text,
  Input,
  Stack,
  Switch,
  Button,
  Spinner,
  useToast,
  Skeleton,
  Tooltip,
} from "@chakra-ui/react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useSession } from "next-auth/react";
import { FREE_SUBJECT_LIMIT } from "@/constants";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Define the Zod schema for password validation
const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(6, {
        message: "Your current password must be at least 6 characters long.",
      })
      .optional(),
    newPassword: z
      .string()
      .min(6, {
        message: "Your new password must be at least 6 characters long.",
      })
      .optional(),
    confirmPassword: z
      .string()
      .min(6, {
        message: "Confirm password must be at least 6 characters long.",
      })
      .optional(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirm password must match.",
    path: ["confirmPassword"],
  });

type FormData = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

type Subject = {
  subjectCode: string;
  subjectName: string;
  dateAdded: Date;
};

const PersonalisePage = () => {
  const { data: session, status } = useSession();
  const [enablePasswordChange, setEnablePasswordChange] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([]);
  const [toastShown, setToastShown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<FormData>({
    resolver: zodResolver(passwordSchema),
  });
  const toast = useToast();

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axios.get<Subject[]>("/api/get-all-subjects");
        setSubjects(response.data);
      } catch (error) {
        console.error("Error fetching subjects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  useEffect(() => {
    const fetchSelectedSubjects = async () => {
      try {
        const response = await axios.get<{ selectedSubjects: Subject[] }>(
          "/api/get-selected-subjects"
        );
        setSelectedSubjects(response.data.selectedSubjects);
        console.log("Selected subjects:", response.data.selectedSubjects);
      } catch (error) {
        console.error("Error fetching selected subjects:", error);
      }
    };

    if (session) {
      fetchSelectedSubjects();
    }
  }, [session]);

  const toggleHandler = (subject: Subject) => {
    const now = new Date();
    const twoMonthsAgo = new Date(now.setMonth(now.getMonth() - 2));

    // Check if the subject is not already selected and if the limit is reached
    if (
      !selectedSubjects.some((s) => s.subjectCode === subject.subjectCode) &&
      selectedSubjects.length >= FREE_SUBJECT_LIMIT
    ) {
      if (!toastShown) {
        toast({
          title: "Limit Reached",
          description:
            "You have reached the maximum number of subjects you can select. Upgrade to premium to select more.",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        setToastShown(true);
      }
      return;
    }

    // Check if the subject has been selected within the last 2 months
    if (
      selectedSubjects.some(
        (s) =>
          s.subjectCode === subject.subjectCode &&
          new Date(s.dateAdded) > twoMonthsAgo
      )
    ) {
      toast({
        title: "Cannot Unselect",
        description:
          "You can unselect a subject only 2 months after selecting it.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Update the list of selected subjects
    setSelectedSubjects((prevSelected) => {
      const isSelected = prevSelected.some(
        (s) => s.subjectCode === subject.subjectCode
      );

      if (isSelected) {
        // Remove the subject from the selected list
        return prevSelected.filter(
          (s) => s.subjectCode !== subject.subjectCode
        );
      } else {
        // Add the subject to the selected list
        return [...prevSelected, subject];
      }
    });
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsSubmitting(true);

    const previousSelectedSubjects = selectedSubjects.map((s) => s.subjectCode);

    const subjectsToUpdate = selectedSubjects.map((subject) => ({
      subjectName: subject.subjectName,
      subjectCode: subject.subjectCode,
      dateAdded: subject.dateAdded,
    }));

    const subjectsToDelete = previousSelectedSubjects.filter(
      (code) =>
        !selectedSubjects.some((s) => s.subjectCode === code) &&
        new Date(
          selectedSubjects.find((s) => s.subjectCode === code)?.dateAdded || 0
        ) <= new Date(new Date().setMonth(new Date().getMonth() - 2))
    );

    const payload: {
      subjectsToUpdate?: Subject[];
      subjectsToDelete?: string[];
      currentPassword?: string;
      newPassword?: string;
    } = {
      subjectsToUpdate,
      subjectsToDelete,
    };

    if (enablePasswordChange) {
      payload.currentPassword = data.currentPassword;
      payload.newPassword = data.newPassword;
    }

    let success = true;

    try {
      const response = await axios.put("/api/update-account-details", payload);

      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Your details have been updated.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        success = false;
        throw new Error("Failed to update details");
      }
    } catch (error) {
      console.error("Error updating details:", error);

      let errorMessage =
        "There was an error updating your details. Please try again.";
      if (axios.isAxiosError(error)) {
        console.error("Axios error response:", error.response);
        errorMessage = error.response?.data?.message || errorMessage;
      } else if (error instanceof Error) {
        console.error("General error message:", error.message);
        console.error("Stack trace:", error.stack);
        errorMessage = error.message;
      } else {
        console.error("Unknown error:", error);
      }

      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
    >
      <Box
        flex="2"
        p={8}
        boxShadow="lg"
        borderRadius="md"
        w={["100%", "100%", "60%"]}
        maxH="83vh"
        overflowY="scroll"
      >
        <Heading fontSize="xl" mb={5} color="#130529">
          Select Subjects
        </Heading>
        {loading ? (
          Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} height="50px" mb={2} borderRadius={6} />
          ))
        ) : subjects.length > 0 ? (
          subjects.map((subject) => (
            <Tooltip
              key={subject.subjectCode}
              label={
                selectedSubjects.some(
                  (s) =>
                    s.subjectCode === subject.subjectCode &&
                    new Date(s.dateAdded) >
                      new Date(new Date().setMonth(new Date().getMonth() - 2))
                )
                  ? "You can unselect a subject only 2 months after selecting it."
                  : ""
              }
              isDisabled={
                !selectedSubjects.some(
                  (s) =>
                    s.subjectCode === subject.subjectCode &&
                    new Date(s.dateAdded) >
                      new Date(new Date().setMonth(new Date().getMonth() - 2))
                )
              }
            >
              <Box
                p={4}
                mb={2}
                bg={
                  selectedSubjects.some(
                    (s) => s.subjectCode === subject.subjectCode
                  )
                    ? "#271144"
                    : "white"
                }
                color={
                  selectedSubjects.some(
                    (s) => s.subjectCode === subject.subjectCode
                  )
                    ? "white"
                    : "#271144"
                }
                borderWidth="1px"
                borderRadius="md"
                onClick={() => toggleHandler(subject)} // Pass the entire subject object
                fontFamily="Karla, sans-serif"
                _hover={{
                  bg: selectedSubjects.some(
                    (s) => s.subjectCode === subject.subjectCode
                  )
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
                    selectedSubjects.some(
                      (s) => s.subjectCode === subject.subjectCode
                    )
                      ? "white"
                      : "gray.600"
                  }
                >
                  {subject.subjectCode}
                </Text>
              </Box>
            </Tooltip>
          ))
        ) : (
          <Text>No subjects available.</Text>
        )}
      </Box>

      <Box
        flex="1"
        p={8}
        boxShadow="lg"
        borderRadius="md"
        w={["100%", "100%", "40%"]}
        maxH="fit-content"
      >
        <Heading fontSize="xl" mb={5} color="#130529">
          Change Account Details
        </Heading>
        <Stack spacing={4}>
          <Box>
            <Text color="#271144" fontFamily="Karla, sans-serif">
              Username
            </Text>
            <Input
              placeholder="Name"
              defaultValue={session.user?.userName || ""}
              bg="white"
              borderColor="#E2E8F0"
              _focus={{ borderColor: "#271144", boxShadow: "none" }}
              isDisabled
            />
          </Box>
          <Box>
            <Text color="#271144" fontFamily="Karla, sans-serif">
              Email Address
            </Text>
            <Input
              placeholder="Email"
              defaultValue={session.user?.email || ""}
              bg="white"
              borderColor="#E2E8F0"
              _focus={{ borderColor: "#271144", boxShadow: "none" }}
              isDisabled
            />
          </Box>
          <Box>
            <Text color="#271144" fontFamily="Karla, sans-serif">
              Change Password
            </Text>
            <Switch
              colorScheme="purple"
              isChecked={enablePasswordChange}
              onChange={() => setEnablePasswordChange(!enablePasswordChange)}
            />
          </Box>
          {enablePasswordChange && (
            <Box>
              <Text color="#271144" fontFamily="Karla, sans-serif">
                Current Password
              </Text>
              <Input
                type="password"
                placeholder="Current Password"
                {...register("currentPassword")}
                bg="white"
                borderColor="#E2E8F0"
                _focus={{ borderColor: "#271144", boxShadow: "none" }}
              />
              {errors.currentPassword && (
                <Text color="red.500" fontSize="sm">
                  {errors.currentPassword.message}
                </Text>
              )}
              <Box mt={4}>
                <Text color="#271144" fontFamily="Karla, sans-serif">
                  New Password
                </Text>
                <Input
                  type="password"
                  placeholder="New Password"
                  {...register("newPassword")}
                  bg="white"
                  borderColor="#E2E8F0"
                  _focus={{ borderColor: "#271144", boxShadow: "none" }}
                />
                {errors.newPassword && (
                  <Text color="red.500" fontSize="sm">
                    {errors.newPassword.message}
                  </Text>
                )}
              </Box>
              <Box mt={4}>
                <Text color="#271144" fontFamily="Karla, sans-serif">
                  Confirm New Password
                </Text>
                <Input
                  type="password"
                  placeholder="Confirm New Password"
                  {...register("confirmPassword")}
                  bg="white"
                  borderColor="#E2E8F0"
                  _focus={{ borderColor: "#271144", boxShadow: "none" }}
                />
                {errors.confirmPassword && (
                  <Text color="red.500" fontSize="sm">
                    {errors.confirmPassword.message}
                  </Text>
                )}
              </Box>
            </Box>
          )}
          <Button
            bg="#271144"
            color="white"
            _hover={{
              bg: "#271144",
              opacity: 0.7,
            }}
            onClick={handleSubmit(onSubmit)}
            isLoading={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner size="sm" mr={2} />
                Updating...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </Stack>
      </Box>
    </Flex>
  );
};

export default PersonalisePage;
