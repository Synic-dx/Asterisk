"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useToast } from "@chakra-ui/react";
import axios, { AxiosError } from "axios";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { verifySchema } from "@/schemas/verifySchema";
import {
  Box,
  Flex,
  Heading,
  Text,
} from "@chakra-ui/react";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";

export default function VerifyAccount() {
  const router = useRouter();
  const params = useParams<{ userName: string }>();
  const toast = useToast();
  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
  });

  const onSubmit = async (data: z.infer<typeof verifySchema>) => {
    try {
      const response = await axios.post<ApiResponse>(`/api/verify-email-code`, {
        userName: params.userName,
        code: data.verificationCode,
      });

      toast({
        title: "Success",
        description: response.data.message,
        status: "success",
        position: "bottom-left",
        duration: 5000,
        isClosable: true,
      });

      router.replace("/sign-in");
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Verification Failed",
        description:
          axiosError.response?.data.message ??
          "An error occurred. Please try again.",
        status: "error",
        position: "bottom-left",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex justify="center" align="center" minH="100vh">
      <Box w="full" maxW="md" p={8} gap={8} bg="white" borderRadius="lg" shadow="xl">
        <Flex direction="column" align="center">
          <Heading as="h1" size="2xl" mb={6} fontWeight="extrabold">
            Verify Your Account
          </Heading>
          <Text mb={4}>Enter the verification code sent to your email</Text>
        </Flex>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="verificationCode"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <InputOTP maxLength={6} {...field}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Verify</Button>
          </form>
        </Form>
      </Box>
    </Flex>
  );
}