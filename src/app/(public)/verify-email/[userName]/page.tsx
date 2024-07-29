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
  Spinner,
} from "@chakra-ui/react";
import axios, { AxiosError } from "axios";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { verifySchema } from "@/schemas/verifySchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiResponse } from "@/types/ApiResponse";
import { useState } from "react";

export default function VerifyAccount() {
  const router = useRouter();
  const params = useParams<{ userName: string }>();
  const toast = useToast();
  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
  });

  const [isVerifying, setIsVerifying] = useState(false);

  const onSubmit = async (data: z.infer<typeof verifySchema>) => {
    setIsVerifying(true);

    // Debug logging to verify data
    console.debug("Form Data:", data);
    console.debug("Params:", params);

    try {
      const response = await axios.post<ApiResponse>(`/api/verify-email-code`, {
        userName: params.userName,
        token: data.token,
      });

      console.debug("API Response:", response.data);

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

      router.replace("/sign-in");
    } catch (error) {
      // Improved error logging
      console.error("Error during verification:", error);
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
    } finally {
      setIsVerifying(false);
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
            <VStack spacing={4} align="stretch">
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
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                  </PinInput>
                </Box>
                <FormErrorMessage
                  color="red.500"
                  textAlign="center"
                  mb={-3}
                >
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
                isDisabled={isVerifying}
                opacity={isVerifying ? 0.6 : 1} // Set opacity when verifying
              >
                {isVerifying ? (
                  <>
                    <Spinner size="sm" mr={2} />
                    Verifying...
                  </>
                ) : (
                  "Verify"
                )}
              </Button>
            </VStack>
          </form>
        </VStack>
      </Box>
    </Center>
  );
}
