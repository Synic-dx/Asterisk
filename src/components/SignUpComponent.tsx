"use client";

import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useDebounce } from "@uidotdev/usehooks";
import * as z from "zod";
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
} from "@chakra-ui/react";
import { Loader2 } from "lucide-react";
import { ApiResponse } from "@/types/ApiResponse";
import { signUpSchema } from "@/schemas/signUpSchema";
import { useToast } from "./ui/use-toast";

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUpForm() {
  const [userName, setUserName] = useState<string>("");
  const [userNameMessage, setUserNameMessage] = useState<string>("");
  const [isCheckingUserName, setIsCheckingUserName] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const debouncedUserName = useDebounce(userName, 300);

  const router = useRouter();
  const { toast } = useToast();

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
    formState: { isValid, errors, isSubmitting: formSubmitting },
    handleSubmit,
    register,
  } = form;

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

  const onSubmit: SubmitHandler<SignUpFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post<ApiResponse>("/api/sign-up", data);
      toast({
        title: "Success",
        description: response.data.message,
      });
      router.replace(`/verify-email/${data.userName}`);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage =
        axiosError.response?.data.message ||
        "There was a problem with your sign-up. Please try again.";
      toast({
        title: "Sign Up Failed",
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      w={{ base: "90vw", md: "80vw", lg: "60vw" }}
      maxW="400px"
      maxH="90vh"
      overflow="auto"
      mx="auto"
      mt="6"
      py="6"
      px={12}
      rounded="lg"
      shadow="xl"
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
              onChange={(e) => {
                setUserName(e.target.value);
              }}
              placeholder="Steve Jobless"
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
              <Flex align="center">
                <Loader2
                  className="animate-spin"
                  style={{ color: "#271144" }}
                />
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
                    userNameMessage === "Username is unique"
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
            <Text fontSize="xs" color="gray.500">
              We will send you a verification code
            </Text>
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
          </FormControl>

          <FormControl isInvalid={!!errors.confirmPassword} className="w-full">
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

          <Button
            type="submit"
            isDisabled={isSubmitting} // Only disable when submitting
            w="full"
            bg="#271144"
            color="white"
            _hover={{ bg: "#2c1446" }}
            fontFamily="Karla, sans-serif"
            fontSize="sm"
          >
            {isSubmitting ? (
              <>
                <Loader2
                  className="mr-2 h-4 w-4 animate-spin"
                  style={{ color: "white" }}
                />
                Please wait
              </>
            ) : (
              "Sign Up"
            )}
          </Button>
        </VStack>
      </form>
      <Text fontSize="xs" textAlign="center" fontFamily="Roboto">
        Already signed up?{" "}
        <Link href="/login">
          <Button
            variant="link"
            fontSize="xs"
            fontFamily="Roboto"
            color="#271144"
          >
            Sign in
          </Button>
        </Link>
      </Text>
    </Box>
  );
}
