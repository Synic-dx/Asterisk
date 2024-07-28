"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useParams } from "next/navigation";
import {
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Box,
  Heading,
  Center,
  useToast,
} from "@chakra-ui/react";
import { setNewPasswordSchema } from "@/schemas/setNewPasswordSchema";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";

export default function SetNewPassword() {
  const router = useRouter();
  const toast = useToast();
  const params = useParams<{ token?: string }>(); // Make token optional
  const form = useForm({
    resolver: zodResolver(setNewPasswordSchema),
  });

  // Decode the token
  const resetToken = params.token ? decodeURIComponent(params.token) : '';

  const onSubmit = async (data: any) => {
    try {
      const response = await axios.post<ApiResponse>("/api/set-new-password", {
        password: data.password,
        resetToken, // Use decoded token
      });

      if (response.status === 200) {
        toast({
          title: "Password Updated",
          description: response.data.message,
          status: "success",
          duration: 5000,
          isClosable: true,
        });

        router.replace("/sign-in");
      } else {
        toast({
          title: "Update Failed",
          description: response.data.message ?? "An error occurred. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Update Failed",
        description:
          axiosError.response?.data.message ?? "An error occurred. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Center height="100vh">
      <Box
        width="full"
        maxWidth="md"
        p={8}
        bg="white"
        rounded="lg"
        shadow="2xl"
      >
        <Heading textAlign="center" mb={6}>
          Set New Password
        </Heading>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormControl isInvalid={!!form.formState.errors.password}>
            <FormLabel htmlFor="password">New Password</FormLabel>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...form.register("password")}
            />
            <FormErrorMessage>
              {typeof form.formState.errors.password?.message === 'string'
                ? form.formState.errors.password.message
                : 'An error occurred'}
            </FormErrorMessage>
          </FormControl>

          <FormControl
            isInvalid={!!form.formState.errors.confirmPassword}
            mt={4}
          >
            <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              {...form.register("confirmPassword")}
            />
            <FormErrorMessage>
              {typeof form.formState.errors.confirmPassword?.message === 'string'
                ? form.formState.errors.confirmPassword.message
                : 'An error occurred'}
            </FormErrorMessage>
          </FormControl>

          <Button mt={6} type="submit" colorScheme="teal" width="full">
            Set New Password
          </Button>
        </form>
      </Box>
    </Center>
  );
}
