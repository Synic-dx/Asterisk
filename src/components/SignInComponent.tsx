"use client";

import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useToast,
  Box,
  Heading,
  Text,
  VStack,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input as ChakraInput,
  Spinner,
} from "@chakra-ui/react";
import { signIn } from "next-auth/react";
import * as z from "zod";
import { signInSchema } from "@/schemas/signInSchema";
import axios from "axios";

type SignInFormData = z.infer<typeof signInSchema>;

export default function SignInForm() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isForgotPassword, setIsForgotPassword] = useState<boolean>(false);
  const [showEmailError, setShowEmailError] = useState<boolean>(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState<string>("");
  const router = useRouter();
  const toast = useToast();

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const {
    formState: { isValid, errors },
    handleSubmit,
    register,
    watch,
  } = form;

  const showToast = (
    status: "success" | "error" | "info" | "warning",
    message: string
  ) => {
    toast({
      title: status === "success" ? "Success" : "Error",
      description: message,
      status: status,
      position: "bottom-left",
      duration: 5000,
      isClosable: true,
      containerStyle: {
        maxWidth: "300px",
      },
    });
  };

  const onSubmit: SubmitHandler<SignInFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        // Check if the error message indicates email verification
        const errorMessage = result.error;
        if (errorMessage.includes("Please verify your email by visiting")) {
          const username = errorMessage.split("/verify-email/")[1];
          router.push(`/verify-email/${username}`);
        } else {
          showToast("error", errorMessage);
        }
      } else if (result?.url) {
        showToast(
          "success",
          "Sign in successful! Redirecting you to dashboard"
        );
        router.replace(`/dashboard`);
      }
    } catch (error) {
      showToast(
        "error",
        "There was a problem with your sign-in. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = watch("email");
    setIsForgotPassword(true); // Show spinner

    try {
      // Validate email using zod schema
      signInSchema.pick({ email: true }).parse({ email });
      setShowEmailError(false);

      try {
        // Call the API to request a password reset using Axios
        const response = await axios.post("/api/forgot-password", { email });

        if (response.status === 200) {
          showToast("success", "Password reset email sent successfully.");
          router.push(`/reset-password/${encodeURIComponent(email)}`);
        } else {
          showToast(
            "error",
            response.data.message ||
              "Failed to send password reset email. Please try again."
          );
        }
      } catch (error) {
        showToast(
          "error",
          "Failed to send password reset email. Please try again."
        );
      } finally {
        setIsForgotPassword(false); // Hide spinner
      }
    } catch (error) {
      setEmailErrorMessage("Please enter a valid email address.");
      setShowEmailError(true);
      setIsForgotPassword(false); // Hide spinner in case of error
    }
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
      flexDirection={"column"}
      gap={6}
    >
      <Heading
        as="h1"
        fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }}
        textAlign="center"
        fontFamily="Karla, sans-serif"
        color="#271144"
      >
        Sign In
      </Heading>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <VStack spacing="3" align="start">
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
            <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.password} className="w-full">
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
            <Text fontSize="xs" color="#271144" fontFamily="Roboto" mt={3}>
              {isForgotPassword && (
                <Spinner
                  mr={4}
                  size="sm"
                  color="#271144"
                  thickness="2px"
                  speed="0.65s"
                />
              )}
              <Button
                onClick={handleForgotPassword}
                variant="link"
                fontSize="xs"
                fontFamily="Roboto"
                color="#271144"
              >
                Forgot Password?
              </Button>
              {showEmailError && (
                <Text fontSize="xs" color="red.500" mt={2}>
                  {emailErrorMessage}
                </Text>
              )}
            </Text>
          </FormControl>

          <Button
            type="submit"
            isDisabled={isSubmitting}
            w="full"
            bg="#271144"
            color="white"
            _hover={{ bg: "#3e1d55" }}
            fontFamily="Karla, sans-serif"
            fontSize="sm"
            loadingText="Signing In..."
          >
            {isSubmitting ? (
              <>
                <Spinner mr="2" size="sm" color="white" thickness="2px" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </VStack>
      </form>
      <Text fontSize="xs" textAlign="center" fontFamily="Roboto">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up">
          <Button
            variant="link"
            fontSize="xs"
            fontFamily="Roboto"
            color="#271144"
          >
            Sign up
          </Button>
        </Link>
      </Text>
    </Box>
  );
}
