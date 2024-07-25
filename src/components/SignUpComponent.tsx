"use client";

import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useDebounce } from "@uidotdev/usehooks";
import * as z from "zod";
import { Box, Heading, Text, VStack, Flex, Button } from "@chakra-ui/react";
import { Loader2 } from "lucide-react";
import { ApiResponse } from "@/types/ApiResponse";
import { signUpSchema } from "@/schemas/signUpSchema";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "./ui/use-toast";
import { Input } from "./ui/input";

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

  const { formState: { isValid, errors, isSubmitting: formSubmitting } } = form;

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
    <Box w={{base: '100vw', md: '40vw', lg: '30vw'}} maxW="500px" h={'75vh'} mx="auto" mt="8" p="8" rounded="lg" shadow="lg">
      <VStack spacing="6">
        <Heading as="h1" size="xl" textAlign="center">
          Sign up
        </Heading>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <VStack>
              <FormField
                name="userName"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <VStack>
                      <FormLabel>USERNAME</FormLabel>
                      <Input
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setUserName(e.target.value);
                        }}
                        placeholder="Steve Jobless"
                      />
                      {isCheckingUserName ? (
                        <Flex align="center">
                          <Loader2 className="animate-spin" />
                          <Text ml="2">Checking...</Text>
                        </Flex>
                      ) : (
                        userNameMessage && (
                          <Text
                            color={
                              userNameMessage === "Username is unique"
                                ? "green.500"
                                : "red.500"
                            }
                            mt="1"
                          >
                            {userNameMessage}
                          </Text>
                        )
                      )}
                      <FormMessage />
                    </VStack>
                  </FormItem>
                )}
              />

              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <VStack>
                      <FormLabel>EMAIL</FormLabel>
                      <Input
                        {...field}
                        type="email"
                        placeholder="Example@Example.com"
                      />
                      <Text fontSize="sm" color="gray.500">
                        We will send you a verification code
                      </Text>
                      <FormMessage />
                    </VStack>
                  </FormItem>
                )}
              />

              <FormField
                name="password"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <VStack>
                      <FormLabel>PASSWORD</FormLabel>
                      <Input
                        {...field}
                        type="password"
                        placeholder="••••••••"
                      />
                      <FormMessage />
                    </VStack>
                  </FormItem>
                )}
              />

              <FormField
                name="confirmPassword"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <VStack>
                      <FormLabel>CONFIRM PASSWORD</FormLabel>
                      <Input
                        {...field}
                        type="password"
                        placeholder="••••••••"
                      />
                      <FormMessage />
                    </VStack>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={!isValid || errors.confirmPassword !== undefined || formSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait
                  </>
                ) : (
                  "Sign Up"
                )}
              </Button>
            </VStack>
          </form>
        </Form>
        <Text textAlign="center">
          Already signed up?{" "}
          <Link href="/login">
            <Button variant="link">Sign in</Button>
          </Link>
        </Text>
      </VStack>
    </Box>
  );
}
