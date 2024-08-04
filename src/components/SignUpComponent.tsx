"use client";

import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useDebounce } from "@uidotdev/usehooks";
import * as z from "zod";
import zxcvbn from "zxcvbn";
import {
  Box,
  Heading,
  Text,
  VStack,
  Flex,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input as ChakraInput,
  Checkbox,
  Spinner,
  Progress,
  useToast,
} from "@chakra-ui/react";
import { ApiResponse } from "@/types/ApiResponse";
import { signUpSchema } from "@/schemas/signUpSchema";

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUpForm() {
  const [userName, setUserName] = useState<string>("");
  const [userNameMessage, setUserNameMessage] = useState<string>("");
  const [isCheckingUserName, setIsCheckingUserName] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const [passwordFeedback, setPasswordFeedback] = useState<string>("");
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);
  const debouncedUserName = useDebounce(userName, 300);
  const router = useRouter();
  const toast = useToast();

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      userName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const {
    formState: { errors, isSubmitting: formSubmitting },
    handleSubmit,
    register,
    watch,
  } = form;

  const password = watch("password");

  useEffect(() => {
    const checkUserNameUnique = async () => {
      if (debouncedUserName) {
        setIsCheckingUserName(true);
        setUserNameMessage("");
        try {
          const response = await axios.get<ApiResponse>(
            `/api/check-username-unique?userName=${debouncedUserName}`
          );
          setUserNameMessage(response.data.message);
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          setUserNameMessage(
            axiosError.response?.data.message ?? "Error checking username"
          );
        } finally {
          setIsCheckingUserName(false);
        }
      }
    };
    checkUserNameUnique();
  }, [debouncedUserName]);

  useEffect(() => {
    if (password) {
      const { score, feedback } = zxcvbn(password);
      setPasswordStrength(score * 25); // Convert score to percentage
      setPasswordFeedback(feedback.suggestions.join(" "));
    } else {
      setPasswordStrength(0);
      setPasswordFeedback("");
    }
  }, [password]);

  const showToast = (
    status: "success" | "error" | "info" | "warning",
    message: string
  ) => {
    toast({
      title: status === "success" ? "Success" : "Error",
      description: message,
      status,
      position: "bottom-left",
      duration: 5000,
      isClosable: true,
      containerStyle: { maxWidth: "300px" },
    });
  };

  const onSubmit: SubmitHandler<SignUpFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post<ApiResponse>("/api/sign-up", data);
      showToast("success", response.data.message);
      router.replace(`/verify-email/${data.userName}`);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      showToast(
        "error",
        axiosError.response?.data.message ||
          "There was a problem with your sign-up. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to determine color based on password strength
  const getPasswordStrengthColor = (strength: number) => {
    if (strength < 25) return "red.500";
    if (strength < 60) return "yellow.500";
    return "green.500";
  };

  // Function to determine text based on password strength
  const getPasswordStrengthText = (strength: number) => {
    if (strength < 25) return "Password is weak";
    if (strength < 60) return "Password is moderate";
    return "Password is strong";
  };

  return (
    <Box
      w={{ base: "90vw", md: "80vw", lg: "60vw" }}
      maxW="400px"
      overflow="fit-content"
      mx="auto"
      mt="6"
      py="8"
      px={12}
      rounded="lg"
      shadow="md"
      bg="background"
      display="flex"
      flexDirection="column"
      gap={6}
    >
      <Heading
        as="h1"
        fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }}
        textAlign="center"
        fontFamily="Karla, sans-serif"
        color="#271144"
      >
        Sign Up
      </Heading>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <VStack spacing="3" align="start">
          <FormControl isInvalid={!!errors.userName} className="w-full">
            <FormLabel
              fontSize="xs"
              fontWeight="bold"
              textTransform="uppercase"
              color="#271144"
              fontFamily="Karla, sans-serif"
            >
              USERNAME
            </FormLabel>
            <ChakraInput
              {...register("userName")}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="SteveJobless"
              size="md"
              variant="outline"
              borderColor="gray.300"
              borderRadius="lg"
              _focus={{
                borderColor: "#271144",
                boxShadow: "0 0 0 1px #271144",
              }}
              fontSize="sm"
              px="4"
            />
            {isCheckingUserName ? (
              <Flex align="center" mt={2}>
                <Spinner mr="2" size="sm" color="#271144" thickness="2px" />
                <Text ml="2" fontSize="xs">
                  Checking...
                </Text>
              </Flex>
            ) : (
              userNameMessage && (
                <Text
                  mt="1"
                  fontSize="xs"
                  color={
                    userNameMessage === "Username is available"
                      ? "green.500"
                      : "red.500"
                  }
                >
                  {userNameMessage}
                </Text>
              )
            )}
            <FormErrorMessage>{errors.userName?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.email} className="w-full">
            <FormLabel
              fontSize="xs"
              fontWeight="bold"
              textTransform="uppercase"
              color="#271144"
              fontFamily="Karla, sans-serif"
            >
              EMAIL
            </FormLabel>
            <ChakraInput
              {...register("email")}
              type="email"
              placeholder="Example@Example.com"
              size="md"
              variant="outline"
              borderColor="gray.300"
              borderRadius="lg"
              _focus={{
                borderColor: "#271144",
                boxShadow: "0 0 0 1px #271144",
              }}
              fontSize="sm"
              px="4"
            />
            <Text fontSize="xs" color="gray.500" mt={1}>
              We will send you a verification code
            </Text>
            <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.password} className="w-full" mt={-1}>
            <FormLabel
              fontSize="xs"
              fontWeight="bold"
              textTransform="uppercase"
              color="#271144"
              fontFamily="Karla, sans-serif"
            >
              PASSWORD
            </FormLabel>
            <ChakraInput
              {...register("password")}
              type="password"
              placeholder="••••••••"
              size="md"
              variant="outline"
              borderColor="gray.300"
              borderRadius="lg"
              _focus={{
                borderColor: "#271144",
                boxShadow: "0 0 0 1px #271144",
              }}
              fontSize="sm"
              px="4"
            />
            <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
            {password && (
              <VStack spacing={1} align="start" mt={-2}>
                <Progress
                  value={passwordStrength}
                  size="sm"
                  colorScheme={getPasswordStrengthColor(passwordStrength)}
                />
                <Text
                  fontSize="xs"
                  color={getPasswordStrengthColor(passwordStrength)}
                >
                  {getPasswordStrengthText(passwordStrength)}
                </Text>
                {passwordFeedback && (
                  <Text fontSize="xs" color="gray.500">
                    {passwordFeedback}
                  </Text>
                )}
              </VStack>
            )}
          </FormControl>

          <FormControl
            isInvalid={!!errors.confirmPassword}
            className="w-full"
            mt={-1}
          >
            <FormLabel
              fontSize="xs"
              fontWeight="bold"
              textTransform="uppercase"
              color="#271144"
              fontFamily="Karla, sans-serif"
            >
              CONFIRM PASSWORD
            </FormLabel>
            <ChakraInput
              {...register("confirmPassword")}
              type="password"
              placeholder="••••••••"
              size="md"
              variant="outline"
              borderColor="gray.300"
              borderRadius="lg"
              _focus={{
                borderColor: "#271144",
                boxShadow: "0 0 0 1px #271144",
              }}
              fontSize="sm"
              px="4"
            />
            <FormErrorMessage>
              {errors.confirmPassword?.message}
            </FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.terms} className="w-full" mb={1}>
            <Checkbox
              {...register("terms", {
                required: "You must accept the terms and conditions",
              })}
              colorScheme="purple"
              isChecked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
            >
              <Text fontSize="xs" color="#271144">
                I agree to the{" "}
                <Link href="/terms-and-conditions">
                  <Button
                    variant="link"
                    _hover={{ textDecoration: "underline" }}
                    color="#271144"
                    fontSize="xs"
                  >
                    Terms & Conditions
                  </Button>
                </Link>
              </Text>
            </Checkbox>
            <FormErrorMessage>{errors.terms?.message}</FormErrorMessage>
          </FormControl>
        </VStack>

        <Button
          type="submit"
          w="full"
          bg="#271144"
          color="white"
          _hover={{ bg: "#3e1d55" }}
          fontFamily="Karla, sans-serif"
          fontSize="sm"
          loadingText="Signing Up..."
          isDisabled={!acceptedTerms || isSubmitting || formSubmitting}
          _disabled={{ bg: "rgba(39, 17, 68, 0.6)", cursor: "not-allowed" }}
        >
          {isSubmitting ? "Signing Up..." : "Sign Up"}
        </Button>
      </form>
    </Box>
  );
}
