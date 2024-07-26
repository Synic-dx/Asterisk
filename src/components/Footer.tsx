import React from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  Image,
  useBreakpointValue,
} from "@chakra-ui/react";
import { FaEnvelope, FaYoutube, FaGithub } from "react-icons/fa";
import { IconContext } from "react-icons";
import { useRouter } from "next/navigation";

const Footer: React.FC = () => {
  const router = useRouter(); // Initialize the router
  const logo = "Images/Logo.svg";
  const bgColor = "#271144";
  const fontColor = "white";
  const headerFontSize = useBreakpointValue({ base: "20px", md: "24px" });
  const textFontSize = useBreakpointValue({ base: "14px", md: "14px" });
  const fontFamilyHeader = "'Gothic A1', sans-serif";
  const fontFamilyText = "'Karla', sans-serif";

  const socials = [
    { icon: FaEnvelope, link: "#", label: "Email" },
    { icon: FaYoutube, link: "#", label: "YouTube" },
    { icon: FaGithub, link: "#", label: "GitHub" },
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <Box bg={bgColor} color={fontColor} py={6} px={10} w={"100vw"} mt={5}>
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-around"
        align="center"
        px={{ base: 4, md: 8 }}
      >
        <Flex
          direction={{ base: "column", md: "row" }}
          align="center"
          gap={5}
          mb={{ base: 6, md: 0 }}
        >
          <Image
            src="/Images/Logo.svg"
            alt="Asterisk Logo"
            boxSize={{ base: "100px", md: "200px" }}
            draggable={false}
          />
          <Box w={{ base: "100%", md: "30vw" }}>
            <Text
              fontFamily={fontFamilyHeader}
              fontSize={headerFontSize}
              mb={4}
              textAlign={{ base: "center", md: "left" }}
              fontWeight={"500"}
            >
              Asterisk
            </Text>
            <Text
              fontFamily={fontFamilyText}
              fontSize={textFontSize}
              textAlign={{ base: "left", md: "left" }}
              mb={4}
            >
              All materials featured on this platform are unique and distinct
              from any copyrighted CAIE past papers, ensuring no copyright
              infringement.
            </Text>
          </Box>
        </Flex>
        <Flex direction="column" align="center">
          <Text
            fontFamily={fontFamilyHeader}
            fontWeight={"500"}
            fontSize={headerFontSize}
            mb={4}
            textAlign={{ base: "center", md: "left" }}
          >
            Contact
          </Text>
          <Flex
            w={{ base: "100%", md: "30vw" }}
            justify="center"
            align={"center"}
          >
            <IconContext.Provider value={{ size: "2.5em" }}>
              <Flex
                align="center"
                justify="space-around"
                w="100%"
                gap={{ base: 10, md: 0 }}
              >
                {socials.map((social, index) => (
                  <Button
                    key={index}
                    aria-label={social.label}
                    onClick={() => window.open(social.link, "_blank")}
                    variant="link"
                    color="inherit"
                    _hover={{
                      transform: "translateY(4px)",
                      transition: "transform 0.2s",
                    }}
                  >
                    <social.icon />
                  </Button>
                ))}
              </Flex>
            </IconContext.Provider>
          </Flex>
        </Flex>
      </Flex>
      <Flex
        direction={"row"}
        justify="center"
        align="center"
        mt={6}
        gap={4}
        fontSize={"10px"}
      >
        <Text textAlign="center">
          &copy; 2024. All rights reserved.
        </Text>
        <Button
          variant="link"
          fontSize={"10px"}
          onClick={() => handleNavigation("/privacy-policy")}
          color="#ffffff"
          _hover={{ textDecoration: "underline" }}
        >
          Privacy Policy
        </Button>
        <Button
          variant="link"
          fontSize={"10px"}
          onClick={() => handleNavigation("/terms-and-conditions")}
          color="#ffffff"
          _hover={{ textDecoration: "underline" }}
        >
          Terms & Conditions
        </Button>
      </Flex>
    </Box>
  );
};

export default Footer;
