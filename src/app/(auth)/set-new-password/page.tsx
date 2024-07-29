"use client";

import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
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
  useToast,
} from "@chakra-ui/react";
import * as z from "zod";
import { setNewPasswordSchema } from "../../../schemas/setNewPasswordSchema"; // Update this path as needed
import axios from "axios";

type ResetPasswordFormData = z.infer<typeof setNewPasswordSchema>;

export default function ResetPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const router = useRouter();
  const toast = useToast();

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(setNewPasswordSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const {
    formState: { errors },
    handleSubmit,
    register,
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

  const onSubmit: SubmitHandler<ResetPasswordFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post("/api/set-new-password", data); // Adjust the endpoint as needed

      if (response.status === 200) {
        showToast("success", "Password reset successfully!");
        router.push("/sign-in"); // Redirect to login or another page after success
      } else {
        showToast("error", response.data.message || "Failed to reset password. Please try again.");
      }
    } catch (error) {
      showToast("error", "Failed to reset password. Please try again.");
    } finally {
      setIsSubmitting(false);
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
        Reset Password
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
              New Password
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
          </FormControl>

          <FormControl isInvalid={!!errors.confirmPassword} className="w-full">
            <FormLabel
              fontSize="xs"
              fontWeight="bold"
              textTransform="uppercase"
              color="#271144"
              fontFamily="Karla, sans-serif"
            >
              Confirm New Password
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
            <FormErrorMessage>{errors.confirmPassword?.message}</FormErrorMessage>
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
            loadingText="Resetting Password..."
          >
            {isSubmitting ? (
              <>
                <Spinner mr="2" size="sm" color="white" thickness="2px" />
                Resetting Password...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </VStack>
      </form>
    </Box>
  );
}
