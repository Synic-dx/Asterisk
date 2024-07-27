"use client";

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
} from "@chakra-ui/react";
import axios, { AxiosError } from "axios";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { verifySchema } from "@/schemas/verifySchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiResponse } from "@/types/ApiResponse";

export default function ResetPassword() {
  const router = useRouter();
  const params = useParams<{ email: string }>();
  const toast = useToast();
  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
  });

  const onSubmit = async (data: z.infer<typeof verifySchema>) => {
    try {
      console.log("Submitting verification:", {
        email: params.email,
        token: data.token,
      });

      const response = await axios.post<ApiResponse>(
        `/api/verify-forgot-password-code`,
        {
          email: params.email,
          token: data.token, // Ensure correct field name
        }
      );

      console.log("API Response:", response.data);

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

        // Redirect with the token in the URL
        router.replace(`/set-new-password?token=${response.data.token}`);
      } else {
        toast({
          title: "Verification Failed",
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
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Verification Failed",
        description:
          axiosError.response?.data.message ??
          "An error occurred. Please try again.",
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
  };

  return (
    <Center height={{ base: "60vh", md: "100vh" }}>
      <Box
        width="full"
        maxWidth="md"
        p={8}
        bg="white"
        rounded="lg"
        shadow="2xl"
        fontFamily="'Gothic A1', sans-serif"
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
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            style={{ width: "100%" }}
          >
            <FormControl
              isInvalid={!!form.formState.errors.token}
              textAlign="center"
            >
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
                {form.formState.errors.token?.message}
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
            >
              Verify
            </Button>
          </form>
        </VStack>
      </Box>
    </Center>
  );
}
