"use client";

import React, { useState } from "react";
import {
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useToast,
  VStack,
  Box,
  Heading,
  Text,
  Center,
  PinInput,
  PinInputField,
  Spinner,
  Input as ChakraInput,
} from "@chakra-ui/react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { unifiedSchema } from "../../../../schemas/unifiedSchema";

export default function ResetPassword() {
  const router = useRouter();
  const params = useParams<{ email?: string }>();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const email = decodeURIComponent(params.email ?? "");

  const form = useForm<z.infer<typeof unifiedSchema>>({
    resolver: zodResolver(unifiedSchema),
    defaultValues: {
      token: "",
      password: "",
      confirmPassword: "",
    },
  });

  const {
    formState: { errors },
    handleSubmit,
    register,
  } = form;

  const onSubmit = async (data: z.infer<typeof unifiedSchema>) => {
    setIsSubmitting(true);

    try {
      const response = await axios.post("/api/reset-password", {
        email,
        token: data.token,
        password: data.password,
      });

      if (response.data.success) {
        toast({
          title: "Success",
          description: response.data.message,
          status: "success",
          position: "top",
          duration: 5000,
          isClosable: true,
          containerStyle: {
            maxWidth: "100%",
            padding: "0 16px",
          },
        });
        router.push("/sign-in");
      } else {
        toast({
          title: "Error",
          description: response.data.message,
          status: "error",
          position: "top",
          duration: 5000,
          isClosable: true,
          containerStyle: {
            maxWidth: "100%",
            padding: "0 16px",
          },
        });
      }
    } catch (error) {
      let errorMessage = "An error occurred. Please try again.";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data.message ?? errorMessage;
      }

      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        position: "top",
        duration: 5000,
        isClosable: true,
        containerStyle: {
          maxWidth: "100%",
          padding: "0 16px",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Center height={{ base: "80vh", md: "80vh" }}>
      <Box
        width="full"
        maxWidth="md"
        p={8}
        bg="white"
        rounded="lg"
        shadow="2xl"
        fontFamily="'Gothic A1', sans-serif"
        mt={5}
      >
        <VStack spacing={6} align="center">
          <Heading
            size="lg"
            fontFamily="'Karla', sans-serif"
            fontWeight="bold"
            textAlign="center"
            color="#130529"
          >
            Verify Your Account
          </Heading>
          <Text fontFamily="'Karla', sans-serif" color="#130529">
            Enter the verification code sent to your email
          </Text>
          <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
            <FormControl isInvalid={!!errors.token} textAlign="center">
              <FormLabel
                htmlFor="verificationCode"
                color="#130529"
                fontFamily="'Karla', sans-serif"
                textAlign="center"
              >
                Verification Code
              </FormLabel>
              <Box display="flex" justifyContent="center" gap="8px">
                <PinInput
                  id="verificationCode"
                  otp
                  placeholder="•"
                  onChange={(value: string) => form.setValue("token", value)}
                >
                  <PinInputField aria-label="Digit 1" />
                  <PinInputField aria-label="Digit 2" />
                  <PinInputField aria-label="Digit 3" />
                  <PinInputField aria-label="Digit 4" />
                  <PinInputField aria-label="Digit 5" />
                  <PinInputField aria-label="Digit 6" />
                </PinInput>
              </Box>
              <FormErrorMessage color="#130529">
                {errors.token?.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.password} mt={4}>
              <FormLabel color="#130529" fontFamily="'Karla', sans-serif">
                New Password
              </FormLabel>
              <ChakraInput
                {...register("password")}
                type="password"
                placeholder="••••••••"
              />
              <FormErrorMessage color="#130529">
                {errors.password?.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.confirmPassword} mt={4}>
              <FormLabel color="#130529" fontFamily="'Karla', sans-serif">
                Confirm New Password
              </FormLabel>
              <ChakraInput
                {...register("confirmPassword")}
                type="password"
                placeholder="••••••••"
              />
              <FormErrorMessage color="#130529">
                {errors.confirmPassword?.message}
              </FormErrorMessage>
            </FormControl>

            <Button
              mt={4}
              bg="#271144"
              color="white"
              _hover={{ bg: "#130529" }}
              _active={{ bg: "#2A0557" }}
              type="submit"
              width="full"
              isDisabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner mr="2" size="sm" color="white" thickness="2px" />
                  Verifying...
                </>
              ) : (
                "Verify and Reset Password"
              )}
            </Button>
          </form>
        </VStack>
      </Box>
    </Center>
  );
}
